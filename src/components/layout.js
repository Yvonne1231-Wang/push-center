import { Layout, Menu } from "antd";
// import { Icon } from '@ant-design/compatible';
import {
    ProfileOutlined,
    MailOutlined,
    FileSearchOutlined,
    // DownOutlined
} from '@ant-design/icons';
import React from "react";
import "antd/dist/antd.css";
import SRBasicLayout from "@xmly/sr_layout";
import "./layout.scss";

import { NavLink, Route, Redirect, Switch } from "react-router-dom";

import { withRouter } from "react-router-dom";
// import { connect } from 'react-redux';


const { Content, Sider } = Layout;
const { SubMenu } = Menu;

const Layouts = (props) => {
    var pathname = props.location.pathname;
    var defaultSub = "task";
    var defaultItem = "task-task";
    if (pathname.length > 1) {
        let index1 = pathname.indexOf('/');
        let index2 = pathname.lastIndexOf('/');
        if (index1 === index2) {
            defaultSub = pathname.slice(index1 + 1, pathname.length);
        } else {
            defaultSub = pathname.slice(index1 + 1, index2);
        }
        defaultItem = `${defaultSub}-${pathname.slice(index2 + 1, pathname.length)}`;
        //   console.log(index1, index2,pathname, defaultSub, defaultItem);

        // defaultSub = pathname.match(/(^\/.*?\/|^\/\S+$)/)[0].match(/[^\/]+/)[0];
        // defaultItem = defaultSub + '-' + pathname.match(/((?<=\/\S*)\/.*?\/|(?<=\/\S*)[^\/]$|[^\/]+$)/)[0].match(/[^\/]+/);
    }
    var itemNode = document.querySelector("[flag=\"" + defaultItem + "\"]");
    if (itemNode) {
        //   console.log("1",itemNode)
        itemNode.click();
    }
    return (
        <SRBasicLayout style={{ overflow: "hidden", background: "#fff" }}>
            <Layout style={{ height: "100%", paddingTop: "20px" }}>
                <Sider width="171" breakpoint="lg" collapsedWidth="0" style={{ overflowY: 'auto', height: "100%" }}>
                    <div className="logo">推送系统</div>
                    <div style={{ height: "calc(100%-50px)"}}>
                        <Menu mode="inline" forceSubMenuRender defaultOpenKeys={[defaultSub]} defaultSelectedKeys={[defaultItem]}>
                            {/**我的推送*/}
                            <SubMenu key="task" title={<span><MailOutlined style={{ fontSize: "15px", color: "#40404C" }} /><span>推送管理</span></span>} >
                                <Menu.Item key="task-task" flag="task-task">
                                    <NavLink to="/task">推送任务</NavLink>
                                </Menu.Item>
                                <Menu.Item key="task-history" flag="task-history">
                                    <NavLink to="/task/history">历史推送</NavLink>
                                </Menu.Item>
                            </SubMenu>

                            {/**消息模版*/}
                            <SubMenu key="my" title={<span><ProfileOutlined style={{ fontSize: "15px", color: "#40404C" }} /><span>消息模版</span></span>} flag="my">
                                <Menu.Item key="my-mailbox" flag="my-mailbox">
                                    <NavLink to="/my/mailbox">邮件</NavLink>
                                </Menu.Item>
                                <Menu.Item key="my-SMS" flag="my-SMS">
                                    <NavLink to="/my/SMS">短信</NavLink>
                                </Menu.Item>
                                <Menu.Item key="my-dingdingRecord" flag="my-dingdingRecord">
                                    <NavLink to="/my/dingdingRecord">钉钉待办</NavLink>
                                </Menu.Item>
                                <Menu.Item key="my-dingdingRobot" flag="my-dingdingRobot">
                                    <NavLink to="/my/dingdingRobot">钉钉机器人</NavLink>
                                </Menu.Item>
                                <Menu.Item key="my-dingdingGroup" flag="my-dingdingGroup">
                                    <NavLink to="/my/dingdingGroup">钉钉群通知</NavLink>
                                </Menu.Item>
                                <Menu.Item key="my-dingdingNotice" flag="my-dingdingNotice">
                                    <NavLink to="/my/dingdingNotice">钉钉工作通告</NavLink>
                                </Menu.Item>
                            </SubMenu>

                        </Menu>
                    </div>
                </Sider>
                <Layout style={{ height: "100%", padding: "0 10px" }}>
                    <Content
                    // style={{overflow:"scroll"}}
                    >
                        {/* <Auth requires={"/home"}>
                             <button>test</button>
                             </Auth> */}
                        {props.children}
                    </Content>
                </Layout>
            </Layout>
        </SRBasicLayout>
    )

};
const mapStateToProps = (state, ownProps) => {
    return {
        state: state
    };
};


export default withRouter(Layouts);
