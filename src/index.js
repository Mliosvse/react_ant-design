import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import {LocaleProvider} from 'antd';
import {Router, Route, hashHistory, Redirect} from  'react-router';
import './utils/util';
import { get, post} from  './utils/request';
import './index.css';
import 'antd/dist/antd.css';
import HomeLayout from './layouts/HomeLayout';               //布局父组件
import Index from './pages/index';                           //首页组件(echart)
import App from './pages/App';                               //其他组件
import Login from './pages/login';                           //登录组件
import orderManagement from './pages/orderManagement';       //订单管理
import moneyOrder from './pages/moneyOrder';                 //资金指令
import orderbyOrder from './pages/orderbyOrder';             //支用订单
import OrderByOrderDetail from './pages/pagesComponent/orderbyOrderDetail';   //支用订单-订单详情
import claimList from './pages/claimList';                   //债权清单
import whiteList from './pages/whiteList';                   //白名单管理
import merchantManagement from './pages/merchantManagement'; //商户管理
import merchantInformation from './pages/pagesComponent/merchantInformation'; //商户管理->商户信息/新增商户
import registerServiceWorker from './registerServiceWorker';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

window.$http = {get,post};

//redux相关
function reducer(state = [], action) {
    switch (action.type) {
        case 'Breadcrumb':
            return action.routes
        default:
            return state
    }
}
let store = createStore(reducer);
window.reduxStore = store;


ReactDOM.render((
    <LocaleProvider locale={zhCN}>
        <Router history={hashHistory}>
            <Route path=''>
                <Redirect from="/" to="/login" />
            </Route>
            <Route path='/login' component={Login}></Route>
            <Route component={HomeLayout} >
                <Route path='/index' component={Index}></Route>
                <Route path='/orderManagement' component={orderManagement}></Route>
                <Route path='/moneyOrder' component={moneyOrder}></Route>
                <Route path='/orderbyOrder' component={orderbyOrder}></Route>
                <Route path='/orderbyOrder/OrderByOrderDetail' component={OrderByOrderDetail}></Route>
                <Route path='/claimList' component={claimList}></Route>
                <Route path='/merchantManagement' component={merchantManagement}></Route>
                <Route path='/merchantManagement/merchantInformation' component={merchantInformation}></Route>
                <Route path='/whiteList' component={whiteList}></Route>
                <Route path='/app' component={App}></Route>
                <Redirect from="/:id" to="/app" />
            </Route>
        </Router>
    </LocaleProvider>
), document.getElementById('root'));
registerServiceWorker();
