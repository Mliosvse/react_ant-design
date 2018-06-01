import React from 'react'
import { post } from '../utils/request';
import {Form, Input, Button, DatePicker, Col, Row, message, Select, Table } from 'antd';
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
const otherformItemConfig = {
    labelCol: {
        span: 8,
        pull: 0
    },
    wrapperCol: {
        span: 16,
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
    searchData(page = 1,pageSize = 12,flag=false){
        const { form } = this.props;
        form.validateFields((err, values) => {
            if(!err){
                const rangeDate = values['rangeTime'];
                let postData={
                    pageSize,
                    page,
                    startTime: (rangeDate && rangeDate.length) ? rangeDate[0].format(dateFormat):'',   //开始时间
                    endTime: (rangeDate && rangeDate.length) ? rangeDate[1].format(dateFormat):'',      //结束时间
                    no: values.no,                      //债权编号
                    orderNo:values.orderNo,             //支用订单号
                    userMobile: values.userMobile,     //借款人手机
                    mobile: values.mobile,              //出资人手机号
                    cooperationPlatform: values.cooperationPlatform,    //合作平台
                    type: values.type,                  //还款方式
                    export: false,                  //是否导出
                };
                if(flag){
                    postData.export = true;
                    const params = window.$util.toQueryString(postData);
                    window.open("/creditorList/find.json?"+params);
                }else {
                    post('/creditorList/find.json',postData).then((res)=>{
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
                    });
                }
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

    render (){
        const { getFieldDecorator } = this.props.form;
        //通过moment.js设置开始和结束的默认日期
        const defaultDate = [moment().add(-1,'months'),moment()];
        const columns = [{
            title: '创建时间',
            dataIndex: 'createDate',
            render: text => <span>{text}</span>,
        }, {
            title: '支用编号',
            dataIndex: 'loanOrderNo',
        }, {
            title: '债权编号',
            dataIndex: 'no',
        }, {
            title: '姓名',
            dataIndex: 'name',
        }, {
            title: '手机号',
            dataIndex: 'mobile',
        }, {
            title: '借款金额',
            dataIndex: 'money',
        }, {
            title: '借款利率',
            dataIndex: 'interestRate',
        }, {
            title: '还款方式',
            dataIndex: 'repaymentMethod.text',
        }, {
            title: '还款日',
            dataIndex: 'repaymentDay',
        }, {
            title: '起息日',
            dataIndex: 'startDate',
        }, {
            title: '止息日',
            dataIndex: 'stopDate',
        }, {
            title: '计息方式',
            dataIndex: 'interestCalculation.text',
        }, {
            title: '身份证',
            dataIndex: 'idCard',
        }, {
            title: '期数',
            dataIndex: 'term',
        }, {
            title: '出资方',
            dataIndex: 'investorName',
        }, {
            title: '出资方手机',
            dataIndex: 'investorMobile',
        }, {
            title: '合作平台',
            dataIndex: 'cooperationPlatform',
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
                disabled: false, // Column configuration not to be checked
                name: record.name,
            }),
        };
        return (
           <div>
               <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
                   <Row>
                       <Col span={6}>
                           <FormItem label="创建日期：" {...formItemConfig}>
                               {getFieldDecorator('rangeTime',{initialValue:defaultDate})(
                                   <RangePicker style={{width:'inherit', marginTop: '2px'}} format="YYYY-MM-DD" placeholder={['开始日期','结束日期']}/>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="还款方式" {...formItemConfig}>
                               {getFieldDecorator('type',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option value="">全部</Option>
                                       <Option value="equal_PR">等额本金</Option>
                                       <Option value="expire_gen">到期还本付息</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="借款人手机号" {...otherformItemConfig}>
                               {getFieldDecorator('userMobile',{initialValue:''})(
                                   <Input type="number" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="支用订单号" {...otherformItemConfig}>
                               {getFieldDecorator('orderNo',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="债权编号" {...formItemConfig}>
                               {getFieldDecorator('no',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="合作平台" {...formItemConfig}>
                               {getFieldDecorator('cooperationPlatform',{initialValue:''})(
                                   <Input type="text" placeholder='模糊查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="出资方手机号" {...otherformItemConfig}>
                               {getFieldDecorator('mobile',{initialValue:''})(
                                   <Input type="number" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                   </Row>
                   <Row>
                       <Col span={24} style={{ textAlign: 'right' }}>
                           <Button type="primary" style={{ float:'left' }} onClick={() => {this.searchData(1,12,true)}}>导出</Button>
                           <Button type="primary" htmlType="submit">搜 索</Button>
                           <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>清 空</Button>
                       </Col>
                   </Row>
                   <Table scroll={{ x: 1800 }} className='table' size="middle" rowSelection={rowSelection} columns={columns} dataSource={this.state.data} pagination={this.state.pagination} rowKey={row => row.no} onChange={this.handleTableChange}/>
               </Form>
           </div>
        );
    }
};

OrderManagement = Form.create()(OrderManagement);

export default OrderManagement