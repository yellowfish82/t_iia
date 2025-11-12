import React from "react";
import { Button, message, Spin, Card } from 'antd';
import ReactEcharts from 'echarts-for-react';

import hub from '../../utilities/hub';

class KmeansAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true, option: null };
    }

    async componentDidMount() {
        try {
            this.setState({ loading: true });
            const { thing_id } = this.props.info;
            
            // 调用K-means聚类分析接口
            const kmeansData = await hub.kmeans(thing_id);
            console.log('K-means聚类数据:', kmeansData);
            
            const option = this.assembleKmeansOptions(kmeansData);
            this.setState({ loading: false, option });

        } catch (error) {
            console.log(error);
            message.error(`聚类分析失败: ${error}`);
            this.setState({ loading: false });
        }
    }

    assembleKmeansOptions = (data) => {
        // 假设后端返回的数据格式为：
        // { 
        //   clusters: [
        //     { name: '低负荷工况', data: [[rpm, power], ...], color: '#1890ff' },
        //     { name: '中负荷工况', data: [[rpm, power], ...], color: '#52c41a' },
        //     { name: '高负荷工况', data: [[rpm, power], ...], color: '#ff4d4f' }
        //   ],
        //   centroids: [[rpm, power], ...]
        // }
        
        const colors = ['#1890ff', '#52c41a', '#ff4d4f'];
        const clusterNames = ['低负荷工况', '中负荷工况', '高负荷工况'];
        
        // 构建系列数据
        const series = [];
        
        // 添加聚类数据点
        if (data.clusters) {
            data.clusters.forEach((cluster, index) => {
                series.push({
                    name: cluster.name || clusterNames[index] || `聚类 ${index + 1}`,
                    type: 'scatter',
                    data: cluster.data || [],
                    symbolSize: 8,
                    itemStyle: {
                        color: cluster.color || colors[index] || colors[0],
                        opacity: 0.7
                    },
                    emphasis: {
                        itemStyle: {
                            opacity: 1,
                            borderColor: '#333',
                            borderWidth: 2
                        }
                    }
                });
            });
        }
        
        // 添加聚类中心点
        if (data.centroids && data.centroids.length > 0) {
            series.push({
                name: '聚类中心',
                type: 'scatter',
                data: data.centroids,
                symbolSize: 15,
                symbol: 'diamond',
                itemStyle: {
                    color: '#722ed1',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                emphasis: {
                    itemStyle: {
                        color: '#531dab',
                        borderWidth: 3
                    }
                },
                z: 10
            });
        }

        const option = {
            title: {
                text: '主机工况聚类分析 (K-means)',
                left: 'center',
                textStyle: {
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    if (params.seriesName === '聚类中心') {
                        return `聚类中心<br/>转速: ${params.data[0]} rpm<br/>功率: ${params.data[1]} kW`;
                    }
                    return `${params.seriesName}<br/>转速: ${params.data[0]} rpm<br/>功率: ${params.data[1]} kW`;
                }
            },
            legend: {
                data: series.map(s => s.name),
                top: 30,
                type: 'scroll'
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
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        opacity: 0.3
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '主机功率 (kW)',
                nameLocation: 'middle',
                nameGap: 50,
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
            series: series
        };

        return option;
    }

    render() {
        const { loading, option } = this.state;
        
        return (
            <div>
                <Card 
                    title="主机工况聚类分析" 
                    style={{ margin: '16px 0' }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px' }}>正在进行聚类分析...</p>
                        </div>
                    ) : option ? (
                        <ReactEcharts
                            option={option}
                            style={{ height: '500px', width: '100%' }}
                            className="kmeans-analysis-chart"
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

export default KmeansAnalysis;
