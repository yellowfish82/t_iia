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
        const option = {
            xAxis: {
                type: 'category',
                data: xData
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: yData,
                    type: 'line'
                }
            ]
        }

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
                        style={{ width: '100%' }}
                        className="react_for_echarts"
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