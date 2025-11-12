import React from "react";
import { Button, message, Spin, Card } from 'antd';
import ReactEcharts from 'echarts-for-react';

import hub from '../../utilities/hub';

class SfocAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true, option: null };
    }

    async componentDidMount() {
        try {
            this.setState({ loading: true });
            const { thing_id } = this.props.info;
            
            // 调用SFOC分析接口
            const sfocData = await hub.sfoc(thing_id);
            console.log('SFOC分析数据:', sfocData);
            
            const option = this.assembleSfocOptions(sfocData);
            this.setState({ loading: false, option });

        } catch (error) {
            console.log(error);
            message.error(`SFOC分析失败: ${error}`);
            this.setState({ loading: false });
        }
    }

    assembleSfocOptions = (data) => {
        // 假设后端返回的数据格式为：
        // { 
        //   scatterData: [[rpm, sfoc], ...], 
        //   lineData: [[rpm, sfoc], ...],
        //   statistics: { avgSfoc, minSfoc, maxSfoc }
        // }
        
        const option = {
            title: {
                text: '燃油效率分析 (SFOC)',
                left: 'center',
                textStyle: {
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (params) {
                    let result = '';
                    params.forEach(param => {
                        if (param.seriesName === '实际数据') {
                            result += `转速: ${param.data[0]} rpm<br/>SFOC: ${param.data[1]} g/kWh<br/>`;
                        } else if (param.seriesName === '趋势线') {
                            result += `趋势SFOC: ${param.data[1]} g/kWh<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['实际数据', '趋势线'],
                top: 30
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%',
                top: '20%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                name: '主机转速 (rpm)',
                nameLocation: 'middle',
                nameGap: 30,
                axisLabel: {
                    formatter: '{value}'
                }
            },
            yAxis: {
                type: 'value',
                name: 'SFOC (g/kWh)',
                nameLocation: 'middle',
                nameGap: 50,
                axisLabel: {
                    formatter: '{value}'
                }
            },
            series: [
                {
                    name: '实际数据',
                    type: 'scatter',
                    data: data.scatterData || [],
                    symbolSize: 6,
                    itemStyle: {
                        color: '#1890ff',
                        opacity: 0.7
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#096dd9',
                            opacity: 1
                        }
                    }
                },
                {
                    name: '趋势线',
                    type: 'line',
                    data: data.lineData || [],
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: '#ff4d4f',
                        width: 2
                    }
                }
            ]
        };

        return option;
    }

    render() {
        const { loading, option } = this.state;
        
        return (
            <div>
                <Card 
                    title="燃油效率分析 (SFOC)" 
                    style={{ margin: '16px 0' }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px' }}>正在分析燃油效率数据...</p>
                        </div>
                    ) : option ? (
                        <ReactEcharts
                            option={option}
                            style={{ height: '500px', width: '100%' }}
                            className="sfoc-analysis-chart"
                            notMerge={true}
                            lazyUpdate={true}
                            opts={{ renderer: 'canvas' }}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <p>暂无数据</p>
                        </div>
                    )}
                </Card>
            </div>
        );
    }
}

export default SfocAnalysis;
