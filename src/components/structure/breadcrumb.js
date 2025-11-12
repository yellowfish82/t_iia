import React from "react";
import { Breadcrumb } from 'antd';

class TIIoTBreadcrumb extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    renderBreadscurmb = () => {
        let breadcrumb = null;

        if (Array.isArray(this.props.breadcrumb)) {
            breadcrumb = this.props.breadcrumb.map((b, i) => (
                <Breadcrumb.Item key={`bc_${i}`}>{b}</Breadcrumb.Item>
            ));
        }

        return (
            <Breadcrumb style={{ margin: '20px' }}>
                {breadcrumb}
            </Breadcrumb>
        );
    }

    render() {
        // console.log('TIIoTBreadcrumb', this.props.breadcrumb);
        const breadcrumb = this.renderBreadscurmb();

        return (
            <div style={{ margin: '0 16px', }}>
                {breadcrumb}
            </div>
        );
    }

}

export default TIIoTBreadcrumb;