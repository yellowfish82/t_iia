import React from "react";


import ComingSoon from '../comming';
import TIIoTDashboard from '../dashboard';
import TIIoTModel from '../model';
import TIIoTInstance from '../instance';

class TIIoTContent extends React.Component {
    constructor(props) {
        super(props);
        this.pages = {
            TIIoTDashboard: (<TIIoTDashboard />),
            TIIoTModel: (<TIIoTModel setBreadcrumb={this.props.setBreadcrumb} />),
            TIIoTInstance: (<TIIoTInstance setBreadcrumb={this.props.setBreadcrumb} />),
        }
    }

    renderPage = () => {
        const pageContengt = this.pages[this.props.page];
        if (pageContengt) {
            return pageContengt;
        }

        return (
            <ComingSoon />
        );
    }

    render() {
        // console.log('TIIoTContent', this.props.page);
        const page = this.renderPage();

        return (
            <div style={{ width: '100%', minHeight: 400 }}>
                {page}
            </div>
        );
    }

}

export default TIIoTContent;