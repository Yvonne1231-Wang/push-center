import apis from "../../utils/api/unsplash/index";
import React, { Component, useState } from "react";
import { NavLink } from "react-router-dom";
import Highlighter from 'react-highlight-words';
import { Table, Form, Button, Input, Divider, Modal, Upload, message, Row, Col, Popover, Select, Space, Radio, Cascader, Breadcrumb } from 'antd';
import { SearchOutlined, ClockCircleOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
// import ListsComponent from "../../components/ListComponent";
import './history.scss';
import Markdown from "../../components/Markdown";
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";
// import {bus} from "./bus";


const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;

export default class MyHistory extends Component {
    state = {
        dataSource: [],
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: null

        },
        current: "",//目前正在查看的item id
        visible: false,
        visibleDetail: false,
        flowState: '',
        styleFlowState: 1,
        RadioFlowState: true,
        atflowState: '',


        // 要传输的数据（共同
        titleValue: '',
        tpl_id: '',
        cronValue: '',
        //邮件
        toWhoValue: '',  //收件人
        theUserName: '', //发件人
        cc: '',
        bcc: '',
        //dingdingRobot
        webhook: '',  //机器人地址
        is_at_all: false,
        // user_id_list: [],
        theUser2Name: '',

        mailDateSource: [],
        SMSDateSource: [],
        userDateSource: '',
        robotDateSource: [],
        groupDateSource: [],
        noticeDateSource: [],

        detail: {
            tpl: {
                title: ''
            },
            reason: '',
            data: {
                webhook: '',
                name: '',
                agent_id: '',
                chat_id: '',

            }
        },

        task_id: '',

        filter_fields: {},

        searchText: '',
        searchedColumn: '',
        searchArr: {},
        searchData: {},
    }



    pageChange = (page, size) => {
        this.state.current = page
        this.state.pageSize = size
        this.getRefresh()
    }



    componentDidMount() {

        this.state.task_id = this.props.location.search.slice(this.props.location.search.lastIndexOf('=') + 1, this.props.location.search.length)


        apis.getHistory({
            page: this.state.pagination.current,
            page_size: this.state.pagination.pageSize,
            task_id: this.state.task_id
        }).then(res => {
            this.setState({
                dataSource: res.data.results,
                pagination: {
                    current: res.data.page,
                    pageSize: res.data.page_size,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    total: res.data.total,
                    showTotal: (total) => `共加载 ${total} 个`,
                    onChange: this.pageChange,
                    position: 'bottomRight'
                },
                filter_fields: res.data.filter_fields,
            })
            if (this.state.filter_fields.length !== 0) {
                let dataArr = {};
                let arr = this.state.filter_fields.map(ele => {
                    dataArr[ele.value] = [];
                    return ele.name;
                });
                if (Object.keys(this.state.searchArr).length === 0) {
                    this.state.searchArr = dataArr;
                }
            }
        })
    }

    formRef = React.createRef();

    searchInput = []

    getColumnSearchProps = (dataIndex, title) => {
        let filterDropdown = '';
        if (dataIndex === "style") {
            filterDropdown = (
                <Form
                    ref={node => {
                        this.searchInput[`${dataIndex}`] = node;
                    }}
                    style={{ width: 200, marginBottom: 0 }}
                >
                    <Form.Item
                        name="search"
                        style={{ marginBottom: 8, marginTop: 5 }}

                    >
                        <Select
                            showSearch
                            allowClear
                            value={this.state.searchArr[`${dataIndex}`] ? this.state.searchArr[`${dataIndex}`] : ''}
                            style={{ width: 188 }}
                            placeholder={`搜索 ${title}`}
                            optionFilterProp="children"
                            onSelect={(e) => this.handleSearch(e, dataIndex)}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            <Option value="ding_record">钉钉待办</Option>
                            <Option value="ding_robot">钉钉机器人</Option>
                            <Option value="ding_group">钉钉群通知</Option>
                            <Option value="ding_notice">钉钉工作通告</Option>
                            <Option value="mail">邮件</Option>
                            <Option value="sms">短信</Option>


                            {/* {
                                this.state.choice.map(ele => {
                                    return <Option value={ele}>{ele}</Option>;
                                })
                            } */}
                        </Select>
                    </Form.Item>
                </Form>
            );
        } else if (dataIndex === "is_periodic_tasks") {
            filterDropdown = (
                <Form
                    ref={node => { this.searchInput[`${dataIndex}`] = node; }}
                    style={{ width: 200 }}
                >
                    <Form.Item name='search'>
                        <Radio.Group
                            style={{ display: 'block' }}
                            onChange={(e) => { this.state.searchArr[dataIndex] = e.target.value; }}
                        >
                            <Radio style={{ display: 'inline', margin: 30 }} value={true}>是</Radio>
                            <Radio style={{ display: 'inline' }} value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            )
        }

        else {
            filterDropdown = (
                <Input
                    ref={node => {
                        this.searchInput[dataIndex] = node;
                    }}
                    prefix={<SearchOutlined style={{ color: '#B1B1B1', fontSize: '12px' }} />}
                    placeholder={`搜索 ${title}`}
                    onChange={e => this.handleSearch(e, dataIndex)}
                    onPressEnter={e => this.handleSearch(e, dataIndex)}
                    style={{ marginBottom: 8, marginTop: 5 }}
                />
            )
        }
        return ({
            filterDropdown: (
                <div style={{ width: ' 200px', height: '97px', padding: 8, boxShadow: ' 0px 2px 4px 1px rgba(0,0,0,0.5)', borderRadius: '5px' }}>
                    {filterDropdown}
                    <Space>
                        <Button
                            onClick={(e) => this.handleReset(e, dataIndex)}
                            size="small"
                            style={{ width: '67px', height: '21px', background: '##FFFFFF', border: '1px solid #DADADA', borderRadius: '5px', fontSize: '12px', margin: '12px' }}
                        >
                            重置
                    </Button>
                        <Button
                            type="primary"
                            onClick={() => this.search()}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: '67px', height: '21px', background: '#40404C', border: '1px solid #40404C', borderRadius: '5px', fontSize: '12px', color: '#FFFFFF' }}
                        >
                            搜索
                    </Button>
                    </Space>
                </div>
            ),
            filterIcon: <SearchOutlined style={{ color: '#D8D8D8' }} />,
            render: (text) => {
                if (dataIndex === "style") {

                    if (this.state.searchData.hasOwnProperty(dataIndex)) {
                        return <>
                            <Highlighter
                                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                                searchWords={[this.styleEtoC(this.state.searchData[dataIndex])]}
                                autoEscape
                                textToHighlight={this.styleEtoC(text) ? this.styleEtoC(text).toString() : ''}
                            />
                        </>
                    } else { return this.styleEtoC(text) }
                } else if (dataIndex === "is_periodic_tasks") {

                    if (this.state.searchData.hasOwnProperty(dataIndex)) {
                        return <>
                            <Highlighter
                                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                                searchWords={[this.state.searchData[dataIndex] ? "是" : "否"]}
                                autoEscape
                                textToHighlight={text ? "是" : "否" ? text ? "是" : "否".toString() : ''}
                            />
                        </>
                    } else { return text ? "是" : "否" }
                }
                else {
                    if (this.state.searchData.hasOwnProperty(dataIndex)) {
                        return <>
                            <Highlighter
                                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                                searchWords={[this.state.searchData[dataIndex]]}
                                autoEscape
                                textToHighlight={text ? text.toString() : ''}
                            />
                        </>
                    } else { return <>{text}</> }
                }

            }

        })
    }
    handleSearch = (e, dataIndex) => {
        if (dataIndex === 'style') {
            this.state.searchArr[dataIndex] = [e]
        } else {
            this.state.searchArr[dataIndex] = [e.target.value]
        }
        // this.state.searchedColumn = dataIndex
    };

    search = () => {
        let arr = this.state.searchArr;
        let searchDataBefore = {};
        this.state.searchData = {};

        for (let key in arr) {
            searchDataBefore[`${key}`] = arr[key].toString();
        }
        for (let i in searchDataBefore) {
            if (searchDataBefore[i]) {
                this.state.searchData[i] = searchDataBefore[i]
            }
        }
        console.log(this.state.searchData);
        this.getRefresh();
    }


    handleReset = (e, dataIndex) => {
        // this.searchInput[dataIndex].handleReset(e);
        this.state.searchArr[dataIndex] = [];
        this.search();
    };

    //每列名称
    columns = [
        {
            title: "推送ID",
            dataIndex: "id",
            key: "id",
            align: "center",
            width: 100
        },
        {
            title: "推送名称",
            key: "title",
            dataIndex: "title",
            align: "center",
            width: 200,
            ...this.getColumnSearchProps("title", "推送名称"),

        },
        {
            title: "任务ID",
            dataIndex: "task_id",
            key: "task_id",
            align: "center",
            width: 150,
            ...this.getColumnSearchProps("task_id", "任务ID"),

        },
        {
            title: "推送类型",
            key: "style",
            dataIndex: "style",
            align: "center",
            width: 150,
            ...this.getColumnSearchProps("style", "推送类型"),

        },
        {
            title: "周期发送",
            key: "is_periodic_tasks",
            dataIndex: "is_periodic_tasks",
            align: "center",
            width: 120,
            render: (val) =>
                val ? <CheckCircleOutlined style={{ fontSize: '17px', color: '#0073E1 ' }} /> : <CloseCircleOutlined style={{ fontSize: '17px', color: '#B1B1B1 ' }} />
        },
        {
            title: "状态",
            key: "status",
            dataIndex: "status",
            align: "center",
            width: 80,
            render: (val) => {
                if (val == 1000) {
                    return <CheckCircleOutlined style={{ fontSize: '17px', color: '#0073E1 ' }} />
                } else if (val == 999) {
                    return <CloseCircleOutlined style={{ fontSize: '17px', color: '#B1B1B1 ' }} />
                } else if (val == 300) {
                    return <ClockCircleOutlined style={{ fontSize: '17px', color: '#B1B1B1 ' }} />
                } else if (val == 100) {
                    return <ClockCircleOutlined style={{ fontSize: '17px', color: '#B1B1B1 ' }} />
                } else {
                    return <InfoCircleOutlined style={{ fontSize: '17px', color: '#B1B1B1 ' }} />
                }
            }
        },

        {
            title: "推送时间",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            width: 180
        },
        {
            title: "操作",
            key: "handle",
            align: "center",
            width: 200,
            fixed: 'right',
            render: (obj) => {
                return <>
                    <Button className="handle-button" onClick={(e) => this.handleDetail(e, obj)}>详情</Button>
                    <Button className="handle-button" onClick={(e) => this.handleSend(e, obj)}>重发</Button>

                    <Button className="handle-button" onClick={(e) => this.handleDelete(e, obj)}>删除</Button>

                </>
            }
        },
    ];

    cronExample = (
        <div>
            <p>https://cron.qqe2.com/ </p>
            <p>https://tool.lu/crontab</p>
            <p>https://mviess.de/sysadm/crontabmaker/index.php</p>
        </div>
    );

    styleEtoC = (val) => {
        if (val == "ding_group") {
            return "钉钉群通知"
        } else if (val == "ding_robot") {
            return "钉钉机器人"
        } else if (val == "ding_notice") {
            return "钉钉工作通告"
        } else if (val == "ding_record") {
            return "钉钉待办"
        } else if (val == "mail") {
            return "邮件"
        } else if (val == "sms") {
            return "短信"
        } else if (val == "tel") {
            return "电话"
        } else {
            return "未知类型"
        }
    }


    render() {
        return (
            <div className="app-container">
                <Divider >
                    <HistoryOutlined />  历史推送
                </Divider>


                {/*搜索模块*/}
                {/* <div className="app-search"> */}
                <Row style={{ marginBottom: 10 }}>
                    <Col span={8}>
                        <Breadcrumb style={{ marginLeft: 30, marginTop: 20 }}>
                            <Breadcrumb.Item onClick={(e) => { this.setState({ task_id: '' }); this.getRefresh() }}>
                                <NavLink to={`/task/history`}>
                                    所有历史
                        </NavLink>
                            </Breadcrumb.Item>
                            {this.state.task_id !== '' &&
                                <Breadcrumb.Item>
                                    id:{this.state.task_id}的历史
                        </Breadcrumb.Item>
                            }
                        </Breadcrumb>
                    </Col>


                </Row>
                {/* <Button className="new-button" type="primary" onClick={this.showModal} htmlType="submit">
                        新建推送
                    </Button> */}
                {/* </div> */}

                {/* 下方表格 */}
                <Table
                    columns={this.columns}
                    dataSource={this.state.dataSource}
                    pagination={this.state.pagination}
                    scroll={{ y: 'calc(100vh - 280px)', x: '100%' }}
                />


                {/* 详情弹窗 */}
                <Modal
                    title="详情"
                    width="645px"
                    className="Detail"

                    visible={this.state.visibleDetail}
                    onCancel={(e) => { this.setState({ visibleDetail: false }) }}
                    footer={
                        [] // 设置footer为空，去掉 取消 确定默认按钮
                    }
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    bodyStyle={{ overflowY: 'auto', marginLeft: '45px', padding: "15px 10% 80px 10%" }}
                >

                    <span className="title"> 推送名称：</span>
                    <span className="ans">{this.state.detail.title}</span>
                    <br />
                    <span className="title"> 推送类型：</span>
                    <span className="ans">{this.state.detail.style == "ding_group" ? "钉钉群通知" :
                        this.state.detail.style == "ding_robot" ? "钉钉机器人" :
                            this.state.detail.style == "ding_notice" ? "钉钉工作通告" :
                                this.state.detail.style == "ding_record" ? "钉钉待办" :
                                    this.state.detail.style == "mail" ? "邮件" :
                                        this.state.detail.style == "sms" ? "短信" :
                                            this.state.detail.style == "tel" ? "电话" : "未知类型"

                    }</span>
                    <br />

                    <span className="title"> 模板id：</span>
                    <span className="ans">{this.state.detail.tpl_id}</span>
                    <br />
                    <span className="title"> 模板标题：</span>
                    <span className="ans">{this.state.detail.tpl.title}</span>
                    <br />
                    <span className="title"> 推送时间：</span>
                    <span className="ans">{this.state.detail.created_at}</span>
                    <br />
                    <span className="title"> 发件方：</span>
                    <span className="ans">{
                        this.state.detail.style == "ding_group" ? this.state.detail.data.chat_id :
                            this.state.detail.style == "ding_robot" ? this.state.detail.data.webhook :
                                this.state.detail.style == "ding_notice" ? this.state.detail.data.agent_id :
                                    this.state.detail.style == "mail" ? this.state.detail.data.name :
                                        this.state.detail.style == "sms" ? "管理员短信" :
                                            this.state.detail.style == "tel" ? "管理员电话" : "管理员"
                    }</span>
                    <br />
                    <span className="title"> 收件方：</span>
                    <span className="ans">{this.state.detail.receiver}</span>
                    <br />
                    <span className="title"> 状态：</span>
                    <span className="ans">{this.state.detail.status == 1000 ? "完成" :
                        this.state.detail.status == 999 ? "失败" :
                            this.state.detail.status == 300 ? "执行中" :
                                this.state.detail.status == 100 ? "等待中" : "未知状态"
                    }</span>
                    <br />

                    <span className="title"> 状态原因：</span>
                    <span className="ans">{this.state.detail.reason}</span>
                    <br />

                </Modal>
            </div>

        )
    }

    getRefresh() {
        let that = this;
        apis.getHistory({
            page: this.state.current,
            page_size: this.state.pageSize,
            ...this.state.searchData
        }).then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                that.setState({
                    dataSource: res.data.results,
                    pagination: {
                        current: res.data.page,
                        pageSize: res.data.page_size,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        total: res.data.total,
                        onChange: this.pageChange,
                        showTotal: (total) => `共加载 ${total} 个`,
                        position: 'bottomRight'
                    },
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    handleCancel = (e) => {
        this.formRef.current.resetFields();
        this.setState({
            visible: false,
        });
    };


    onFinish = () => {
        // console.log(this.formRef.current.getFieldValue('users'))
        this.formRef.current
            .validateFields()
            .then((val) => {
                let datas = {};
                if (this.state.atflowState == 11) {
                    this.setState({ is_at_all: true })
                }
                if (this.state.flowState === 1) {
                    datas = {
                        title: this.state.titleValue,
                        data: {
                            to: this.state.toWhoValue,
                            username: this.state.theUserName,
                            cc: this.state.cc,
                            bcc: this.state.bcc,
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'mail',
                        is_run_now: this.state.RadioFlowState,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: !this.state.RadioFlowState
                    };
                }
                else if (this.state.flowState === 2) {
                    datas = {
                        title: this.state.titleValue,
                        data: {
                            to: this.state.toWhoValue,
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'sms',
                        is_run_now: this.state.RadioFlowState,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: !this.state.RadioFlowState
                    };
                }

                else if (this.state.flowState === 3) {
                    datas = {
                        title: this.state.titleValue,
                        data: {
                            is_at_all: this.state.is_at_all,
                            agent_id: this.state.theUser2Name,
                            user_id_list: this.state.toWhoValue
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'ding_notice',
                        is_run_now: this.state.RadioFlowState,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: !this.state.RadioFlowState
                    };
                }
                else if (this.state.flowState === 4) {
                    datas = {
                        title: this.state.titleValue,
                        data: {
                            is_at_all: this.state.is_at_all,
                            chat_id: this.state.theUser2Name,
                            user_id_list: this.state.toWhoValue
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'ding_group',
                        is_run_now: this.state.RadioFlowState,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: !this.state.RadioFlowState
                    };
                }
                else if (this.state.flowState === 5) {

                    datas = {
                        title: this.state.titleValue,
                        data: {
                            webhook: this.state.webhook,
                            is_at_all: this.state.is_at_all,
                            user_id_list: this.state.toWhoValue,
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'ding_robot',
                        is_run_now: this.state.RadioFlowState,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: !this.state.RadioFlowState
                    }
                };

                apis.createHistory(datas);
                this.formRef.current.resetFields();
                this.getRefresh();
            })
            .catch((err) => {
                console.log(err);
            });
        this.setState({
            visible: false,
        });

    };

    handleDelete = (e, obj) => {
        let that = this;
        confirm({
            title: `删除模版`,
            icon: <ExclamationCircleOutlined />,
            content: `确认要删除${obj.title}吗？`,
            okText: '删除',
            cancelText: '取消',
            onOk() {
                that.deleteAction(e.domEvent, obj);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    deleteAction = (e, obj) => {
        apis.deleteHistory(obj.id).then(res => {

            if (res.code == 0) {
                message.success("删除成功！");
                this.getRefresh();

            } else {
                message.error(res.message);
            }
        }).catch(err => {
            console.log(err);
            message.error(err.message);
        });
    };

    handleDetail = (e, obj) => {
        apis.detailHistory(obj.id).then(res => {

            if (res.code == 0) {
                this.setState({
                    visibleDetail: true,
                    detail: res.data
                });
                console.log(res)

            } else {
                message.error(res.message);
            }
        }).catch(err => {
            console.log(err);
            message.error(err.message);
        });
    }

    handleSend = (e, obj) => {
        let that = this;
        confirm({
            title: ``,
            icon: <ExclamationCircleOutlined />,
            content: `确认要重新发送${obj.title}吗？`,
            okText: '发送',
            cancelText: '取消',
            onOk() {
                that.sendAction(e.domEvent, obj);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    sendAction = (e, obj) => {
        apis.sendHistory(obj.id).then(res => {

            if (res.code == 0) {
                message.success("发送成功！");
                this.getRefresh();
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            console.log(err);
            message.error(err.message);
        });
    };


}