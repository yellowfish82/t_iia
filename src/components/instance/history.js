import React from "react";
import { Button, message, Spin } from 'antd';
import ReactEcharts from 'echarts-for-react';

import hub from '../../utilities/hub';
import CONSTANT from '../../utilities/constant';

const moment = require('moment');

class AMHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true };
    }

    async componentDidMount() {
        try {
            this.setState({ loading: true });
            const { thing_id, property } = this.props.info;
            console.log(this.props.info);
            const { otData } = await hub.queryHistoryData(JSON.stringify({
                thing_id
            }));

            console.log(otData);
            const xData = [];
            const yData = [];

            otData.forEach((d) => {
                xData.push(moment(+d.timestamp).format('YYYY-MM-DD HH:mm:ss SSS'));
                const payload = JSON.parse(d.payload);
                yData.push(payload[property]);
            });

            const option = this.assembleEchartsOptions(xData, yData);

            this.setState({ loading: false, option });

        } catch (error) {
            console.log(error);
            message.error(`${error}`);
        }
    }

    assembleEchartsOptions = (xData, yData) => {
        // 过滤掉无效值，防止堆栈溢出
        const validData = yData.filter(val => val !== undefined && val !== null && !isNaN(val));

        // 如果没有有效数据，设置默认范围
        if (validData.length === 0) {
            console.warn('没有有效数据点');
            return {
                title: {
                    text: `${this.props.info.property} 历史趋势(无数据)`,
                    left: 'center'
                },
                xAxis: { type: 'category', data: [] },
                yAxis: { type: 'value' },
                series: [{ data: [], type: 'line' }]
            };
        }

        // 计算有效数据的最小值和最大值
        const minValue = validData.reduce(
            (min, v) => (v < min ? v : min),
            Number.POSITIVE_INFINITY
        );

        const maxValue = validData.reduce(
            (max, v) => (v > max ? v : max),
            Number.NEGATIVE_INFINITY
        );

        const valueSpan = maxValue - minValue;        
        const padding = valueSpan === 0 ? (Math.abs(minValue) * 0.1 || 1) : valueSpan * 0.1;
        
        // 计算Y轴范围，上下各扩展10%
        const yMin = minValue - padding;
        const yMax = maxValue + padding;
        
        // 计算实际扩展百分比，用于调试
        const actualPadding = (yMax - yMin - valueSpan) / 2;
        const actualPercentage = valueSpan === 0 ? 'N/A' : (actualPadding / valueSpan * 100).toFixed(1) + '%';

        // console.log(`数据范围: ${minValue} - ${maxValue}, 跨度: ${valueSpan}`); 
        // console.log(`Y轴范围: ${yMin} - ${yMax}, 实际扩展: ${actualPercentage}`);

        const option = {
            title: {
                text: `${this.props.info.property} 历史趋势`,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
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
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: xData,
                boundaryGap: false,
                axisLabel: {
                    rotate: 45,
                    formatter: function (value) {
                        return value.substring(11, 19); // 只显示时间部分
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '数值',
                min: yMin,
                max: yMax,
                axisLine: {
                    show: true
                },
                splitLine: {
                    show: true
                }
            },
            series: [
                {
                    name: this.props.info.property,
                    data: yData,
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    sampling: 'average',
                    itemStyle: {
                        color: '#0770FF'
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(7, 112, 255, 0.3)'
                            }, {
                                offset: 1, color: 'rgba(7, 112, 255, 0)'
                            }]
                        }
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均值' }
                        ]
                    }
                }
            ]
        };

        return option;
    }


    back = () => {
        this.props.viewNav(false);
    }

    renderPage = () => {
        const { option } = this.state;
        return (
            <div>
                <h2>{`查看属性 ${this.props.info.property} 趋势`}</h2>
                <Button onClick={this.back}>返回</Button>

                {option ?
                    <ReactEcharts
                        option={option}
                        style={{ height: '500px', width: '100%' }}
                        className="react_for_echarts"
                        notMerge={true}
                        lazyUpdate={true}
                        opts={{ renderer: 'canvas' }}
                    />
                    : <Spin />}


            </div>
        )
    }

    render() {
        // console.log(this.props.info);
        const page = this.renderPage();
        return (
            <div>
                {page}
            </div>
        );
    }

}

export default AMHistory;