import React from "react";
import { Button, Divider, message, Spin, Card, List, Timeline } from 'antd';

import hub from '../../utilities/hub';
import tools from '../../utilities/tools';
import CONSTANT from '../../utilities/constant';

import AMHistory from './history';
const moment = require('moment');

class AMInstanceView extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true, showHistorydata: false, };
        this.timer = undefined;
    }

    async componentDidMount() {
        this.timer = setInterval(async () => {
            try {
                await this.query();
            } catch (error) {
                console.error(error);
                message.error(`${error}`);
            }
        }, CONSTANT.REFRESH_FREQUENCY);
    }

    query = async () => {
        this.setState({ loading: true });
        const rtData = await hub.queryRTData(this.props.info.id);
        // console.log(rtData);
        const ot = this.assembleRTData(rtData.ot);
        const { alertData } = await hub.queryAlertData(JSON.stringify({ thing_id: this.props.info.id }));
        const ad = alertData.result.map((ad) => {
            const payload = JSON.parse(ad.payload);
            let expressionMark = '';
            switch (ad.expression) {
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
            // console.log('``````````````````````');
            return {
                label: moment(ad.timestamp).format('YYYY-MM-DD HH:mm:ss SSS'),
                children: `${ad.name}当前值：${payload[ad.name]} -- 报警条件： ${expressionMark} ${ad.threshold.toFixed(2)} `
            }
        });
        this.setState({ ot, alertData: ad, loading: false });
    }

    assembleRTData = (data) => {
        let result = [];
        if (data) {
            const payload = JSON.parse(data.payload);
            payload['timestamp'] = moment(data.timestamp).format('YYYY-MM-DD HH:mm:ss SSS');

            result = Object.keys(payload).map((k) => {
                return {
                    k,
                    v: payload[k],
                }
            });
        }
        return result;
    }

    back = () => {
        clearInterval(this.timer);
        this.props.nav('AMInstanceList');
    }

    viewHistory = (property) => this.viewNav(true, property);

    viewNav = (showHistorydata, property) => {
        clearInterval(this.timer);
        this.setState({ showHistorydata, property });
    }

    renderPage = () => {
        const { loading, showHistorydata, ot, alertData, property } = this.state;

        if (showHistorydata) {
            return (
                <AMHistory viewNav={this.viewNav} info={{ property, thing_id: this.props.info.id }} />
            )
        }

        return (
            <div>
                <h2>查看设备</h2>
                <Divider />
                <Button onClick={this.back}>返回</Button>
                {loading ? <Spin /> : null}

                {/* <Button onClick={this.viewHistory}>历史记录</Button> */}

                <Divider>实时数据</Divider>
                <List
                    grid={{
                        gutter: 16,
                        column: 4,
                    }}
                    dataSource={ot}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.k} style={{ cursor: 'pointer' }} onClick={() => { this.viewHistory(item.k) }}>
                                <h3>{item.v}</h3>
                            </Card>
                        </List.Item>
                    )}
                />
                <Divider>报警数据</Divider>
                <Timeline mode="left" items={alertData} />

            </div>
        )

    }

    render() {
        console.log(this.props.info);
        const page = this.renderPage();
        return (
            <div>
                {page}
            </div>
        );
    }

}

export default AMInstanceView;