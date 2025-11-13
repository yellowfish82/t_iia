import React from "react";
import { message, Spin, Card, Row, Col, Tooltip } from 'antd';
import ReactEcharts from 'echarts-for-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

import hub from '../../utilities/hub';

class KmeansAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true, option: null, kmeansData: null };
    }

    async componentDidMount() {
        try {
            this.setState({ loading: true });
            const { thing_id } = this.props.info;

            // 调用K-means聚类分析接口
            const kmeansData = await hub.kmeans(thing_id);
            // console.log('K-means聚类数据:', kmeansData);

            this.setState({ loading: false, kmeansData });

        } catch (error) {
            console.log(error);
            message.error(`聚类分析失败: ${error}`);
            this.setState({ loading: false });
        }
    }

    generateKmeansReport = (kmeansResult) => {
        const { kmeans, avgRpm, avgPower, avgFuelFlow, totalPoints, clusterAnalysis } = kmeansResult;
        const { iterations, converged, centroids } = kmeans;

        // ===  ECharts数据 ===
        const scatterData = centroids.map((c, i) => ({
            name: `Cluster ${i + 1}`,
            value: c,
        }));

        // 计算数据范围
        const rpmValues = centroids.map(c => c[0]);
        const powerValues = centroids.map(c => c[1]);

        const rpmMin = Math.min(...rpmValues);
        const rpmMax = Math.max(...rpmValues);
        const powerMin = Math.min(...powerValues);
        const powerMax = Math.max(...powerValues);

        // 计算范围并扩展25%（让数据占80%空间）
        const rpmRange = rpmMax - rpmMin;
        const powerRange = powerMax - powerMin;
        const rpmBuffer = rpmRange * 0.125; // 12.5% on each side = 25% total buffer
        const powerBuffer = powerRange * 0.125;

        const chartOptions = {
            title: { text: "K-Means 聚类中心点", left: "center" },
            tooltip: {
                trigger: "item",
                formatter: (p) => {
                    const [rpm, power, fuel] = p.value;
                    return `
        <b>${p.seriesName}</b><br/>
        转速: ${rpm.toFixed(2)} RPM<br/>
        功率: ${power.toFixed(2)} MW<br/>
        燃油流量: ${fuel?.toFixed(2)} kg/s
        `;
                },
            },
            xAxis: {
                name: "转速 (RPM)",
                min: Math.max(0, rpmMin - rpmBuffer),
                max: rpmMax + rpmBuffer,
                axisLabel: {
                    formatter: (value) => Math.round(value)
                }
            },
            yAxis: {
                name: "功率 (MW)",
                min: Math.max(0, powerMin - powerBuffer),
                max: powerMax + powerBuffer,
                axisLabel: {
                    formatter: (value) => value.toFixed(1)
                }
            },
            dataZoom: [
                { type: "inside", xAxisIndex: 0 },
                { type: "slider", xAxisIndex: 0 },
                { type: "inside", yAxisIndex: 0 },
                { type: "slider", yAxisIndex: 0 },
            ],
            series: clusterAnalysis.map((cluster) => {
                const modeName = cluster.mode?.status || `模式${cluster.clusterId}`;
                const modeColor = cluster.mode?.color || '#1890ff';
                
                // 从centroids中找到对应的中心点数据
                const centroidData = centroids[cluster.clusterId];
                
                return {
                    name: modeName,
                    type: "scatter",
                    symbolSize: 14,
                    data: [[centroidData[0], centroidData[1], centroidData[2]]],
                    itemStyle: {
                        color: modeColor
                    }
                };
            }),
        };

        const kmeansIndroduction = `
### K-Means 聚类分析简介

K-Means 是一种 **无监督学习算法**，通过反复迭代，将样本自动分为若干个类别（Cluster）。
每个聚类的中心点（Centroid）代表一类典型的**设备运行模式**。

本次分析使用三个关键维度：
- 转速 \\( RPM \\)
- 功率 \\( Power \\)
- 燃油流量 \\( Fuel\\ Flow \\)

通过这些参数，我们可以识别：
1. 🟢 **节能运行区间**（低功率、低燃油）
2. 🟡 **常规巡航状态**
3. 🔴 **高负载运行区间**（功率高、燃油消耗大）
`;

        const kmeansConclusion = this.generateBusinessConclusion(clusterAnalysis, totalPoints);

        const kmeansAnalysisReport = this.determineOperatingMode(avgRpm, avgPower, avgFuelFlow, iterations, converged);

        const clusterChartOptions = this.generateClusterChartOption(clusterAnalysis);

        return {
            kmeansIndroduction,
            kmeansConclusion,
            kmeansAnalysisReport,
            chartOptions,
            clusterChartOptions,
        }
    }

    generateClusterChartOption = (clusterAnalysis) => {
        // 不再使用固定颜色数组，而是使用后端返回的颜色

        // 计算所有数据点的范围
        let allRpmValues = [];
        let allPowerValues = [];

        clusterAnalysis.forEach(cluster => {
            cluster.data.forEach(point => {
                allRpmValues.push(point[0]);
                allPowerValues.push(point[1]);
            });
            // 也包括聚类中心点
            allRpmValues.push(cluster.avgRpm);
            allPowerValues.push(cluster.avgPower);
        });

        const rpmMin = Math.min(...allRpmValues);
        const rpmMax = Math.max(...allRpmValues);
        const powerMin = Math.min(...allPowerValues);
        const powerMax = Math.max(...allPowerValues);

        // 计算范围并扩展25%（让数据占80%空间）
        const rpmRange = rpmMax - rpmMin;
        const powerRange = powerMax - powerMin;
        const rpmBuffer = rpmRange * 0.125; // 12.5% on each side = 25% total buffer
        const powerBuffer = powerRange * 0.125;

        // 生成 series
        const series = [];

        // 每个簇的散点
        clusterAnalysis.forEach((cluster, index) => {
            const modeName = cluster.mode?.status || `模式${cluster.clusterId}`;
            const modeColor = cluster.mode?.color || '#1890ff';
            
            series.push({
                name: `${modeName}`,
                type: 'scatter',
                symbolSize: 12,
                data: cluster.data, // 只包含 [rpm, power]
                itemStyle: { color: modeColor }
            });

            // 簇中心
            series.push({
                name: `${modeName} (中心点)`,
                type: 'scatter',
                symbolSize: 20,
                data: [[cluster.avgRpm, cluster.avgPower]],
                itemStyle: {
                    color: modeColor,
                    borderColor: '#000',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: `C${cluster.clusterId}`,
                    position: 'top'
                }
            });
        });

        const chartOptions = {
            title: { text: "K-Means 聚类分析", left: "center" },
            tooltip: {
                trigger: 'item',
                formatter: (p) => {
                    const [rpm, power] = p.value;
                    return `
        <b>${p.seriesName}</b><br/>
        转速: ${rpm.toFixed(1)} RPM<br/>
        功率: ${power.toFixed(1)} MW
      `;
                }
            },
            xAxis: {
                name: '转速 (RPM)',
                min: Math.max(0, rpmMin - rpmBuffer),
                max: rpmMax + rpmBuffer,
                axisLabel: {
                    formatter: (value) => Math.round(value)
                }
            },
            yAxis: {
                name: '功率 (MW)',
                min: Math.max(0, powerMin - powerBuffer),
                max: powerMax + powerBuffer,
                axisLabel: {
                    formatter: (value) => value.toFixed(1)
                }
            },
            dataZoom: [
                { type: 'inside', xAxisIndex: 0 },
                { type: 'slider', xAxisIndex: 0 },
                { type: 'inside', yAxisIndex: 0 },
                { type: 'slider', yAxisIndex: 0 },
            ],
            series
        };

        return chartOptions;
    }


    // 运行模式判断函数
    determineOperatingMode = (avgRpm, avgPower, avgFuelFlow, iterations, converged) => {

        // 算法执行信息的通用部分
        const algorithmInfo = `
**K-Means 算法执行信息：**
- 迭代次数：\\( ${iterations} \\) 次
- 收敛状态：${converged ? "✅ 已收敛" : "⚠️ 未收敛"}
- 聚类质量：${converged ? "算法成功收敛，聚类结果可靠" : "算法未完全收敛，建议增加迭代次数"}

---
`;

        // 基于数据特征判断运行模式
        if (avgRpm < 400 && avgPower < 3 && avgFuelFlow < 50) {
            return `
### ⚪ 待机/低速运行模式

${algorithmInfo}

**运行特征分析：**
- 平均转速：\\( ${avgRpm.toFixed(1)} \\) RPM
- 平均功率：\\( ${avgPower.toFixed(2)} \\) MW  
- 平均燃油流量：\\( ${Math.abs(avgFuelFlow).toFixed(2)} \\) kg/s

**模式判定逻辑：**

$$
\\text{RPM} < 400 \\quad \\land \\quad
\\text{Power} < 3 \\quad \\land \\quad
|\\text{FuelFlow}| < 50
$$

**状态评估：** 靠泊或低速运行状态，能耗处于最低水平。

**运营建议：** 
- ✅ 适合港口作业或低速航行场景
- 💡 可利用此模式进行设备维护检查
- 📊 监控待机时间占比，优化港口作业效率
      `;
        } else if (avgRpm >= 400 && avgRpm < 650 && avgPower >= 3 && avgPower < 5 && avgFuelFlow < 100) {
            return `
### 经济巡航运行模式

${algorithmInfo}

**运行特征分析：**
- 平均转速：\\( ${avgRpm.toFixed(1)} \\) RPM
- 平均功率：\\( ${avgPower.toFixed(2)} \\) MW
- 平均燃油流量：\\( ${Math.abs(avgFuelFlow).toFixed(2)} \\) kg/s

**模式判定逻辑：**

$$
400 \\le \\text{RPM} < 650 \\quad \\land \\quad
3 \\le \\text{Power} < 5 \\quad \\land \\quad
|\\text{FuelFlow}| < 100
$$

**状态评估：** ✅ **最优运行状态**，燃油效率高，运行平稳。

**运营建议：** 
- 🎯 **推荐保持**：此运行模式燃油经济性最佳
- 💰 成本效益：有利于降低运营成本和碳排放
- 📈 性能监控：持续跟踪此模式的运行参数稳定性
      `;
        } else if (avgRpm >= 650 && avgRpm < 800 && avgPower >= 5 && avgPower < 7 && avgFuelFlow < 180) {
            return `
### 🟡 普通巡航运行模式

${algorithmInfo}

**运行特征分析：**
- 平均转速：\\( ${avgRpm.toFixed(1)} \\) RPM
- 平均功率：\\( ${avgPower.toFixed(2)} \\) MW
- 平均燃油流量：\\( ${Math.abs(avgFuelFlow).toFixed(2)} \\) kg/s

**模式判定逻辑：**

$$
650 \\le \\text{RPM} < 800 \\quad \\land \\quad
5 \\le \\text{Power} < 7 \\quad \\land \\quad
|\\text{FuelFlow}| < 180
$$

**状态评估：** ⚠️ 常规负载运行，能耗在正常范围内。

**运营建议：** 
- 🔧 **优化潜力**：可通过航速调整进一步提升燃油经济性
- 📊 数据分析：建议分析航行条件与燃油消耗的关联性
- ⚖️ 平衡策略：在时间效率和燃油经济性之间寻找最佳平衡点
      `;
        } else {
            return `
### 🔴 高负载运行模式

${algorithmInfo}

**运行特征分析：**
- 平均转速：\\( ${avgRpm.toFixed(1)} \\) RPM
- 平均功率：\\( ${avgPower.toFixed(2)} \\) MW
- 平均燃油流量：\\( ${Math.abs(avgFuelFlow).toFixed(2)} \\) kg/s

**模式判定逻辑：**

$$
\\text{RPM} \\ge 800 \\quad \\lor \\quad
\\text{Power} \\ge 7 \\quad \\lor \\quad
|\\text{FuelFlow}| \\ge 180
$$

**状态评估：** ⚠️ **高能耗状态**，存在潜在效率下降风险。

**运营建议：** 
- 🔍 **重点检查**：螺旋桨推进效率和负载匹配情况
- 📋 维护计划：评估主机和推进系统的维护状态
- 🎯 策略调整：考虑优化航行路线和航速策略
- 💡 技术改进：探索节能技术和设备升级可能性
      `;
        }
    };

    // 业务结论生成函数
    generateBusinessConclusion = (clusterAnalysis, totalPoints) => {
        const modeCount = clusterAnalysis.length;

        // 计算各模式统计
        const economicMode = clusterAnalysis.find(c => c.mode.status === '🟢 经济巡航');
        const normalMode = clusterAnalysis.find(c => c.mode.status === '🟡 普通巡航');
        const highLoadMode = clusterAnalysis.find(c => c.mode.status === '🔴 高负载');
        const standbyMode = clusterAnalysis.find(c => c.mode.status === '⚪ 待机/低速');

        let conclusion = `
### K-Means 聚类分析报告

**总体概况：**
- 聚类数量：**${modeCount}** 种运行模式
- 总数据点：**${totalPoints}** 个
- 分析维度：转速 \\( RPM \\)、功率 \\( Power \\)、燃油流量 \\( Fuel\\ Flow \\)

---

### 🎯 运行模式定义

| 颜色 | 模式 |  判定条件 | 含义 |
|:------:|:------:|:----------|:------|
| <span style="color: #d9d9d9">●</span> | **待机/低速** | RPM < 400 ∧ Power < 3 ∧ FuelFlow < 50 | 靠泊或低速运行 |
| <span style="color: #52c41a">●</span> | **经济巡航** | 400 ≤ RPM < 650 ∧ 3 ≤ Power < 5 ∧ FuelFlow < 100 | 平稳、高效 |
| <span style="color: #faad14">●</span> | **普通巡航** | 650 ≤ RPM < 800 ∧ 5 ≤ Power < 7 ∧ FuelFlow < 180 | 能耗正常 |
| <span style="color: #ff4d4f">●</span> | **高负载** | RPM ≥ 800 ∨ Power ≥ 7 ∨ FuelFlow ≥ 180 | 潜在效率下降 |

---

### 运行模式分布分析

`;

        // 按优先级排序分析各模式
        if (economicMode) {
            conclusion += `
**🟢 经济巡航模式**
- 占比：**${economicMode.percentage}%**
- 评估：✅ 整体航行以中低速节能工况为主，燃油经济性良好
- 建议：继续保持此运行模式，有利于降低运营成本

`;
        }

        if (normalMode) {
            conclusion += `
**🟡 普通巡航模式**
- 占比：**${normalMode.percentage}%**
- 评估：⚠️ 常规负载运行，能耗在正常范围内
- 建议：可通过航速调整进一步提升燃油经济性

`;
        }

        if (highLoadMode) {
            conclusion += `
**🔴 高负载模式**
- 占比：**${highLoadMode.percentage}%**
- 评估：⚠️ 高能耗状态，存在潜在效率下降风险
- 建议：检查螺旋桨推进效率和负载匹配情况

`;
        }

        if (standbyMode) {
            conclusion += `
**⚪ 待机/低速模式**
- 占比：**${standbyMode.percentage}%**
- 评估：✅ 靠泊或低速运行状态，能耗处于最低水平
- 建议：适合港口作业，可利用此时间进行设备维护

`;
        }

        // 添加总体建议
        conclusion += `
---

### 智能优化建议

`;

        if (economicMode && economicMode.percentage > 50) {
            conclusion += `- ✅ **运行状态良好**：经济巡航模式占主导地位，燃油效率较高\n`;
        }

        if (highLoadMode && highLoadMode.percentage > 20) {
            conclusion += `- ⚠️ **重点关注**：高负载模式占比较高（${highLoadMode.percentage}%），建议优化运行策略\n`;
        }

        if (normalMode && normalMode.percentage > 30) {
            conclusion += `- 🔧 **优化空间**：普通巡航模式有进一步节能潜力，可通过航速调整优化\n`;
        }

        conclusion += `
- 📈 **持续监控**：建议定期进行聚类分析，跟踪运行模式变化趋势
- 🎯 **目标设定**：逐步提高经济巡航模式占比，降低高负载运行时间
`;

        return conclusion.trim();
    };

    render() {
        const { loading, kmeansData } = this.state;
        let kmeansIndroduction = '',
            kmeansConclusion = '',
            kmeansAnalysisReport = '',
            chartOptions = null,
            clusterChartOptions = null;

        // console.log('kmeansData:', kmeansData);

        if (kmeansData) {
            const report = this.generateKmeansReport(kmeansData);
            chartOptions = report.chartOptions;
            clusterChartOptions = report.clusterChartOptions;
            kmeansIndroduction = report.kmeansIndroduction;
            kmeansConclusion = report.kmeansConclusion;
            kmeansAnalysisReport = report.kmeansAnalysisReport;
        }

        const tooltipContent = (
            <ReactMarkdown
                children={kmeansIndroduction}
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
            />
        );

        return (
            <Card
                title={
                    <Tooltip
                        title={tooltipContent}
                        placement="bottomLeft"
                        overlayStyle={{ maxWidth: '450px' }}
                    >
                        <span style={{ cursor: 'pointer', borderBottom: '1px dashed #1890ff' }}>
                            运行模式聚类分析 (K-Means) - 机器学习算法
                        </span>
                    </Tooltip>
                }
                style={{ margin: '16px 0' }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '16px' }}>正在进行聚类分析...</p>
                    </div>
                ) : kmeansData ? (
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <Card style={{ height: '100%' }}>
                                <ReactMarkdown
                                    children={kmeansAnalysisReport}
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card style={{ height: '100%' }}>
                                <ReactMarkdown
                                    children={kmeansConclusion}
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                                />
                            </Card>
                        </Col>
                        <Col span={10}>
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Card style={{ height: '500px' }}>
                                        <ReactEcharts
                                            option={clusterChartOptions}
                                            style={{ height: '450px', width: '100%' }}
                                            opts={{ renderer: "canvas" }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                <Col span={24}>
                                    <Card style={{ height: '500px' }}>
                                        <ReactEcharts
                                            option={chartOptions}
                                            style={{ height: '450px', width: '100%' }}
                                            opts={{ renderer: "canvas" }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>暂无数据</p>
                    </div>
                )}
            </Card>
        );
    }
}

export default KmeansAnalysis;
