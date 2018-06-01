import React from 'react';
import { Link } from  'react-router';
import PropTypes from 'prop-types'
import { Icon, Layout, Menu, Breadcrumb } from 'antd';
import style from '../styles/homeLayout.css';

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class HomeLayout extends React.Component{
    constructor(prop){
        super(prop);
        this.state={
            openKeys:[],
            currentKey:['index'],
            //面包屑 router 的路由栈信息
            routes: [{path: 'index', breadcrumbName: '首页'}],
            collapsed: false,
            submenu:''
        }
    }

    onCollapse = (collapsed) => {
        this.setState({ collapsed });
    }

    onClickMenu = ( item, key, keyPath) =>{
        //设置面包屑
        let routes = [], name = '';
        //判断点击的是否为子菜单
        if (item.keyPath.length > 1) {
            name = item.item.props.children;
            routes.push({path: item.key, breadcrumbName: item.keyPath[1]});
            routes.push({path: item.key, breadcrumbName: name});
            //储存菜单选中状态
            window.sessionStorage.setItem('openKey',item.keyPath[1]);
            window.sessionStorage.setItem('currentKey',item.keyPath[0]);
        } else {
            name = item.item.props.children[1].props.children;
            routes.push({path: item.key, breadcrumbName: name});
            //储存菜单选中状态
            window.sessionStorage.setItem('openKey','');
            window.sessionStorage.setItem('currentKey',item.keyPath[0]);
        }
        window.sessionStorage.setItem('thirdChild','');
        //路由栈存储在到redux中,并备份在sessionStorage中,刷新页面redux的stores数据会重置
        const store = window.reduxStore;
        store.dispatch({ type: 'Breadcrumb',routes:routes });
        window.sessionStorage.setItem('routes',JSON.stringify(routes));
        //路由跳转
        this.context.router.push(item.key);
        // hashHistory.push(item.key);
    }

    componentWillMount(){
        //进入页面根据sessionStorage设置菜单栏
        let openKey = window.sessionStorage.getItem('openKey');
        let currentKey = window.sessionStorage.getItem('currentKey');
        let thirdChild = window.sessionStorage.getItem('thirdChild');
        if(currentKey){
            //如果三级 菜单不为空,则跳传三级菜单
            if(thirdChild){
                let serach = window.sessionStorage.getItem("locationSearch");
                this.context.router.push( {
                    pathname:thirdChild,
                    search:serach,
                });
            }else {
                this.context.router.push(currentKey);
            }
            //设置state值,更新菜单打开状态
            this.setState({
                openKey:[openKey],
                currentKey:[currentKey]
            });
        }
        //如果为空,初始化sessionStorage的routes值
        if(!window.sessionStorage.getItem('routes')){
            window.sessionStorage.setItem('routes',JSON.stringify(this.state.routes));
        }
    }

    componentDidMount() {
        //redux中获取信息,更新面包屑
        const store = window.reduxStore;
        let routes = store.getState();
        //监听rendux中routes变化来更新面包屑
        store.subscribe(() => {
                routes = store.getState();
                this.setState({routes});

            }
        );
        //redux为初始值[]时,在sessionStorage中取值,并写入redux
        if(routes.length===0){
            const routesElse = JSON.parse(window.sessionStorage.routes);
            if(routesElse){
                store.dispatch({ type: 'Breadcrumb',routes:routesElse });
            }
        }
    }

    render (){
        const {children} = this.props;
        const userName = window.localStorage.getItem('username');

        function itemRender(route, params, routes, paths) {
            // console.log(route);
            // console.log(params);
            // console.log(routes);
            // console.log(paths);
            // const last = routes.indexOf(route) === routes.length - 1;
            // return last ? <span>{route.breadcrumbName}</span> : <Link to={paths.join('/')}>{route.breadcrumbName}</Link>;
            return <span>{route.breadcrumbName}</span>

        }
        return(
            <Layout style={{height:"100%"}}>
                <Header className={style.header} style={{width: '100%' ,zIndex:"99"}}>
                    <Link to='/app'>兜信数据 | 代理商管理系统</Link>
                    <Link className={style.logout} to='/login'>{userName}  <Icon type="logout" /></Link>
                </Header>
                <Layout className={style.slide_menu}>
                    <Sider
                        collapsible
                        collapsed={this.state.collapsed}
                        onCollapse={this.onCollapse}
                        className={style.menu}
                        style={{backgroundColor:'#1a1e38'}}
                    >
                        <Menu theme="dark" defaultOpenKeys={this.state.openKey} defaultSelectedKeys={this.state.currentKey} mode="inline" onClick={this.onClickMenu}>
                            <Menu.Item key="index">
                                <Icon type="pie-chart"/>
                                <span>首页</span>
                            </Menu.Item>
                            <Menu.Item key="orderManagement">
                                <Icon type="pie-chart"/>
                                <span>訂單管理</span>
                            </Menu.Item>
                            <Menu.Item key="moneyOrder">
                                <Icon type="desktop"/>
                                <span>資金指令</span>
                            </Menu.Item>
                            <SubMenu
                                key="綜合查詢"
                                title={<span><Icon type="user"/><span>綜合查詢</span></span>}
                            >
                                <Menu.Item key="orderbyOrder">支用訂單</Menu.Item>
                                <Menu.Item key="claimList">債權清單</Menu.Item>
                            </SubMenu>
                            <SubMenu
                                key="客戶管理"
                                title={<span><Icon type="team"/><span>客戶管理</span></span>}
                            >
                                <Menu.Item key="merchantManagement">商戶管理</Menu.Item>
                                <Menu.Item key="whiteList">白名單管理</Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Sider>
                    <Content style={{margin: '0 16px'}}>
                        <Breadcrumb style={{margin: '16px 0'}} itemRender={itemRender} routes={this.state.routes}></Breadcrumb>
                        <div style={{padding: 24, background: '#ffffff', minHeight:'80%'}}>
                            {children}
                        </div>
                        <Footer style={{textAlign: 'center'}}>
                            ligo ©2018 Created by Ant UED
                        </Footer>
                    </Content>

                </Layout>
            </Layout>
        )
    }
}
HomeLayout.contextTypes={
    router: PropTypes.object.isRequired
}

export default HomeLayout