import React from 'react'
import {Form, Input, Button, Col, Row, message, Select, Upload, Icon } from 'antd';
import PropTypes from 'prop-types'

const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;
//message弹框配置
message.config({
    top: 100,
    duration: 2,
});

//formItem,lable 和 表单控件样式配置
const formItemConfig = {
    labelCol: {
        span: 8,
        pull: 0
    },
    wrapperCol: {
        span: 8,
        pull: 0
    }
}
//获取上传图片的base64
function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}
//图片上传时调用的函数
function beforeUpload(file) {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('图片大小应该小于2M');
    }
    return isLt2M;
}


class MerchantInformation extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            options:[],   //所属代理商
            goodTypeArr:[],  //商品类型
            imageUrl:'',  //商户图标的url
            imageName:'',  //商户图标的url
            loading:'',  //商户图标上传loading
            userId:'',   //用户id
        };
        //绑定this.onShowSizeChange函数内部的this指向,(或者使用箭头函数,确保this指向正确,泪如表格提交事件)
        // this.onShowSizeChange = this.onShowSizeChange.bind(this);
    };
    componentWillMount() {
        this.getDataList();
    }
    componentDidMount() {
        //保存三级级菜单的路由,页面登录后重定向位置需要
        let thirdChild = this.props.route.path;
        window.sessionStorage.setItem("thirdChild",thirdChild);
        window.sessionStorage.setItem("locationSearch",this.props.location.search);
        //修改redux中路由栈信息,更新面包屑
        const store = window.reduxStore;
        let routes = store.getState();
        //如果redux中的routes为空,在sessionStorage获取
        if(routes.length!==0){
            routes[2]={path: thirdChild, breadcrumbName: "商户信息"};
        }else {
            routes = JSON.parse(window.sessionStorage.getItem('routes'));
            routes[2]={path: thirdChild, breadcrumbName: "商户信息"};
        }
        //备份在sessionStorage中,刷新页面redux的stores数据会重置(目前存在问题)
        window.sessionStorage.setItem('routes',JSON.stringify(routes));
        store.dispatch({ type: 'Breadcrumb',routes:routes});
        this.getData();
    }
    //组件将被卸载
    componentWillUnmount(){
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{
            return;
        };
    }
    //上传中、完成、失败都会调用这个函数
    handleChange = (info) => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        console.log(info);
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, imageUrl => this.setState({
                imageUrl,
                imageName:info.file.response.items[0],
                loading: false,
            }));
        }
    }
    //提交表单事件
    handleSearch = (e) => {
        e.preventDefault();
        this.searchData();

    };
    //获取下拉框数据
    getDataList=()=>{
        window.$http.post('/merchant/findMerchantAgent.json').then((res)=>{
            if(res.success){
                let options = [];
                let goodList = [];
                res.items.forEach((item,index)=>{
                    if(item){
                        options.push(<Option key={item.id} value={item.id}>{item.name}</Option>)
                    }
                });
                res.model.merchantCategory.forEach((item,index)=>{
                    if(item){
                        goodList.push(<Option key={item.id} value={item.id}>{item.name}</Option>)
                    }
                });
                this.setState({
                    options:options,
                    goodTypeArr:goodList
                });
            }
        })
    }
    //获取表单数据
    getData = ()=>{
        let queryData = this.props.location;
        let postData = {
            mobile:queryData.query.mobile
        }
        const {form} = this.props;
        window.$http.post('/merchant/findMerchantMobile.json', postData).then((res) => {
            if (res.success) {
                const dir = "/picture/";
                form.setFieldsValue({
                    mobile: res.data.mobile || '',
                    auditState: res.data.auditState.value|| '',
                    type: res.data.type ? res.data.type.value : "",
                    goodType: res.data.categoryId ? res.data.categoryId : "",
                    name: res.data.name || '',
                    address: res.data.address || '',
                    businessDate: res.data.businessDate || '',
                    introduce: res.data.introduce || '',
                    longitude: res.data.longitude || '',
                    latitude: res.data.latitude || '',
                    agentId: res.data.agentId || '',
                });
                this.setState({
                    imageUrl:res.data.icon ? dir + res.data.icon : "",
                    imageName:res.data.icon ? res.data.icon : "",
                    userId:res.data.userId
                })
            } else {
                message.error(res.message);
            }
        });
    }
    //保存表单数据
    searchData= ()=> {
        const {form} = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                let postData = {
                    name: values.name,             //商户名称
                    auditState: values.auditState,     //认证状态
                    mobile: values.mobile,              //手机号
                    agentId: values.agentId,                  //所属代理商
                    type: values.type,              //商户类型
                    categoryId: values.goodType,            //商品类型
                    address: values.address,            //商户地址
                    businessDate: values.businessDate,     //营业时间
                    introduce: values.introduce,        //商户简介
                    latitude: values.latitude,      //经度
                    longitude: values.longitude,        //纬度
                    userId: this.state.userId,   //用户id
                    icon: this.state.imageName,   //用户图标
                };
                window.$http.post('/merchant/updateMerchant.json', postData).then((res) => {
                    if (res.success) {
                        message.success('修改成功');
                        //设置面包屑(相关)
                        window.sessionStorage.setItem("thirdChild",'');
                        //修改redux中路由栈信息,更新面包屑
                        const store = window.reduxStore;
                        let routes = store.getState();
                        routes.splice(2);
                        store.dispatch({ type: 'Breadcrumb',routes:routes});
                        window.sessionStorage.setItem('routes',JSON.stringify(routes));
                        this.context.router.push("merchantManagement");
                    } else {
                        message.error(res.message);
                    }
                });
            }
        });
    };
    //清空表单
    handleReset = () => {
        this.props.form.resetFields();
    };
    render (){
        const { getFieldDecorator } = this.props.form;
        const options = this.state.options;
        const goodTypeArr =this.state.goodTypeArr;
        //上传控件中的上传按钮
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">上 传</div>
            </div>
        );
        const imageUrl = this.state.imageUrl;
        return (
           <div>
               <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
                   <Row>
                       <Col span={24}>
                           <FormItem label="认证状态" {...formItemConfig}>
                               {getFieldDecorator('auditState',{initialValue:'',
                                   rules: [{
                                       required: true,
                                       message: '请选择认证状态',
                                   }]
                               })(
                                   <Select placehoder='请选择'>
                                       <Option value="NOTPASS">未认证</Option>
                                       <Option value="PASS">已认证</Option>
                                       <Option value="CANCEL">取消认证</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="所属代理商" {...formItemConfig}>
                               {getFieldDecorator('agentId',{initialValue:''})(
                                   <Select placehoder='请选择'>
                                       {options}
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="商户类型" {...formItemConfig}>
                               {getFieldDecorator('type',{initialValue:'',
                                   rules: [{
                                       required: true,
                                       message: '请选择商户类型',
                                   }]
                               })(
                                   <Select placehoder='请选择'>
                                       <Option value="DICORATION_COMPANY">装修分期</Option>
                                       <Option value="BUILD_METERIAL">建材分期</Option>
                                       <Option value="OTHER">其他</Option>
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="商品类型" {...formItemConfig}>
                               {getFieldDecorator('goodType',{initialValue:'',
                                   rules: [{
                                       required: true,
                                       message: '请选择商品类型',
                                   }]
                               })(
                                   <Select placehoder='请选择'>
                                       {goodTypeArr}
                                   </Select>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="商户名称" {...formItemConfig}>
                               {getFieldDecorator('name',{initialValue:'',
                                   rules: [{
                                       required: true,
                                       message: '请填写商户名称',
                                   }]
                               })(
                                   <Input type="text" placeholder='' disabled></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="商户地址" {...formItemConfig}>
                               {getFieldDecorator('address',{initialValue:'',
                                   rules: [{
                                       required: true,
                                       message: '请填写商户地址',
                                   }]
                               })(
                                   <Input type="text" placeholder='' disabled></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="商户联系电话" {...formItemConfig}>
                               {getFieldDecorator('mobile',{initialValue:'',
                                   rules: [{
                                       required: true,
                                       message: '请填写商户联系电话',
                                   }]
                               })(
                                   <Input type="text" placeholder='' disabled></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="营业时间" {...formItemConfig}>
                               {getFieldDecorator('businessDate',{initialValue:''})(
                                   <Input type="text" placeholder='' ></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="经度" {...formItemConfig}>
                               {getFieldDecorator('longitude',{initialValue:''})(
                                   <Input type="text" placeholder='' ></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="纬度" {...formItemConfig}>
                               {getFieldDecorator('latitude',{initialValue:''})(
                                   <Input type="text" placeholder='' ></Input>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="商户图标" {...formItemConfig}>
                               {getFieldDecorator('iconUrl',{})(
                                   <Upload
                                       name="file"
                                       listType="picture-card"
                                       className="avatar-uploader"
                                       showUploadList={false}
                                       action="/upload/baseSave.json?childPath=douxin"
                                       beforeUpload={beforeUpload}
                                       onChange={this.handleChange}
                                   >
                                       {imageUrl ? <img style={{width:'120px',height:'120px'}} src={imageUrl} alt="avatar" /> : uploadButton}
                                   </Upload>
                               )}
                           </FormItem>
                       </Col>
                       <Col span={24}>
                           <FormItem label="商户简介" {...formItemConfig}>
                               {getFieldDecorator('introduce',{initialValue:''})(
                                   <TextArea></TextArea>
                               )}
                           </FormItem>
                       </Col>
                   </Row>
                   <Row>
                       <Col span={24} style={{ textAlign: 'center' }}>
                           <Button type="primary" htmlType="submit">保 存</Button>
                       </Col>
                   </Row>
               </Form>
           </div>
        );
    }
};
MerchantInformation.contextTypes={
    router: PropTypes.object.isRequired
}

MerchantInformation = Form.create()(MerchantInformation);
export default MerchantInformation