import React from 'react'
import {Form, Input, Button, Col, Row, message, Select, Table } from 'antd';
import { Link } from  'react-router';

const Option = Select.Option;
const FormItem = Form.Item;
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
            totalNumber: '--',    //认证商户数量
        };
        //绑定this.onShowSizeChange函数内部的this指向,(或者使用箭头函数,确保this指向正确,泪如表格提交事件)
        // this.onShowSizeChange = this.onShowSizeChange.bind(this);
    };
    componentDidMount() {
        this.searchData();
        this.getCountMerchant();
    }
    //提交表单事件
    handleSearch = (e) => {
        e.preventDefault();
        this.searchData();

    };
    //查询表格数据
    searchData(page = 1, pageSize = 12) {
        const {form} = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                let postData = {
                    pageSize,
                    page,
                    name: values.name,             //商户名称
                    auditState: values.auditState,     //认证状态
                    mobile: values.mobile,              //手机号
                    type: values.type,                  //商户类型
                };
                window.$http.post('/merchant/findMerchant.json', postData).then((res) => {
                    if (res.success) {
                        let pagination = {...this.state.pagination};
                        pagination.total = res.total;
                        pagination.current = res.page;
                        pagination.pageSize = res.pageSize;
                        this.setState({
                            data: res.items,
                            pagination
                        });
                    } else {
                        message.error(res.message);
                    }
                });
            }
        });
    };
    //导出二维码
    batchExport = ()=>{
        const selectData = this.state.selectedRowKeys;
        let idList = selectData.join(',');
        if(idList===''){
            message.error("请勾选需要导出的商户!");
        }else {
            window.open("/merchant/batchExport.json?list="+idList);
        }
    }
    //获取认证商户数量
    getCountMerchant=()=>{
        window.$http.post('/merchant/findCountMerchant.json').then((res)=>{
            if(res.success===true){
                this.setState({
                    totalNumber:res.data
                });
            }else {
                message.error(res.message);
            }
        });
    }
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
        const columns = [{
            title: '注册时间',
            dataIndex: 'createDate',
        }, {
            title: '手机号',
            dataIndex: 'mobile',
            render: (text, record) => {
                return (
                    <Link to={
                        {
                            pathname:"/merchantManagement/merchantInformation",
                            query:{mobile:record.mobile},
                        }
                    } >{text}</Link>
                );
            }
        }, {
            title: '姓名',
            dataIndex: 'name',
        }, {
            title: '商户类型',
            dataIndex: 'auditState.text',
        }, {
            title: '商户名称',
            dataIndex: 'merchantName',
        }, {
            title: '认证状态',
            dataIndex: 'type.text',
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
                //selectedRowKeys:选中行KEY的集合,选中行所有数据的集合
                // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                this.setState({selectedRowKeys: selectedRowKeys});
            },
            //选择框的默认属性配置
            getCheckboxProps: record => ({
                disabled: record.auditState.value==="PASS"?false:true, // Column configuration not to be checked
                name: record.name,
            }),
        };
        return (
           <div>
               <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
                   <Row>
                       <Col span={24} style={{ lineHeight:'40px',color:'#000',marginTop:'-20px'}}>
                           已认证商户数量 <span style={{ color:"red"}}>{this.state.totalNumber}</span>
                       </Col>
                       <Col span={6}>
                           <FormItem label="商户类型" {...formItemConfig}>
                               {getFieldDecorator('type',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option value="">全部</Option>
                                       <Option value="BUILD_METERIAL">建材分期</Option>
                                       <Option value="DICORATION_COMPANY">装修分期</Option>
                                       <Option value="OTHER">其他</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="认证状态" {...formItemConfig}>
                               {getFieldDecorator('auditState',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       <Option value="">全部</Option>
                                       <Option value="PASS">已认证</Option>
                                       <Option value="NOTPASS">未认证</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="手机号" {...formItemConfig}>
                               {getFieldDecorator('mobile',{initialValue:''})(
                                   <Input type="text" placeholder='模糊查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="商户名称" {...formItemConfig}>
                               {getFieldDecorator('name',{initialValue:''})(
                                   <Input type="text" placeholder='模糊查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                   </Row>
                   <Row>
                       <Col span={24} style={{ textAlign: 'right' }}>
                           <Button type="primary" style={{ float:'left' }} onClick={this.batchExport}>导出二维码</Button>
                           <Button type="primary" htmlType="submit">搜 索</Button>
                           <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>清 空</Button>
                       </Col>
                   </Row>
                   <Table className='table' size="middle" rowSelection={rowSelection} columns={columns} dataSource={this.state.data} pagination={this.state.pagination} rowKey={row => row.userId} onChange={this.handleTableChange}/>
               </Form>
           </div>
        );
    }
};

OrderManagement = Form.create()(OrderManagement);

export default OrderManagement