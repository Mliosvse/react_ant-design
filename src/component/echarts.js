import React, { Component } from 'react';
import config from './echart.config'
import echarts from 'echarts/dist/echarts.common'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/visualMap'

class PieChart extends Component {
    /*** 初始化id id是随机生成的一串唯一的字符串*/
    constructor(props) {
        super(props)
        let id = ( '_' + Math.random()).replace('.','_');
        this.state = {
            pieId : 'pie' + id
        }
    }
    /*** 生成图表，主要做了一个判断，因为如果不去判断dom有没有生成，* 在后面如果定期去更新图表，每次生成一个dom节点会导致浏览器* 占用的cpu和内存非常高，踩过坑。* 这里的config就是引入的配置文件中的config,文件头部会有说明*/
    initPie(id) {
        let myChart = echarts.getInstanceByDom(document.getElementById(id));
        if( myChart === undefined){
            myChart = echarts.init(document.getElementById(id));
        }
        myChart.setOption(config.pieConfig)
    }
    componentDidMount() {
        //使用一个标志位_isMounted，在componentDidMount里设置为true,在componentWillUnmount里设置为false，仅当_isMounted为true即组件还未被卸载，才执行有关组件的代码。(lineChart组件采取的是另一种方式,解决此问题)
        this._isMounted = true;
        /* 在这里去调用生成图表的方法是因为，在组件加载后生成* dom节点，这个时候canvas才能根据id去绘制图表* 在这里去写了一个setTimeout修改了其中的一些数据，来*测试图表的刷新，是否刷新了，后期大家可能是定期去某* 接口中获取数据 方法同理*/
        // setTimeout(()=>{
        //     config.pieConfig.series[0].data = [
        //         {value:335, name:'中国'},
        //         {value:310, name:'美国'},
        //         {value:274, name:'英国'},
        //         {value:235, name:'俄罗斯'},
        //         {value:400, name:'法国'}
        //     ].sort(function (a, b) { return b.value - a.value; })
        //     this.initPie(this.state.pieId);
        // },1000);
        if(this._isMounted){
            this.initPie(this.state.pieId);
        }
    }

    //组件将被卸载
    componentWillUnmount(){
        this._isMounted = false;
    }

    render() {
        return (
            <div>
                <div id={this.state.pieId} style={{width: "100%", height: "400px"}}></div>
            </div>
        )
    }
}

class LineChart extends Component {
    /*** 初始化id id是随机生成的一串唯一的字符串*/
    constructor(props) {
        super(props)
        let id = ( '_' + Math.random()).replace('.','_');
        this.state = {
            pieId : 'pie' + id
        }
    }
    /*** 生成图表，主要做了一个判断，因为如果不去判断dom有没有生成，* 在后面如果定期去更新图表，每次生成一个dom节点会导致浏览器* 占用的cpu和内存非常高，踩过坑。* 这里的config就是引入的配置文件中的config,文件头部会有说明*/
    initPie(id) {
        //防止页面根据sessionStorage设置菜单栏,并自动跳转页面时,导致在调用initPie方法时,Piechart组件已经销毁,无法获取dom(initPie方法)
        if(document.getElementById(id)===null){
            return false;
        }
        //获取 dom 容器上的实例
        let myChart = echarts.getInstanceByDom(document.getElementById(id));
        if( myChart === undefined){
            myChart = echarts.init(document.getElementById(id));
        }
        myChart.setOption(config.lineConfig)
    }
    //* 在这里去调用生成图表的方法是因为，在组件加载后生成* dom节点，这个时候canvas才能根据id去绘制图表* 在这里去写了一个setTimeout修改了其中的一些数据，来* 测试图表的刷新，是否刷新了，后期大家可能是定期去某* 接口中获取数据，方法同理*/
    componentDidMount() {
        //使用一个标志位_isMounted，在componentDidMount里设置为true,在componentWillUnmount里设置为false，仅当_isMounted为true即组件还未被卸载，才执行有关组件的代码。
        this._isMounted = true;
        //此处getChartData为父组件传过来的promise对象,用于异步获取echarts数据
        let getChartData = this.props.chartData;
        //在获取到数据之后,配置echarts,并初始化图表
        getChartData.then((chartData)=>{
            config.lineConfig.xAxis[0].data = chartData.xAxisData;
            config.lineConfig.series = [{
                name: '放款金额',
                type: 'line',
                barGap: 0,
                data: chartData.series ? chartData.series.a : []
            }, {
                name: '回款金额',
                type: 'line',
                data: chartData.series ? chartData.series.b : []
            }];
            this.initPie(this.state.pieId);
        });
    }

    render() {
        return (
            <div style={{width:"100%"}}>
                <div id={this.state.pieId} style={{width: "100%", height: "400px"}}></div>
            </div>
        )
    }
}

class BarChart extends Component {
    /*** 初始化id id是随机生成的一串唯一的字符串*/
    constructor(props) {
        super(props)
        let id = ( '_' + Math.random()).replace('.','_');
        this.state = {
            pieId : 'pie' + id
        }
    }
    /*** 生成图表，主要做了一个判断，因为如果不去判断dom有没有生成，* 在后面如果定期去更新图表，每次生成一个dom节点会导致浏览器* 占用的cpu和内存非常高，踩过坑。* 这里的config就是引入的配置文件中的config,文件头部会有说明*/
    initPie(id) {
        //获取 dom 容器上的实例
        let myChart = echarts.getInstanceByDom(document.getElementById(id));
        if( myChart === undefined){
            myChart = echarts.init(document.getElementById(id));
        }
        myChart.setOption(config.barConfig)
    }
    //* 在这里去调用生成图表的方法是因为，在组件加载后生成* dom节点，这个时候canvas才能根据id去绘制图表* 在这里去写了一个setTimeout修改了其中的一些数据，来* 测试图表的刷新，是否刷新了，后期大家可能是定期去某* 接口中获取数据，方法同理*/
    componentDidMount() {
        //使用一个标志位_isMounted，在componentDidMount里设置为true,在componentWillUnmount里设置为false，仅当_isMounted为true即组件还未被卸载，才执行有关组件的代码。
        this._isMounted = true;
        //此处getChartData为父组件传过来的promise对象,用于异步获取echarts数据
        let getChartData = this.props.chartData;
        //在获取到数据之后,配置echarts,并初始化图表
        getChartData.then((chartData)=>{
            config.barConfig.xAxis[0].data = chartData.xAxisData;
            config.barConfig.series[0].data = chartData.series ? chartData.series.a : [];
            config.barConfig.series[1].data = chartData.series ? chartData.series.b : [];
            config.barConfig.series[2].data = chartData.series ? chartData.series.c : [];
            if(this._isMounted){
                this.initPie(this.state.pieId);
            }
        });
    }
    //组件将被卸载
    componentWillUnmount(){
        this._isMounted = false;
    }

    render() {
        return (
            <div style={{width:"100%"}}>
                <div id={this.state.pieId} style={{width: "100%", height: "400px"}}></div>
            </div>
        )
    }
}

export default {PieChart,LineChart,BarChart}

