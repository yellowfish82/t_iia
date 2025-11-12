import React from "react";
import './t.css';

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    DashboardOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, Button, Spin, message } from 'antd';

import TIIoTBreadcrumb from './structure/breadcrumb';
import TIIoTContent from './structure/content';

import hub from '../utilities/hub';

const { Header, Content, Footer, Sider } = Layout;

class TIIoT extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            items: [
                {
                    key: 'dashboard',
                    icon: <DashboardOutlined />,
                    label: '看板',
                },
                {
                    key: 'model',
                    icon: <UploadOutlined />,
                    label: '物模型',
                },
                {
                    key: 'instance',
                    icon: <VideoCameraOutlined />,
                    label: '物实例',
                },
            ]
        };

        this.navMap = {
            dashboard: {
                page: 'TIIoTDashboard',
                breadcrumb: ['看板']
            },
            model: {
                page: 'TIIoTModel',
                breadcrumb: ['物模型']
            },
            instance: {
                page: 'TIIoTInstance',
                breadcrumb: ['物实例']
            },
        }
    }

    async componentDidMount() {
        try {
            message.success('TIIoT IIoT平台欢迎您！');
            const { page, breadcrumb } = this.navMap[this.state.items[0].key];
            this.setState({ loading: false, collapsed: false, page, breadcrumb });

        } catch (error) {
            console.log(error);
        };
    }

    getItem = (label, key, icon, children) => {
        return {
            key,
            icon,
            children,
            label,
        };
    }

    nav = (page, breadcrumb) => {
        this.setState({ page, breadcrumb });
    }

    setBreadcrumb = (breadcrumb) => {
        this.setState({ breadcrumb });
    }

    onClickMenu = async (e) => {
        // console.log(e);
        const { page, breadcrumb } = this.navMap[e.key];
        this.nav(page, breadcrumb);
    }

    setCollapsed = (collapsed) => {
        this.setState({ collapsed });
    }

    ollama = async () => {
        try {
            alert('ollama');
            const resp = await hub.invokeOllama();

            message.success(resp);

        } catch (error) {
            console.log(error);
        };

    }

    renderMainPage = () => {
        const { loading, collapsed, breadcrumb, items, page } = this.state;

        if (loading) {
            return (
                <Spin />
            );
        }

        return (
            <Layout style={{ minHeight: '100vh', borderRadius: '10px', }}>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <img src='logo192.png' style={{ width: '100%', height: '95px', cursor: 'pointer' }} onClick={this.ollama} />

                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => this.setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            color: 'whitesmoke',
                            float: 'right'
                        }}
                    />

                    <div className="demo-logo-vertical" />
                    {
                        items ?
                            <Menu
                                theme="dark"
                                mode="inline"
                                defaultSelectedKeys={[this.state.items[0].key]}
                                items={items}
                                onSelect={this.onClickMenu}
                            />
                            : <Spin />
                    }

                </Sider>
                <Layout>
                    <Header style={{
                        padding: 0,
                        height: '95px',
                        backgroundColor: 'whitesmoke',
                        margin: '0 16px',
                    }}
                    >

                        <h1 style={{ textAlign: "center", backgroundColor: '#ffffff', margin: '16px 0' }}>IIoT一体机演示平台</h1>
                    </Header>


                    <TIIoTBreadcrumb breadcrumb={breadcrumb} />

                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                            borderRadius: '10px',
                            background: '#ffffff'
                        }}
                    >
                        <TIIoTContent page={page} setBreadcrumb={this.setBreadcrumb} />
                    </Content>

                    <Footer
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        Terry IIoT Demo ©{new Date().getFullYear()} Created by Terry
                    </Footer>
                </Layout>
            </Layout>
        )
    }

    render() {
        const mainPage = this.renderMainPage();

        return (
            <div>
                {mainPage}
            </div>
        );
    }

}

export default TIIoT;