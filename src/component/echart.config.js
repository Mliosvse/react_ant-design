let echartsConfig = {
    pieConfig:{
        backgroundColor: '#2c343c',
        title: {
            text: 'Customized Pie',
            left: 'center',
            top: 20,
            textStyle: {
                color: '#ccc'
            }
        },

        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },

        visualMap: {
            show: false,
            min: 80,
            max: 600,
            inRange: {
                colorLightness: [0, 1]
            }
        },
        series : [
            {
                name:'访问来源',
                type:'pie',
                radius : '55%',
                center: ['50%', '50%'],
                data:[
                    {value:335, name:'直接访问'},
                    {value:310, name:'邮件营销'},
                    {value:274, name:'联盟广告'},
                    {value:235, name:'视频广告'},
                    {value:400, name:'搜索引擎'}
                ].sort(function (a, b) { return a.value - b.value; }),
                roseType: 'radius',
                label: {
                    normal: {
                        textStyle: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#c23531',
                        shadowBlur: 200,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },

                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return Math.random() * 200;
                }
            }
        ]
    },
    lineConfig: {
        backgroundColor: '#f9f9f9',
        color: ['#4cabce','#ed7d31',],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        title: {
            top:10,
            text: '近30天资金流动',
            left:30,
            textStyle: {
                color: '#000'
            }
        },
        legend: {
            top:10,
            data: ['放款金额', '回款金额']
        },
        toolbox: {
            top:10,
            show : true,
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            axisTick: {
                show: false
            },
            data:['周一','周二','周三','周四','周五','周六','周日']
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: '放款金额',
            type: 'line',
            barGap: 0,
            data: [120, 132, 101, 134, 90, 230, 210]
        },{
            name: '回款金额',
            type: 'line',
            data: [150, 232, 201, 154, 190, 330, 410]
        }]
    },
    barConfig: {
        backgroundColor: '#f9f9f9',
        color: ['#ed7d31','#a5a5a5','#4cabce'],
        title: {
            top:10,
            text: '近十二个月放款人数',
            left: 20,
            textStyle: {
                color: '#000'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            top:10,
            data: ['放款人数', '老客户','新客户']
        },
        toolbox: {
            top:10,
            show : true,
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            axisTick: {
                show: false
            },
            data:['17.6','17.8']
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: '放款人数',
            type: 'bar',
            barGap: 0,
            data: [120, 132, 101, 134, 90, 230, 210]
        }, {
            name: '老客户',
            type: 'bar',
            data: [150, 232, 201, 154, 190, 330, 410]
        }, {
            name: '新客户',
            type: 'bar',
            data: [150, 232, 201, 154, 190, 330, 410]
        }]
    },
}

export default echartsConfig;
