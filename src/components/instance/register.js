import React from "react";
import { Button, Divider, Form, Input, InputNumber, Select, message } from 'antd';

import hub from '../../utilities/hub';
import CONSTANT from '../../utilities/constant';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};

class AMInstanceRgister extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = { loading: true };
    }

    execute = async (values) => {
        console.log('注册设备', values);
        try {
            // const { name, description } = values;
            // const { properties, alertCondition } = this.state;

            // let findIndex = -1;
            // alertCondition.forEach((ac) => {
            //     findIndex = properties.findIndex((p) => p.name === ac.property);
            //     if (findIndex !== -1) {
            //         properties[findIndex]['alert_condition'] = {
            //             expression: ac.expression,
            //             threshold: ac.threshold,
            //         }
            //     }
            // });

            const device = {
                ...values,
            };
            const resp = await hub.registerDevice(device);

            message.success('设备注册成功！');
            this.back();

        } catch (error) {
            // console.log(`保存错误 : ${error}`);
            message.error(`设备注册错误 : ${error}`);
        }
    }

    back = () => {
        this.props.nav('AMInstanceList');
    }

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    renderPage = () => {
        console.log(this.props.info);
        const modelOptions = this.props.info.map(m => {
            return {
                label: m.name,
                value: m.id
            };
        });

        return (
            <div>
                <h2>设备注册</h2>
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
                        rules={[{ required: true, message: '请输入设备名称' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="物模型"
                        name="thing_model_id"
                        rules={[{ required: true, message: '请选择物模型' }]}
                    >
                        <Select options={modelOptions} />
                    </Form.Item>

                    <Form.Item
                        label="品牌"
                        name="brand"
                        rules={[{ required: true, message: '请输入设备品牌' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="上数频率"
                        name="frequency"
                        initialValue={2}
                        tooltip="设备数据上报的频率，单位为秒"
                    >
                        <InputNumber 
                            style={{ width: '100%' }} 
                            addonAfter="秒" 
                            min={1}
                            placeholder="默认为2秒"
                        />
                    </Form.Item>

                    <Form.Item
                        label="备注"
                        name="note"
                    >
                        <Input />
                    </Form.Item>
                </Form >
            </div>
        )

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

export default AMInstanceRgister;