import React from "react";
import { message, Spin, Card, Row, Col } from 'antd';
import ReactEcharts from 'echarts-for-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import hub from '../../utilities/hub';

class SfocAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            option: null,
            sfocData: null
        };
    }

    async componentDidMount() {
        try {
            this.setState({ loading: true });
            const { thing_id } = this.props.info;

            // 调用SFOC分析接口
            const { sfoc } = await hub.sfoc(thing_id);

            const option = this.assembleSfocOptions(sfoc);
            this.setState({ loading: false, option, sfocData: sfoc });

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
        //   statistics: { avgSfoc, minSfoc, maxSfoc, minRpm, maxRpm }
        // }

        // console.log('assembleSfocOptions:', data);

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
                min: function (value) {
                    // 计算数据范围
                    const dataRange = value.max - value.min;
                    // 让数据占80%，左右各留10%的空间
                    const padding = dataRange * 0.1 / 0.8;
                    return Math.max(0, value.min - padding);
                },
                max: function (value) {
                    // 计算数据范围
                    const dataRange = value.max - value.min;
                    // 让数据占80%，左右各留10%的空间
                    const padding = dataRange * 0.1 / 0.8;
                    return value.max + padding;
                },
                axisLabel: {
                    formatter: '{value}'
                }
            },
            yAxis: {
                type: 'value',
                name: 'SFOC (g/kWh)',
                nameLocation: 'middle',
                nameGap: 50,
                min: function (value) {
                    // 计算数据范围
                    const dataRange = value.max - value.min;
                    // 让数据占80%，上下各留10%的空间
                    const padding = dataRange * 0.1 / 0.8;
                    return Math.max(0, value.min - padding);
                },
                max: function (value) {
                    // 计算数据范围
                    const dataRange = value.max - value.min;
                    // 让数据占80%，上下各留10%的空间
                    const padding = dataRange * 0.1 / 0.8;
                    return value.max + padding;
                },
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

    generateSfocReport = (sfocResult) => {
        console.log('generateSfocReport:', sfocResult);
        const { scatterData, statistics } = sfocResult;
        const { avgSfoc, minSfoc, maxSfoc } = statistics;

        const sfocRange = maxSfoc - minSfoc;
        const avgRpm = scatterData.reduce((a, [rpm]) => a + rpm, 0) / scatterData.length;

        const insights = [];

        // --- 整体水平判断 ---
        let levelText = "";
        if (avgSfoc < 170) {
            levelText = "💎 **效率极佳**（优于行业平均）";
        } else if (avgSfoc < 190) {
            levelText = "🟢 **效率良好**";
        } else if (avgSfoc < 210) {
            levelText = "🟡 **效率中等**";
        } else {
            levelText = "🔴 **效率偏低**（需关注燃油系统或推进效率）";
        }

        // --- 波动分析 ---
        if (sfocRange > 50) {
            insights.push("SFOC波动较大，说明推进系统负载或燃油供应存在不稳定因素。");
        } else if (sfocRange < 20) {
            insights.push("SFOC波动较小，运行稳定性良好。");
        }

        // --- 区间表现 ---
        const lowRpmSfoc = scatterData.filter(([rpm]) => rpm < avgRpm * 0.8).map(([, sfoc]) => sfoc);
        const highRpmSfoc = scatterData.filter(([rpm]) => rpm > avgRpm * 1.2).map(([, sfoc]) => sfoc);

        const avgLow = lowRpmSfoc.length ? lowRpmSfoc.reduce((a, b) => a + b, 0) / lowRpmSfoc.length : avgSfoc;
        const avgHigh = highRpmSfoc.length ? highRpmSfoc.reduce((a, b) => a + b, 0) / highRpmSfoc.length : avgSfoc;

        if (avgLow > avgSfoc * 1.1) {
            insights.push("低转速区间 ($rpm < 0.8\\\\bar{r}$) 下 SFOC 偏高，可能存在推进系统匹配或喷油延迟问题。");
        }
        if (avgHigh > avgSfoc * 1.1) {
            insights.push("高转速区间 ($rpm > 1.2\\\\bar{r}$) 下 SFOC 偏高，可能存在负载过高或温控问题。");
        }

        // --- 分析结果分成三个部分 ---
        const statisticsMarkdown = `| 指标 | 数值 | 单位 |
|:------|------:|:------:|
| 平均转速 $\\bar{r}$ | ${avgRpm.toFixed(1)} | rpm |
| 平均SFOC $\\bar{S}$ | ${avgSfoc.toFixed(1)} | g/kWh |
| 最小SFOC | ${minSfoc.toFixed(1)} | g/kWh |
| 最大SFOC | ${maxSfoc.toFixed(1)} | g/kWh |
| 波动范围 | ${sfocRange.toFixed(1)} | g/kWh |`;

        const conclusionMarkdown = `${levelText}`;

        const insightsMarkdown = `${insights.map((t, i) => `- ${t}`).join("\n\n")}${insights.length === 0 ? '运行状态稳定，未发现明显效率异常。' : ''}`;

        // --- 右侧固定内容 ---
        const formulaMarkdown = `## 关于 SFOC

**燃油效率（SFOC, Specific Fuel Oil Consumption）** 是衡量船舶主机系统燃油经济性的核心指标，表示单位功率输出所消耗的燃油量。

### 计算公式

$$SFOC = \\frac{\\dot{m}_f \\times 1000}{P_b}$$

**参数说明：**
- $\\dot{m}_f$ : 燃油流量 (kg/h)  
- $P_b$ : 主机功率 (kW)  
- **单位**：g/kWh

### 评估标准

| SFOC 范围 | 效率等级 | 说明 |
|:---------|:--------:|:-----|
| < 170 | 💎 优秀 | 燃油效率极佳，优于行业平均 |
| 170-190 | 🟢 良好 | 燃油效率良好 |
| 190-210 | 🟡 中等 | 燃油效率一般 |
| > 210 | 🔴 偏低 | 需关注燃油系统或推进效率 |

### 影响因素

- **主机负载**：负载变化直接影响燃油消耗率
- **转速匹配**：不同转速区间的效率表现
- **燃油系统**：喷油时机、燃油品质等
- **推进效率**：螺旋桨与主机的匹配程度
`;

        const markdownStyle = {
            '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '16px'
            },
            '& th, & td': {
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0'
            },
            '& th': {
                backgroundColor: '#fafafa',
                fontWeight: 'bold'
            }
        };

        const tableComponents = {
            table: ({ node, ...props }) => (
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '16px',
                }} {...props} />
            ),
            th: ({ node, ...props }) => (
                <th style={{
                    padding: '12px 16px',
                    backgroundColor: '#fafafa',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #d9d9d9',
                    textAlign: props.align || 'left'
                }} {...props} />
            ),
            td: ({ node, ...props }) => (
                <td style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    textAlign: props.align || 'left'
                }} {...props} />
            )
        };

        const statisticsCardStyle = {
            height: '320px', // 增加高度以显示完整表格
            overflow: 'auto'
        };

        const smallCardStyle = {
            height: '150px', // 较小高度适合结论和特征分析
            overflow: 'auto'
        };

        const statisticsBodyStyle = {
            height: 'calc(100% - 38px)',
            overflow: 'auto',
            padding: '16px'
        };

        const smallBodyStyle = {
            height: 'calc(100% - 37px)',
            overflow: 'auto',
            padding: '16px'
        };

        return {
            statistics: (
                <Card title="指标统计" size="small" style={statisticsCardStyle} bodyStyle={statisticsBodyStyle}>
                    <div style={markdownStyle}>
                        <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                            components={tableComponents}
                        >
                            {statisticsMarkdown}
                        </ReactMarkdown>
                    </div>
                </Card>
            ),
            conclusion: (
                <Card title="整体结论" size="small" style={smallCardStyle} bodyStyle={smallBodyStyle}>
                    <div style={markdownStyle}>
                        <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                            components={tableComponents}
                        >
                            {conclusionMarkdown}
                        </ReactMarkdown>
                    </div>
                </Card>
            ),
            insights: (
                <Card title="运行特征分析" size="small" style={smallCardStyle} bodyStyle={smallBodyStyle}>
                    <div style={markdownStyle}>
                        <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                            components={tableComponents}
                        >
                            {insightsMarkdown}
                        </ReactMarkdown>
                    </div>
                </Card>
            ),
            formulaInfo: (
                <Card title="SFOC 介绍" size="small">
                    <div style={markdownStyle}>
                        <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                            components={tableComponents}
                        >
                            {formulaMarkdown}
                        </ReactMarkdown>
                    </div>
                </Card>
            )
        };

    }


    render() {
        const { loading, option, sfocData } = this.state;

        let sfocReports = null;
        if (sfocData) sfocReports = this.generateSfocReport(sfocData);

        return (
            <div>
                <Card
                    title="燃油效率分析 (SFOC) - 回归拟合算法"
                    style={{ margin: '16px 0' }}
                >
                    <Row gutter={16}>
                        {/* 左侧：当前SFOC分析 */}
                        <Col span={16}>
                            {/* 第一行：分析卡片 */}
                            <Row gutter={16} style={{ marginBottom: '16px' }}>
                                <Col span={10}>
                                    {sfocReports && sfocReports.conclusion}
                                    <br />
                                    {sfocReports && sfocReports.insights}
                                </Col>
                                <Col span={14}>
                                    {sfocReports && sfocReports.statistics}
                                </Col>
                            </Row>

                            {/* 第二行：图表 */}
                            <Row>
                                <Col span={24}>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '50px' }}>
                                            <Spin size="large" />
                                            <p style={{ marginTop: '16px' }}>正在分析燃油效率数据...</p>
                                        </div>
                                    ) : option ? (
                                        <Card bordered={false} bodyStyle={{ padding: '16px' }}>
                                            <ReactEcharts
                                                option={option}
                                                style={{ height: '400px', width: '100%' }}
                                                className="sfoc-analysis-chart"
                                                notMerge={true}
                                                lazyUpdate={true}
                                                opts={{ renderer: 'canvas' }}
                                            />
                                        </Card>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '50px' }}>
                                            <p>暂无数据</p>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Col>

                        {/* 右侧：SFOC介绍 */}
                        <Col span={8}>
                            {sfocReports && sfocReports.formulaInfo}
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }
}

export default SfocAnalysis;
