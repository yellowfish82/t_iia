import React from "react";
import { Button, message, Spin, Card, DatePicker, Space } from 'antd';
import ReactEcharts from 'echarts-for-react';

import hub from '../../utilities/hub';

const { RangePicker } = DatePicker;
const moment = require('moment');

class VesselHealthIndex extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            loading: true, 
            option: null,
            dateRange: null
        };
    }

    async componentDidMount() {
        await this.loadHealthIndex();
    }

    loadHealthIndex = async (dateRange = null) => {
        try {
            this.setState({ loading: true });
            
            // 构建请求参数
            const params = {};
            if (dateRange && dateRange.length === 2) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }
            
            // 调用健康指数分析接口
            const healthData = await hub.vesselHealthIndex(params);
            console.log('健康指数数据:', healthData);
            
            const option = this.assembleHealthIndexOptions(healthData);
            this.setState({ loading: false, option });

        } catch (error) {
            console.log(error);
            message.error(`健康指数分析失败: ${error}`);
            this.setState({ loading: false });
        }
    }

    assembleHealthIndexOptions = (data) => {
        // 假设后端返回的数据格式为：
        // { 
        //   normalData: [[timestamp, healthIndex], ...],
        //   anomalyData: [[timestamp, healthIndex], ...],
        //   threshold: 0.8,
        //   statistics: { avgHealth, minHealth, maxHealth }
        // }
        
        const option = {
            title: {
                text: '船舶健康指数监测',
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
                    let result = `时间: ${moment(params[0].data[0]).format('YYYY-MM-DD HH:mm:ss')}<br/>`;
                    params.forEach(param => {
                        if (param.seriesName === '正常状态') {
                            result += `健康指数: ${param.data[1]}<br/>`;
                        } else if (param.seriesName === '异常点') {
                            result += `<span style="color: #ff4d4f;">异常健康指数: ${param.data[1]}</span><br/>`;
                        } else if (param.seriesName === '健康阈值') {
                            result += `健康阈值: ${param.data[1]}<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['正常状态', '异常点', '健康阈值'],
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
                type: 'time',
                name: '时间',
                nameLocation: 'middle',
                nameGap: 30,
                axisLabel: {
                    formatter: function (value) {
                        return moment(value).format('MM-DD HH:mm');
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '健康指数',
                nameLocation: 'middle',
                nameGap: 50,
                min: 0,
                max: 1,
                axisLabel: {
                    formatter: '{value}'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        opacity: 0.3
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    start: 0,
                    end: 100
                }
            ],
            series: [
                {
                    name: '正常状态',
                    type: 'line',
                    data: data.normalData || [],
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: '#8c8c8c',
                        width: 2
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(140, 140, 140, 0.3)'
                            }, {
                                offset: 1, color: 'rgba(140, 140, 140, 0)'
                            }]
                        }
                    }
                },
                {
                    name: '异常点',
                    type: 'scatter',
                    data: data.anomalyData || [],
                    symbolSize: 10,
                    itemStyle: {
                        color: '#ff4d4f',
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#cf1322',
                            borderWidth: 3
                        }
                    },
                    z: 10
                },
                {
                    name: '健康阈值',
                    type: 'line',
                    data: data.normalData ? data.normalData.map(item => [item[0], data.threshold || 0.8]) : [],
                    symbol: 'none',
                    lineStyle: {
                        color: '#faad14',
                        width: 2,
                        type: 'dashed'
                    }
                }
            ]
        };

        return option;
    }

    onDateRangeChange = (dates) => {
        this.setState({ dateRange: dates });
        this.loadHealthIndex(dates);
    }

    render() {
        const { loading, option, dateRange } = this.state;
        
        return (
            <div>
                <Card 
                    title="船舶健康指数监测" 
                    extra={
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={this.onDateRangeChange}
                                placeholder={['开始日期', '结束日期']}
                                format="YYYY-MM-DD"
                            />
                        </Space>
                    }
                    style={{ margin: '16px 0' }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px' }}>正在分析健康指数...</p>
                        </div>
                    ) : option ? (
                        <ReactEcharts
                            option={option}
                            style={{ height: '500px', width: '100%' }}
                            className="health-index-chart"
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

export default VesselHealthIndex;
