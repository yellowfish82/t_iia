import React from "react";
import { Button, Divider, Form, Input, message, Modal, InputNumber, List, Card, Select, } from 'antd';

import hub from '../../utilities/hub';
import CONSTANT from '../../utilities/constant';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};

class TIIoTModelCreate extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            properties: [],
            alertCondition: [],
            showPropertyModal: false,
            showAlertModal: false,
            curPType: undefined, // 当前属性类型
        };
        
        // 创建属性类型选项
        this.propertyTypeOptions = Object.entries(CONSTANT.PROPERTY_TYPE).map(([key, value]) => ({
            value: key,
            label: `${value.label} (${value.unit})`
        }));
    }

    back = () => {
        this.props.nav('TIIoTModelList');
    }

    execute = async (values) => {
        console.log('保存物模型', values);
        try {
            const { name, description, type } = values;
            const { properties, alertCondition } = this.state;

            let findIndex = -1;
            alertCondition.forEach((ac) => {
                findIndex = properties.findIndex((p) => p.name === ac.property);
                if (findIndex !== -1) {
                    properties[findIndex]['alert_condition'] = {
                        expression: ac.expression,
                        threshold: ac.threshold,
                    }
                }
            });

            const thingModel = {
                name,
                description,
                properties,
                type,
            };
            const resp = await hub.createThingModel(thingModel);

            message.success('物模型保存成功！');
            this.back();

        } catch (error) {
            // console.log(`保存错误 : ${error}`);
            message.error(`保存错误 : ${error}`);
        }
    }

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    renderPage = () => {
        const {
            properties,
            alertCondition,
            showPropertyModal,
            showAlertModal,
            curPName,
            curPMax,
            curPMin,
            curAProperty,
            curAExpression,
            curAThreshold,
        } = this.state;
        const propertyCandidates = properties.map((p) => {
            return {
                value: p.name,
                label: p.name
            }
        });

        return (
            <div>
                <h2>创建物模型</h2>
                <Divider />

                <Form
                    {...layout}
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={this.execute}
                    onFinishFailed={this.onFinishFailed}
                    style={{ marginTop: '50px' }}
                    ref={this.formRef}
                >

                    <Form.Item>
                        <Button htmlType="submit">
                            保存
                        </Button>
                        <Button style={{ marginLeft: '1px' }} onClick={this.showPropertyModal}>
                            添加属性
                        </Button>
                        <Button style={{ marginLeft: '1px' }} onClick={this.showAlertModal}>
                            添加报警
                        </Button>
                        <Button style={{ marginLeft: '1px' }} onClick={this.back}>
                            返回
                        </Button>
                    </Form.Item>

                    <p style={{ color: 'red', textAlign: 'center' }}>
                        {this.state.errMsg}
                    </p>

                    <Form.Item
                        label="名称"
                        name="name"
                        rules={[{ required: true, message: '请输入物模型名称' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="描述"
                        name="description"
                    >
                        <Input />
                    </Form.Item>
                </Form >

                <Divider>属性</Divider>
                <List
                    grid={{
                        gutter: 16,
                        column: 4,
                    }}
                    dataSource={properties}
                    renderItem={(item, i) => (
                        <List.Item>
                            <Card title={item.name}>
                                <Button onClick={() => this.delProperty(i)}>删除</Button>
                                <Divider />
                                <ul>
                                    {item.type ? (
                                        <li>
                                            类型：{CONSTANT.PROPERTY_TYPE[item.type] ? 
                                                `${CONSTANT.PROPERTY_TYPE[item.type].label} (${CONSTANT.PROPERTY_TYPE[item.type].unit})` : 
                                                item.type}
                                        </li>
                                    ) : (
                                        <>
                                            <li>
                                                最大值：{item.max}
                                            </li>
                                            <li>
                                                最小值：{item.min}
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </Card>
                        </List.Item>
                    )}
                />

                <Divider>报警</Divider>
                <List
                    grid={{
                        gutter: 16,
                        column: 4,
                    }}
                    dataSource={alertCondition}
                    renderItem={(item, i) => {
                        // console.log(item);
                        let expressionMark = '';
                        switch (item.expression) {
                            case CONSTANT.CONDITION_EXPRESSION.LARGER:
                                expressionMark = '>';
                                break;
                            case CONSTANT.CONDITION_EXPRESSION.LARGER_EQUAL:
                                expressionMark = '>=';
                                break;
                            case CONSTANT.CONDITION_EXPRESSION.SMALLER_EQUAL:
                                expressionMark = '<=';
                                break;
                            case CONSTANT.CONDITION_EXPRESSION.EQUAL:
                                expressionMark = '=';
                                break;
                            case CONSTANT.CONDITION_EXPRESSION.SMALLER:
                                expressionMark = '<';
                                break;
                            default:
                        }

                        return (
                            <List.Item>
                                <Card title={item.property}>
                                    <Button onClick={() => this.delAlert(i)}>删除</Button>
                                    <Divider />
                                    {expressionMark}{item.threshold}
                                </Card>
                            </List.Item>
                        );
                    }}
                />

                <Modal title="添加属性" open={showPropertyModal} onOk={this.handlePropertyOk} onCancel={this.handlePropertyCancel}>
                    <p>属性名称：<Input style={{ width: '80%' }} onChange={this.recordPropertyNameChange} value={curPName} /></p>
                    <p>属性类型：
                        <Select
                            style={{ width: '80%' }}
                            onChange={this.recordPropertyTypeChange}
                            allowClear
                            options={this.propertyTypeOptions}
                            value={this.state.curPType}
                            placeholder="选择属性类型（可选）"
                        />
                    </p>
                    {!this.state.curPType && (
                        <>
                            <p>最大值：<InputNumber style={{ width: '80%' }} onChange={this.recordPropertyMaxChange} value={curPMax} /></p>
                            <p>最小值：<InputNumber style={{ width: '80%' }} onChange={this.recordPropertyMinChange} value={curPMin} /></p>
                        </>
                    )}
                </Modal>

                <Modal title="添加报警条件" open={showAlertModal} onOk={this.handleAlertOk} onCancel={this.handleAlertCancel}>
                    <p>属性：<Select
                        style={{ width: '80%' }}
                        onChange={this.recordAlertPropertyChange}
                        allowClear
                        options={propertyCandidates}
                        value={curAProperty}
                    /></p>
                    <p>操作符：<Select
                        style={{ width: '80%' }}
                        onChange={this.recordAlertExpressionChange}
                        allowClear
                        options={[
                            {
                                value: CONSTANT.CONDITION_EXPRESSION.EQUAL,
                                label: '=',
                            },
                            {
                                value: CONSTANT.CONDITION_EXPRESSION.LARGER_EQUAL,
                                label: '>=',
                            },
                            {
                                value: CONSTANT.CONDITION_EXPRESSION.SMALLER_EQUAL,
                                label: '<=',
                            },
                            {
                                value: CONSTANT.CONDITION_EXPRESSION.SMALLER,
                                label: '<',
                            },
                            {
                                value: CONSTANT.CONDITION_EXPRESSION.LARGER,
                                label: '>',
                            },
                        ]}
                        value={curAExpression}
                    /></p>
                    <p>阈值：<InputNumber style={{ width: '80%' }} onChange={this.recordAlertThresholdChange} value={curAThreshold} /></p>
                </Modal>

            </div >
        )
    }


    showPropertyModal = () => this.setState({ showPropertyModal: true });

    handlePropertyOk = () => {
        const { properties, curPName, curPMax, curPMin, curPType } = this.state;
        
        // 创建新属性对象
        const newProperty = {
            name: curPName,
            type: curPType,
        };
        
        // 如果没有选择类型，才添加最大值和最小值
        if (!curPType) {
            newProperty.max = curPMax;
            newProperty.min = curPMin;
        }
        
        properties.push(newProperty);

        this.setState({ 
            properties, 
            showPropertyModal: false, 
            curPName: undefined, 
            curPMax: undefined, 
            curPMin: undefined,
            curPType: undefined
        });
    }

    handlePropertyCancel = () => this.setState({ 
        showPropertyModal: false, 
        curPName: undefined, 
        curPMax: undefined, 
        curPMin: undefined,
        curPType: undefined 
    });

    delProperty = (i) => {
        console.log(i);
        const properties = this.state.properties.filter((e, index) => index != i);
        this.setState({ properties });
    }

    recordPropertyNameChange = (v) => {
        console.log(v);
        this.setState({ curPName: v.target.value });
    }
    recordPropertyMaxChange = (v) => {
        console.log(v);
        this.setState({ curPMax: v });
    }
    recordPropertyMinChange = (v) => {
        console.log(v);
        this.setState({ curPMin: v });
    }
    recordPropertyTypeChange = (v) => {
        console.log('Selected property type:', v);
        this.setState({ curPType: v });
    }



    showAlertModal = () => this.setState({ showAlertModal: true });

    handleAlertOk = () => {
        const { alertCondition, curAProperty, curAExpression, curAThreshold } = this.state;
        alertCondition.push({
            property: curAProperty,
            expression: curAExpression,
            threshold: curAThreshold,
        });

        this.setState({ alertCondition, showAlertModal: false, curAProperty: undefined, curAExpression: undefined, curAThreshold: undefined });
    }

    handleAlertCancel = () => this.setState({ showAlertModal: false, curAProperty: undefined, curAExpression: undefined, curAThreshold: undefined });

    delAlert = (i) => {
        console.log(i);
        const alertCondition = this.state.alertCondition.filter((e, index) => index != i);
        this.setState({ alertCondition });
    }

    recordAlertPropertyChange = (v) => {
        console.log(v);
        this.setState({ curAProperty: v });
    }
    recordAlertExpressionChange = (v) => {
        console.log(v);
        this.setState({ curAExpression: v });
    }
    recordAlertThresholdChange = (v) => {
        console.log(v);
        this.setState({ curAThreshold: v });
    }


    render() {
        const page = this.renderPage();
        return (
            <div>
                {page}
            </div>
        );
    }

}

export default TIIoTModelCreate;