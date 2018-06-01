import React, { Component } from 'react';
import Charts from '../component/echarts'
import { Col, Row } from 'antd';
import style from '../styles/index.css'

const {PieChart,LineChart,BarChart} = Charts;

let beginDate = window.$util.myTimeIntervals(7)[0];
let endDate = window.$util.myTimeIntervals(7)[1];

class Index extends Component {
    constructor(prop){
        super(prop);
        this.state= {
            //获取charts数据函数的promise对象
            getChartData: "",
            getBarChartData: "",
            loanMoney:'',
            nowMoney:'',
            loanSumNumber:'',
            overdueNumber:'',
            overdueMoney:''
        }
    }
    componentWillMount(){
        //构造一个promise对象,将异步获取到的echart数据,通过prop 异步更新到子组件中
        let getChartData = new Promise((resolve, reject)=>{
            window.$http.post("/AfterLoan/payBackMoney.json",{
                begin:beginDate,
                end:endDate
            }).then((res)=>{
                this.setState({
                    loanMoney:res.data.loanMoney,
                    nowMoney:res.data.nowMoney,
                    loanSumNumber:res.data.loanSumNumber,
                    overdueNumber:res.data.overdueNumber,
                    OverdueMoney:res.data.OverdueMoney
                });
                //echart数据处理
                let chartData ={
                    xAxisData:[],
                    series:{a:[],b:[]}
                };
                res.data.payBackHistory.forEach((itme,index)=>{
                    chartData.xAxisData.push(itme.paybackDate);
                    chartData.series.a.push(itme.paybackMoney);
                });
                res.data.loanMoneyHistory.forEach((itme,index)=>{
                    chartData.series.b.push(itme.loanMoney);
                });
                resolve(chartData);
            }).catch((err)=>{
                reject(err);
            })
        });
        this.setState({getChartData});

        //构造一个promise对象,将异步获取到的echart数据,通过prop 异步更新到子组件中
        let getBarChartData = new Promise((resolve, reject)=>{
            window.$http.post("AfterLoan/countUser.json",).then((res)=>{
                let barChartData = {xAxisData:[],series:{a:[],b:[],c:[]}};
                for(let key in res.items[0]){
                    barChartData.xAxisData.unshift(key);
                    barChartData.series.a.unshift(res.items[0][key]);
                }
                for(let key in res.items[1]){
                    barChartData.series.b.unshift(res.items[1][key]);
                }
                for(let key in res.items[2]){
                    barChartData.series.c.unshift(res.items[2][key]);
                }
                resolve(barChartData);
            }).catch((err)=>{
                reject(err);
            })
        });
        this.setState({getBarChartData});

    }

    //组件将被卸载
    componentWillUnmount(){
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{
            return;
        };
    }

  render() {
    return (
      <div>
          <Row gutter={16}>
              <Col span={8}>
                  <div className={style.numData}>
                      <p className={style.suNumber}>放款总金额(元)：<span>{this.state.loanMoney}</span></p>
                      <p className={style.suNumber}>当前在贷金额(元) ：<span>{this.state.nowMoney}</span></p>
                      <p className={style.suNumber}>放款总人数(人) ：<span>{this.state.loanSumNumber}</span></p>
                      <p className={style.erNumber}>逾期总人数(人) ：<span>{this.state.overdueNumber}</span></p>
                      <p className={style.erNumber}>逾期总金额(元) ：<span>{this.state.OverdueMoney}</span></p>
                  </div>
              </Col>
              <Col span={16}>
                  <LineChart chartData={this.state.getChartData}></LineChart>
              </Col>
              <Col span={8} className={style.mt}>
                  <PieChart></PieChart>
              </Col>
              <Col span={16} className={style.mt}>
                  <BarChart chartData={this.state.getBarChartData}></BarChart>
              </Col>
          </Row>
      </div>
    );
  }
}

export default Index;
