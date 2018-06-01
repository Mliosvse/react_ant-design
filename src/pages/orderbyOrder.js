import React from 'react';
import {Form, Input, Button, DatePicker, Col, Row, message, Select, Table } from 'antd';
import { Link } from  'react-router';
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

class OrderByOrder extends React.Component {
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
                    borroweUserRealname:values.borroweUserRealname,        //借款人姓名
                    broMobile: values.broMobile,         //用户手机号
                    state: values.state,     //交易状态
                    no: values.no,        //支用订单编号
                    export: false,       //控制导出
                };
                if(flag){
                    postData.export = true;
                    var params = window.$util.toQueryString(postData);
                    window.open("/loanOrder/export.json?"+params);
                }else {
                    window.$http.post('/loanOrder/find.json',postData).then((res)=>{
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
            title: '订单编号',
            dataIndex: 'no',
            render: (text, record) => {
                return (
                    <Link to={
                        {
                            pathname:"/orderbyOrder/OrderByOrderDetail",
                            query:{no:record.no},
                        }
                    } >{text}</Link>
                );
            }
        }, {
            title: '使用奖券',
            dataIndex: 'awardName',
        }, {
            title: '贷款产品',
            dataIndex: 'loanProName',
        }, {
            title: '出资方',
            dataIndex: 'investorsName',
        }, {
            title: '借款人',
            dataIndex: 'broRealname',
        }, {
            title: '金额',
            dataIndex: 'money',
        }, {
            title: '状态',
            dataIndex: 'state.text',
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
                           <FormItem label="订单状态" {...formItemConfig}>
                               {getFieldDecorator('state',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option value="">全部</Option>
                                       <Option value="INIT">初始化</Option>
                                       <Option value="SUCCESS">成功</Option>
                                       <Option value="FAILURE">失败</Option>
                                       <Option value="CANCEL">已取消</Option>
                                       <Option value="AUDITING">审核中</Option>
                                       <Option value="UNPAY">待付款</Option>
                                       <Option value="BACKED">已回退</Option>
                                       <Option value="WAIT_INPUT_DATA">待激活</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="姓名" {...formItemConfig}>
                               {getFieldDecorator('borroweUserRealname',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="手机号" {...formItemConfig}>
                               {getFieldDecorator('broMobile',{initialValue:''})(
                                   <Input type="number" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="订单号" {...formItemConfig}>
                               {getFieldDecorator('no',{initialValue:''})(
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
                   <Table className='table' size="middle" columns={columns} dataSource={this.state.data} pagination={this.state.pagination} rowKey={row => row.no} onChange={this.handleTableChange}/>
               </Form>
           </div>
        );
    }
};

OrderByOrder = Form.create()(OrderByOrder);

export default OrderByOrder