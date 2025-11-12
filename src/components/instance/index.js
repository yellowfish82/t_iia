import React from "react";

import TIIoTInstanceList from './query';
import TIIoTInstanceRgister from './register';
import TIIoTInstanceView from './view';

class TIIoTInstance extends React.Component {
    constructor(props) {
        super(props);
        this.state = { curPage: 'TIIoTModelList', condition: '' };
    }

    nav = (curPage, info) => {
        console.log(curPage, info);
        this.setState({ curPage, info });
    }

    renderPage = () => {
        const { info } = this.state;
        switch (this.state.curPage) {
            case 'TIIoTInstanceRgister':
                this.props.setBreadcrumb([
                    '物实例',
                    '注册'
                ]);
                return (<TIIoTInstanceRgister nav={this.nav} info={info} />);
            case 'TIIoTInstanceView':
                this.props.setBreadcrumb([
                    '物实例',
                    info.name
                ]);
                return (<TIIoTInstanceView setBreadcrumb={this.props.setBreadcrumb} nav={this.nav} info={info} />);
            default:
                this.props.setBreadcrumb([
                    '物实例'
                ]);
                return (<TIIoTInstanceList nav={this.nav} info={info} />);
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

export default TIIoTInstance;