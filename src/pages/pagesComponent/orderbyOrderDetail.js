import React from 'react';
import { Button, Col, Row, message } from 'antd';
import PropTypes from 'prop-types'
import style from '../../styles/orderbyOrderDetail.css'

//message弹框配置
message.config({
    top: 100,
    duration: 2,
});

class OrderByOrderDetail extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            //在state中初始化表格数据
            resData: '',
            resModel: ''
        };
    };
    componentWillMount() {
        this.searchData();
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
            routes[2]={path: thirdChild, breadcrumbName: "订单详情"};
        }else {
            console.log(1);
            routes = JSON.parse(window.sessionStorage.getItem('routes'));
            routes[2]={path: thirdChild, breadcrumbName: "订单详情"};
        }
        //备份在sessionStorage中,刷新页面redux的stores数据会重置(目前存在问题)
        window.sessionStorage.setItem('routes',JSON.stringify(routes));
        store.dispatch({ type: 'Breadcrumb',routes:routes});
    }
    //组件将被卸载
    componentWillUnmount(){
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{
            return;
        };
    }

    //查询数据
    searchData = ()=>{
        let queryData = this.props.location;
        let postData = {
            no:queryData.query.no
        }
        window.$http.post('/loanOrder/loanOrdSuppor.json',postData).then((res)=>{
            console.log(this);
            if(res.success){
                this.setState({
                    resData:res.data,
                    resModel:res.model,
                });
            }else {
                message.error(res.message);
            }
        })
    };
    goBack = ()=>{
        window.sessionStorage.setItem("thirdChild",'');
        //修改redux中路由栈信息,更新面包屑
        const store = window.reduxStore;
        let routes = store.getState();
        routes.splice(2);
        store.dispatch({ type: 'Breadcrumb',routes:routes});
        window.sessionStorage.setItem('routes',JSON.stringify(routes));
        this.context.router.push("orderbyOrder");
    }

    render (){
        const no = this.props.location.query.no;
        const resData = this.state.resData;
        const resModel = this.state.resModel;
        let resDataArr = [];
        resDataArr.push({name:"支用来源",value:resData.source?resData.source.text:'--'});
        resDataArr.push({name:"贷款产品",value:resData.name});
        resDataArr.push({name:"类型",value:resData.type?resData.type.text:'--'});
        resDataArr.push({name:"姓名",value:resData.realname});
        resDataArr.push({name:"身份证号",value:resData.idCard});
        resDataArr.push({name:"手机号码",value:resData.mobile});
        resDataArr.push({name:"还款方式",value:resData.repaymentMethod?resData.repaymentMethod.text:'--'});
        resDataArr.push({name:"借款期限",value:resData.termNum});
        resDataArr.push({name:"借款金额",value:resData.agreementPrincipal});
        resDataArr.push({name:"借款利率",value:resData.rate});
        resDataArr.push({name:"服务费率",value:resData.serviceRate});
        resDataArr.push({name:"管理费率",value:resData.manageRate});
        const listItems = resDataArr.map((item,index) =>
            <Col className={style.obod_item} key={index} span={6}>{item.name}: <span className={style.obod_text}>{item.value}</span></Col>
        );
        return (
            <div>
                <Row>
                    <Col span={24}>订单号: <span className={style.obod_text}>{no}</span></Col>
                    <Col span={24}>
                        <h3 className={style.obod_title}>借款信息</h3>
                    </Col>
                    {listItems}
                </Row>
                {resModel.merchant ? (
                        <Row>
                            <Col span={24}>
                                <h3 className={style.obod_title}>商户信息</h3>
                            </Col>
                            <Col span={6}>商户名称: <span className={style.obod_text}>{resModel.merchant.name}</span></Col>
                            <Col span={6}>商户地址: <span className={style.obod_text}>{resData.merchant.address}</span></Col>
                        </Row>
                    ) : null
                }
                <Row>
                    <Col span={24}>
                        <h3 className={style.obod_title}>位置信息</h3>
                    </Col>
                    <Col className={style.obod_item} span={24}>支用申请位置: <span className={style.obod_text}>{resModel.address ? resModel.address.details : '--'}</span></Col>
                    <Col className={style.obod_item} span={24}><Button type="primary" onClick={this.goBack}>返 回</Button></Col>
                </Row>
            </div>
        );
    }
};
OrderByOrderDetail.contextTypes={
    router: PropTypes.object.isRequired
}

export default OrderByOrderDetail

