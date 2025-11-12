import React from "react";

import TIIoTModelList from './query';
import TIIoTModelCreate from './create';

class TIIoTModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { curPage: 'TIIoTModelList', condition: '' };
    }

    nav = (curPage) => {
        console.log(curPage);
        this.setState({ curPage });
    }

    renderPage = () => {
        switch (this.state.curPage) {
            case 'TIIoTModelCreate':
                this.props.setBreadcrumb([
                    '物模型',
                    '新增'
                ]);
                return (<TIIoTModelCreate nav={this.nav} />);
            default:
                this.props.setBreadcrumb([
                    '物模型'
                ]);
                return (<TIIoTModelList nav={this.nav} />);
        }

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

export default TIIoTModel;