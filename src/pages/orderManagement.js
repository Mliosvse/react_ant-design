import React from 'react'
import { post } from '../utils/request';
import {Form, Input, Button, DatePicker, Col, Row, message, Select, Table, Modal } from 'antd';
import moment from 'moment';

//设置日期格式
const dateFormat = 'YYYY-MM-DD';

const Option = Select.Option;
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
//message弹框配置
message.config({
    top: 100,
    duration: 2,
});

//formItem,lable 和 表单控件样式配置
const formItemConfig = {
    labelCol: {
        span: 6,
        pull: 0
    },
    wrapperCol: {
        span: 18,
        pull: 0
    }
}
const modalFormItemConfig = {
    labelCol: {
        span: 5,
        pull: 0
    },
    wrapperCol: {
        span: 10,
        pull: 0
    }
}


class OrderManagement extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            //在state中初始化表格数据
            data: [],
            //配置表格分页参数
            pagination:{
                showSizeChanger:true,
                pageSizeOptions:['12','50','100']
                // onShowSizeChange:this.onShowSizeChange
            },
            selectedRowKeys: [], //配置被选中的row的默认值
            visible: false,    //modal框显示隐藏
        };
        //绑定this.onShowSizeChange函数内部的this指向,(或者使用箭头函数,确保this指向正确,泪如表格提交事件)
        // this.onShowSizeChange = this.onShowSizeChange.bind(this);
    };
    componentDidMount() {
        this.searchData();
    }
    //提交表单事件
    handleSearch = (e) => {
        e.preventDefault();
        this.searchData();

    };
    //查询表格数据
    searchData(page = 1,pageSize = 12){
        const { form } = this.props;
        form.validateFields((err, values) => {
            if(!err){
                const rangeDate = values['rangeTime'];
                let postData={
                    pageSize,
                    page,
                    startTime: (rangeDate && rangeDate.length) ? rangeDate[0].format(dateFormat):'',   //开始时间
                    endTime: (rangeDate && rangeDate.length) ? rangeDate[1].format(dateFormat):'',      //结束时间
                    no: values.no,        //订单号
                    name:values.name,        //姓名
                    mobile: values.mobile,     //手机号
                    productName:'',     //贷款产品
                    type: values.type,         //订单类型
                    state: values.state,       //状态
                };
                post('/order/find.json',postData).then((res)=>{
                    if(res.success){
                        let pagination = {...this.state.pagination};
                        pagination.total = res.total;
                        pagination.current = res.page;
                        pagination.pageSize = res.pageSize;
                        this.setState({
                            data:res.items,
                            pagination
                        });
                    }else {
                        message.error(res.message);
                    }
                })
            }
        });
    };
    //清空表单
    handleReset = () => {
        this.props.form.resetFields();
    };
    //分页、排序、筛选变化时触发
    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        this.setState({
            pagination: pager,
        });
        this.searchData(pagination.current,pagination.pageSize);

    };
    //显示modal框
    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    //隐藏modal框
    hideModal = () => {
        this.setState({
            visible: false,
        });
        console.log(this.props.form);
    };
    btnOk = ()=>{
        const { form } = this.props;
        form.validateFields((err, values) => {
            if(!err){
                let postData={
                   draw:values.result,
                   orderNoList : this.state.selectedRowKeys.join(",")
                };
                post('/order/doByPeople.json',postData).then((res)=>{
                    if(res.success){
                       this.hideModal();
                       message.success('处理成功')
                    }else {
                        message.error(res.message);
                    }
                })
            }
        });
    }
    render (){
        const { getFieldDecorator } = this.props.form;
        //通过moment.js设置开始和结束的默认日期
        const defaultDate = [moment().add(-1,'months'),moment()];
        const columns = [{
            title: '创建时间',
            dataIndex: 'createDate',
            render: text => <span>{text}</span>,
        }, {
            title: '订单号',
            dataIndex: 'no',
        }, {
            title: '发起人',
            dataIndex: 'name',
        }, {
            title: '订单类型',
            dataIndex: 'type.text',
        }, {
            title: '金额',
            dataIndex: 'money',
        }, {
            title: '状态',
            dataIndex: 'state.text',
        }];

        const { selectedRowKeys } = this.state;
        // rowSelection 选择功能的配置
        const rowSelection = {
            selectedRowKeys,                 //被选中项的key的集合,需要和onChange配合
            hideDefaultSelections: false,     //是否隐藏全选和反选选项
            //自定义如何选择CheckBox的配置项
            selections: [{
                key: 'odd',
                text: '选择偶数行',
                onSelect: (changableRowKeys) => {     //参数为所有能够被选择的行的key值集合
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return false;
                        }
                        return true;
                    });
                    this.setState({selectedRowKeys: newSelectedRowKeys});
                },
            }],
            // 选中项发生变化时的回调
            onChange: (selectedRowKeys, selectedRows) => {
                // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                this.setState({selectedRowKeys: selectedRowKeys});
            },
            //选择框的默认属性配置
            getCheckboxProps: record => ({
                disabled: record.type.value!=="MONEY_ISSUE"&&record.type.value!=="WITHHOLD", // Column configuration not to be checked
                name: record.name,
            }),
        };
        return (
           <div>
               <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
                   <Row>
                       <Col span={6}>
                           <FormItem label="创建时间：" {...formItemConfig}>
                               {getFieldDecorator('rangeTime',{initialValue:defaultDate})(
                                   <RangePicker style={{width:'inherit', marginTop: '2px'}} format="YYYY-MM-DD" placeholder={['开始日期','结束日期']}/>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="订单类型" {...formItemConfig}>
                               {getFieldDecorator('type',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option value="">全部</Option>
                                       <Option value="LOAN">放款</Option>
                                       <Option value="RECEIVABLES">收款</Option>
                                       <Option value="REPAYMENT">还款</Option>
                                       <Option value="PAY_BACK">回款</Option>
                                       <Option value="TRANSFER_GENERAL">划款订单</Option>
                                       <Option value="DRAW">提现</Option>
                                       <Option value="RECHARGE">充值</Option>
                                       <Option value="SETTLEMENT">结算</Option>
                                       <Option value="MERCHANT_RECEIVABLES">商户收款</Option>
                                       <Option value="REFUND">满兜还款</Option>
                                       <Option value="AgencyRECHARGE">代理充值</Option>
                                       <Option value="AgencyDRAW">代理提现</Option>
                                       <Option value="MONEY_ISSUE">借款发放</Option>
                                       <Option value="DRAWING">提现中</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="订单状态" {...formItemConfig}>
                               {getFieldDecorator('state',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option  value="">全部</Option>
                                       <Option  value="handing">处理中</Option>
                                       <Option  value="success">处理成功</Option>
                                       <Option  value="failure">处理失败</Option>
                                       <Option  value="unpay">未支付</Option>
                                       <Option  value="payment">支付中</Option>
                                       <Option  value="cancleing">取消中</Option>
                                       <Option  value="cancel">已取消</Option>
                                       <Option  value="preHanding">人工处理</Option>
                                       <Option  value="init">初始化</Option>
                                       <Option  value="faild">交易失败</Option>
                                       <Option  value="MONEY_DRAW">可用余额已提现</Option>
                                       <Option value="TO_USABLEMONEY">已发放至可用余额</Option>
                                       <Option  value="DRAWING">提现中</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="订单号" {...formItemConfig}>
                               {getFieldDecorator('no',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="姓名" {...formItemConfig}>
                               {getFieldDecorator('name',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="手机号" {...formItemConfig}>
                               {getFieldDecorator('mobile',{initialValue:''})(
                                   <Input type="number" placeholder='模糊查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                   </Row>
                   <Row>
                       <Col span={24} style={{ textAlign: 'right' }}>
                           <Button type="primary" style={{ float:'left' }} onClick={this.showModal}>人工处理</Button>
                           <Button type="primary" htmlType="submit">搜 索</Button>
                           <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>清 空</Button>
                       </Col>
                   </Row>
                   <Table className='table' size="middle" rowSelection={rowSelection} columns={columns} dataSource={this.state.data} pagination={this.state.pagination} rowKey={row => row.no} onChange={this.handleTableChange}/>
               </Form>
               <Modal title="人工处理" visible={this.state.visible} onOk={this.btnOk} onCancel={this.hideModal} okText="确认" cancelText="取消">
                   <Form className="ant-advanced-search-form">
                       <Row>
                           <FormItem label="订单类型" {...modalFormItemConfig}>
                               {getFieldDecorator('result', {initialValue: 'false'})(
                                   <Select placehoder='请选择'>
                                       <Option value="false">再次发起</Option>
                                       <Option value="true">已线下划扣</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Row>
                   </Form>
               </Modal>
           </div>
        );
    }
};

OrderManagement = Form.create()(OrderManagement);

export default OrderManagement