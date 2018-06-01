import React from 'react';
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
const otherFormItemConfig = {
    labelCol: {
        span: 8,
        pull: 0
    },
    wrapperCol: {
        span: 16,
        pull: 0
    }
}


class MoneyOrder extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            //在state中初始化表格数据
            data: [],
            //配置表格分页参数
            pagination:{
                showSizeChanger:true,
                pageSizeOptions:['12','50','100']

            }
        };
    };
    componentDidMount() {
        console.log(this);
        this.searchData();
    }
    //提交表单事件
    handleSearch = (e) => {
        e.preventDefault();
        this.searchData();

    };
    //导出按钮
    exportData = () =>{
        this.searchData(1,12,true);
    }
    //查询表格数据
    searchData=(page = 1,pageSize = 12,flag = false)=>{
        const { form } = this.props;
        form.validateFields((err, values) => {
            if(!err){
                const rangeDate = values['rangeTime'];
                let postData={
                    pageSize,
                    page,
                    beginTime: (rangeDate && rangeDate.length) ? rangeDate[0].format(dateFormat):'',   //创建时间
                    endTime: (rangeDate && rangeDate.length) ? rangeDate[1].format(dateFormat):'',      //结束时间
                    accountingType:values.accountingType,        //账户类型
                    type: values.type,         //指令类型
                    state: values.state,     //交易状态
                    orderNo: values.orderNo,     //订单号
                    no: values.no,        //指令编号
                    payeeAccountNo: values.payeeAccountNo,     //收款资金账户
                    payerAccountNo: values.payerAccountNo,     //放款资金账户
                    remark: values.remark,       //备注
                    export: false,       //控制导出
                };
                //根据flag判断是否需要导出
                if(flag){
                    postData.export=true;
                    const params = window.$util.toQueryString(postData);
                    window.open("/fundsCmd/find.json?"+params);
                }else {
                    window.$http.post('/fundsCmd/find.json',postData).then((res)=>{
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
        }, {
            title: '指令编号',
            dataIndex: 'no',
        }, {
            title: '账户类型',
            dataIndex: 'accountingType.text',
        }, {
            title: '指令类型',
            dataIndex: 'type.text',
        }, {
            title: '订单号',
            dataIndex: 'orderNo',
        }, {
            title: '收款资金账户',
            dataIndex: 'payeeAccountNo',
        }, {
            title: '放款资金账户',
            dataIndex: 'payerAccountNo',
        }, {
            title: '金额',
            dataIndex: 'money',
        }, {
            title: '状态',
            dataIndex: 'state.text',
        }, {
            title: '备注',
            dataIndex: 'remark',
        }];

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
                           <FormItem label="账户类型" {...formItemConfig}>
                               {getFieldDecorator('accountingType',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option value="">全部</Option>
                                       <Option value="SINGLE">单边</Option>
                                       <Option value="DOUBLE">双边</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="指令类型" {...otherFormItemConfig}>
                               {getFieldDecorator('type',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option  value="">全部</Option>
                                       <Option  value="ADD">加款</Option>
                                       <Option  value="SUB">减款</Option>
                                       <Option  value="TRANSFER">转账</Option>
                                       <Option  value="FREEZE">冻结</Option>
                                       <Option  value="UNFREEZE">解冻</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="交易状态" {...otherFormItemConfig}>
                               {getFieldDecorator('state',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option  value="">全部</Option>
                                       <Option  value="INIT">初始</Option>
                                       <Option  value="UNDERWAY">处理中</Option>
                                       <Option  value="SUCCESS">处理成功</Option>
                                       <Option  value="FAILURE">处理失败</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="订单号" {...formItemConfig}>
                               {getFieldDecorator('orderNo',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="指令编号" {...formItemConfig}>
                               {getFieldDecorator('no',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="收款资金编号" {...otherFormItemConfig}>
                               {getFieldDecorator('payeeAccountNo',{initialValue:''})(
                                   <Input type="text" placeholder='模糊查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="放款资金编号" {...otherFormItemConfig}>
                               {getFieldDecorator('payerAccountNo',{initialValue:''})(
                                   <Input type="text" placeholder='模糊查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="备注" {...formItemConfig}>
                               {getFieldDecorator('remark',{initialValue:''})(
                                   <Input type="text" placeholder='模糊查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                   </Row>
                   <Row>
                       <Col span={24} style={{ textAlign: 'right' }}>
                           <Button type="primary" style={{ float:'left' }} onClick={this.exportData}>导出</Button>
                           <Button type="primary" htmlType="submit">搜 索</Button>
                           <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>清 空</Button>
                       </Col>
                   </Row>
                   <Table className='table' size="middle" columns={columns} dataSource={this.state.data} pagination={this.state.pagination} rowKey={row => row.id} onChange={this.handleTableChange}/>
               </Form>
           </div>
        );
    }
};

MoneyOrder = Form.create()(MoneyOrder);

export default MoneyOrder