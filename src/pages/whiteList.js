import React from 'react'
import { post } from '../utils/request';
import {Form, Input, Button, Col, Row, message, Modal, Table, Select } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

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
            btnDisabled : true,   //删除按钮是否能点击
            visible: false,    //modal框显示隐藏
            confirmLoading: false,
            produList:[], //贷款产品名称列表
            modalRequired:false, //控制表单教验开启
        };
        //绑定this.onShowSizeChange函数内部的this指向,(或者使用箭头函数,确保this指向正确,泪如表格提交事件)
        // this.onShowSizeChange = this.onShowSizeChange.bind(this);
    };
    componentDidMount() {
        this.searchData();
        this.getProdulist();
    }
    //提交表单事件
    handleSearch = (e) => {
        e.preventDefault();
        this.searchData();
    };
    //查询表格数据
    searchData(page = 1, pageSize = 12) {
        const {form} = this.props;
        form.validateFields(["mobile","loanProductName"],(err, values) => {
            if (!err) {
                console.log(values);
                let postData = {
                    pageSize,
                    page,
                    idCard: '',
                    mobile: values.mobile,                        //手机号
                    loanProductName: values.loanProductName,     //贷款产品
                    userName: '',
                };
                post('/privilegewhitelist/pageList.json', postData).then((res) => {
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
    //获取贷款产品名称列表
    getProdulist = ()=>{
        let postData = {
            pageSize: 12,
            pageNo: 1,
            commodityManageName: '', //产品类型
            categoryName: '', //父贷款产品
            status: '' //状态
        };
        post('/loanProduct/find.json', postData).then((res) => {
            if(res.items) {
                let lists = [<Option key='key'  value="">全部</Option>];
                res.items.forEach(function (item,index) {
                    if(item.categoryName==='商户钱包'){
                        lists.push(<Option key={item.id} value={item.id}>{item.name}</Option>);
                    }
                })
                this.setState({
                    produList:lists
                })
            }
        })
    }
    //点击删除事件
    handDelete = ()=>{
        const selectRowIds = this.state.selectedRowKeys;
        const postData = {
            ids:selectRowIds.join(",")
        };
        post('/privilegewhitelist/delete.json', postData).then((res) => {
            if (res.success) {
               message.success("删除成功!");
               this.setState({selectedRowKeys: []});
               this.setState({btnDisabled:true});
               this.searchData();
            } else {
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
    //弹框事件
    showModal = () => {
        this.setState({
            visible: true,
            modalRequired:true
        });
    }
    handleOk = () => {
        const {form} = this.props;
        form.validateFields(["mobiles","loanProductId","remark"],(err,values)=>{
            console.log(this.state);
            console.log(err);
            console.log(values);
            if(!err){
                let phones = values.mobiles.replace(/\n/g, ',')
                var data = {
                    loanProductId: values.loanProductId,
                    mobiles: phones,
                    remark: values.remark
                }
                this.setState({
                    confirmLoading: true,
                });
                post('/privilegewhitelist/addWhite.json', data).then((res) => {
                    if(res.success){
                        this.setState({
                            visible: false,
                            confirmLoading: false,
                        });
                        this.searchData();
                        message.success('添加成功!');
                    }else {
                        message.error(res.message);
                    }
                    this.setState({
                        confirmLoading: false,
                    });
                });
            }
        })
    }
    handleCancel = () => {
        this.setState({
            visible: false,
            modalRequired:false
        });
    }

    render (){
        const { getFieldDecorator } = this.props.form;
        const { visible, confirmLoading } = this.state;
        const columns = [{
            title: '创建时间',
            dataIndex: 'createDate',
        }, {
            title: '手机号',
            dataIndex: 'mobile',
        }, {
            title: '贷款产品',
            dataIndex: 'loanProductName',
        }, {
            title: '备注',
            dataIndex: 'remark',
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
                if(selectedRowKeys.length===0){
                    this.setState({btnDisabled:true});
                }else {
                    this.setState({btnDisabled:false});
                }
                this.setState({selectedRowKeys: selectedRowKeys});
            },
            //选择框的默认属性配置
            getCheckboxProps: record => ({
                disabled: false, // Column configuration not to be checked
                name: record.name,
            }),
        };
        let modalVilidateMobile ={
            initialValue:'',
            rules:[{
                required: this.state.modalRequired,
                message: '请输入手机号码',
            }]
        }
        let modalVilidateName = {
            initialValue:'',
            rules:[{
                required: this.state.modalRequired,
                message: '请选择贷款产品名称',
            }]
        }

        return (
           <div>
               <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
                   <Row>
                       <Col span={6}>
                           <FormItem label="手机号" {...formItemConfig}>
                               {getFieldDecorator('mobile',{initialValue:''})(
                                   <Input type="number" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={6}>
                           <FormItem label="贷款产品" {...formItemConfig}>
                               {getFieldDecorator('loanProductName',{initialValue:''})(
                                   <Input type="text" placeholder='精确查询'></Input>
                               )}
                           </FormItem>
                       </Col>
                   </Row>
                   <Row>
                       <Col span={24} style={{ textAlign: 'right' }}>
                           <Button type="primary" style={{ float:'left' }} onClick={this.showModal}>新增</Button>
                           <Button type="primary" style={{ float:'left',marginLeft:"10px" }} disabled={this.state.btnDisabled} onClick={this.handDelete}>删除</Button>
                           <Button type="primary" htmlType="submit">搜 索</Button>
                           <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>清 空</Button>
                       </Col>
                   </Row>
                   <Table className='table' size="middle" rowSelection={rowSelection} columns={columns} dataSource={this.state.data} pagination={this.state.pagination} rowKey={row => row.id} onChange={this.handleTableChange}/>
                   <Modal title="新增白名单" visible={visible} onOk={this.handleOk} confirmLoading={confirmLoading} onCancel={this.handleCancel}>
                       <Row>
                           <Col span={22}>
                               <FormItem label="贷款产品名称" {...formItemConfig}>
                                   {getFieldDecorator('loanProductId', modalVilidateName)(
                                       <Select style={{width:'100%'}} placehoder='请选择'>
                                           {this.state.produList}
                                       </Select>
                                   )}
                               </FormItem>
                           </Col>
                           <Col span={22}>
                               <FormItem label="手机号" {...formItemConfig}>
                                   {getFieldDecorator('mobiles', modalVilidateMobile)(
                                       <TextArea></TextArea>
                                   )}
                               </FormItem>
                           </Col>
                           <Col span={22}>
                               <FormItem label="备注" {...formItemConfig}>
                                   {getFieldDecorator('remark', {initialValue: ''})(
                                       <TextArea></TextArea>
                                   )}
                               </FormItem>
                           </Col>
                       </Row>
                   </Modal>
               </Form>
           </div>
        );
    }
};

OrderManagement = Form.create()(OrderManagement);

export default OrderManagement