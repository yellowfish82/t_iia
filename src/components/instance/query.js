import React from "react";
import { Button, Table, Space, message } from 'antd';

import hub from '../../utilities/hub';
import CONSTANT from '../../utilities/constant';

class TIIoTInstanceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true };

        this.deviceColms = this.modelsColms = [
            {
                title: 'SN',
                dataIndex: 'sn',
                key: 'sn',
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '品牌',
                dataIndex: 'brand',
                key: 'brand',
            },
            {
                title: '上数频率',
                dataIndex: 'frequency',
                key: 'frequency',
                render: (v) => (
                    <span>{v}秒</span>
                )
            },
            {
                title: '物模型',
                dataIndex: 'model',
                key: 'model',
                render: (v) => (
                    <span>{v.name}</span>
                )
            },
            {
                title: '备注',
                dataIndex: 'note',
                key: 'note',
            },
            {
                title: 'Action',
                key: 'action',
                width: '20%',
                render: (_, record, i) => (
                    <Space size="middle">
                        <Button onClick={() => this.detail(record)}>查看</Button>
                    </Space>
                ),
            },
        ];
    }

    async componentDidMount() {
        try {
            // console.log(`TIIoTInstanceList componentDidMount`);
            await this.query();
        } catch (error) {
            console.log(error);
            message.error(`${error}`);
        }
    }

    query = async () => {
        this.setState({ loading: true });
        const { things } = await hub.queryInstances({});
        const { ThingModels } = await hub.queryModels();

        const devices = [];
        things.forEach((t) => {
            const model = ThingModels.find(m => m.id === t.thing_model_id);
            devices.push({
                ...t,
                model
            })
        });

        // console.log(devices);

        this.setState({ loading: false, devices, models: ThingModels });
    }

    register = () => {
        this.props.nav('TIIoTInstanceRgister', this.state.models);
    }

    detail = (d) => {
        // this.props.nav('TIIoTInstanceView', this.state.curInstance);
        this.props.nav('TIIoTInstanceView', d);
    }

    renderPage = () => {
        const { devices, } = this.state;
        return (
            <div>
                <h2>设备列表</h2>
                <Button onClick={this.register}>注册</Button>

                <Table style={{ marginTop: '20px' }} dataSource={devices} columns={this.deviceColms} rowKey={(record) => record._id} />
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

export default TIIoTInstanceList;