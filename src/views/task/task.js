import apis from "../../utils/api/unsplash/index";
import React, { Component, useState } from "react";
import Highlighter from 'react-highlight-words';
import { Table, Form, Button, Input, Divider, Modal, Dropdown, message, Row, Col, Popover, Select, Space, Radio, Cascader, Menu } from 'antd';
import { SearchOutlined, PlusCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, CaretDownOutlined, ExclamationCircleOutlined, DoubleRightOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
// import ListsComponent from "../../components/ListComponent";
import './task.scss';
import EditForm from "./forms/editForm"
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";

import { NavLink } from "react-router-dom";
// import {bus} from "./bus";





const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;

export default class MyTask extends Component {
    state = {
        dataSource: [],
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: null,
            position: 'bottomRight'

        },
        current: "",//目前正在查看的item id

        visible: false,
        visibleDetail: false,
        flowState: '',
        styleFlowState: 1,
        RadioFlowState: true,//false的时候显示定时
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
        is_run_now: false,
        is_periodic_tasks: false,

        mailDateSource: [],
        SMSDateSource: [],
        userDateSource: '',
        robotDateSource: [],
        groupDateSource: [],
        noticeDateSource: [],
        recordDateSource: [],

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


        editVisible: false,
        transferVisible: false,
        editLoading: false,
        currentRowData: {
            id: ''
        },
        addUserModalVisible: false,
        addUserModalLoading: false,

        myKey: "",

        filter_fields: {},

        searchText: '',
        searchedColumn: '',
        searchArr: {},
        searchData: {},
        choice: [],
        transferId: '',
    }

    pageChange = (page, size) => {
        this.state.current = page
        this.state.pageSize = size
        this.getRefresh()
    }

    componentDidMount() {
        apis.getTask({
            page: this.state.pagination.current,
            page_size: this.state.pagination.pageSize
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
            this.state.choice = this.state.filter_fields[2].choice
            console.log(this.state.searchArr)
        })
    };


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

    // getColumnSearchProps = (dataIndex, title) => ({
    //     filterDropdown: (
    //         <div style={{ padding: 8 }}>
    //             <Input
    //                 ref={node => {
    //                     this.searchInput[dataIndex] = node;
    //                 }}
    //                 placeholder={`搜索 ${title}`}
    //                 onChange={e => this.handleSearch(e, dataIndex)}
    //                 onPressEnter={e => this.handleSearch(e, dataIndex)}
    //                 style={{ marginBottom: 8, display: 'block' }}
    //             />
    //             <Space>
    //                 <Button
    //                     type="primary"
    //                     onClick={() => this.search()}
    //                     icon={<SearchOutlined />}
    //                     size="small"
    //                     style={{ width: 90 }}
    //                 >
    //                     搜索
    //                 </Button>
    //                 <Button onClick={(e) => this.handleReset(e, dataIndex)} size="small" style={{ width: 90 }}>
    //                     重置
    //                 </Button>

    //             </Space>
    //         </div>
    //     ),
    //     filterIcon: <SearchOutlined style={{ color: '#1890ff' }} />,
    //     render: text => {
    //         if ( this.state.searchData.hasOwnProperty(dataIndex) ) {
    //             return <>
    //                 <Highlighter
    //                     highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
    //                     searchWords={[this.state.searchData[dataIndex]]}
    //                     autoEscape
    //                     textToHighlight={text ? text.toString() : ''}
    //                 />
    //             </>
    //         } else { return <>{text}</> }

    //     }

    // });

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
            width: 150
        },

        {
            title: "uuid",
            dataIndex: "uuid",
            key: "uuid",
            align: "center",
            width: 200,
            ...this.getColumnSearchProps("uuid", "uuid"),

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

            // ...this.getColumnSearchProps("is_periodic_tasks", "周期发送"),
        },
        {
            title: "推送次数",
            key: "count",
            dataIndex: "count",
            align: "center",
            width: 100,

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
                    {/* <Button className="handle-button">发送</Button> */}
                    {/* <Button className="handle-button" onClick={(e) => this.handleEdit(e, obj)}>编辑</Button> */}

                    <NavLink target="_blank" to={`/task/history?id=${obj.id}`}>
                        <Button className="handle-button">历史</Button>
                    </NavLink>
                    {/* <Button className="handle-button" onClick={(e) => this.handleDelete(e, obj)}>删除</Button> */}
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item key="0" onClick={(e) => this.handleSend(e, obj)}>发送</Menu.Item>
                            <Menu.Item key="1" onClick={(e) => this.handleEdit(e, obj)}>编辑</Menu.Item>
                            <Menu.Item key="2" onClick={(e) => this.handleDelete(e, obj)}>删除</Menu.Item>
                            <Menu.Item key="3" onClick={(e) => this.handleTransfer(e, obj)}>转让</Menu.Item>


                        </Menu>
                    }>
                        {/* <div style={{display: 'inline-block'}}>
                              <a  onClick={e => e.preventDefault()}>
                              <DoubleRightOutlined />
                             </a>
                              </div> */}
                        <Button className="handle-button" onClick={e => e.preventDefault()}>  <DoubleRightOutlined /></Button>
                    </Dropdown>
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

    formRef = React.createRef();
    transFormRef = React.createRef();


    handleTitleChange(e) {
        this.setState({
            titleValue: e.target.value
        })
    }

    handleToWhoChange(e) {
        this.setState({
            toWhoValue: e.target.value
        })
    }

    handleUserChange(e) {
        this.setState({
            theUserName: e
        })
    }

    handleUser2Change(e) {
        this.setState({
            theUser2Name: e.target.value
        })
    }

    handleWebhookChange(e) {
        this.setState({
            webhook: e.target.value
        })
    }

    handleCronChange(e) {
        console.log(e)
        this.setState({
            cronValue: e.target.value
        })
    }

    handleRadioChange(val) {
        if (val.target.value == 1) {
            this.setState({
                is_periodic_tasks: false,
                is_run_now: false,
            })
        }
        if (val.target.value == 2) {
            this.setState({
                is_periodic_tasks: false,
                is_run_now: true
            })
        }
        if (val.target.value == 3) {
            // console.log("zqfs")
            this.setState({
                is_periodic_tasks: true,
                is_run_now: false,
            })
        }

    }


    onFocusMail = (e) => {
        let that = this;
        apis.getMailbox({
            page: '1',
            // size: this.state.pageSize,
            // ...this.state.searchData
        }).then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                // console.log(res.data.results)
                that.setState({
                    mailDateSource: res.data.results
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    }

    onFocusSMS = (e) => {
        let that = this;
        apis.getSMS({
            page: '1',
            // size: this.state.pageSize,
            // ...this.state.searchData
        }).then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                // console.log(res.data)
                that.setState({
                    SMSDateSource: res.data.results
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    }

    onFocusRobot = (e) => {
        let that = this;
        apis.getDingRobot({
            page: '1',
            // size: this.state.pageSize,
            // ...this.state.searchData
        }).then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                that.setState({
                    robotDateSource: res.data.results
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    }

    onFocusGroup = (e) => {
        let that = this;
        apis.getDingGroup({
            page: '1',
            // size: this.state.pageSize,
            // ...this.state.searchData
        }).then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                that.setState({
                    groupDateSource: res.data.results
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    }

    onFocusNotice = (e) => {
        let that = this;
        apis.getDingNotice({
            page: '1',
            // size: this.state.pageSize,
            // ...this.state.searchData
        }).then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                that.setState({
                    noticeDateSource: res.data.results
                });
                // console.log(this.state.noticeDateSource)
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    };

    onFocusRecord = (e) => {
        let that = this;
        apis.getDingRecord({
            page: '1',
            // size: this.state.pageSize,
            // ...this.state.searchData
        }).then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                // console.log(res.data)
                that.setState({
                    recordDateSource: res.data.results
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    }

    onFocusUser = (e) => {
        let that = this;
        apis.getUser().then(res => {
            // console.log(res);
            if (res.code == 0 || res.code == 200) {
                // console.log(res.data.results)
                that.setState({
                    userDateSource: res.data
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
    }

    MailCopyChange = (val, op) => {
        this.setState({
            tpl_id: op[0].value
        })
    }

    SMSCopyChange = (val, op) => {
        this.setState({
            tpl_id: op[0].value
        })
    }

    RobotCopyChange = (val, op) => {
        // console.log(val,op)
        this.setState({
            tpl_id: op[0].value
        })
    }

    GroupCopyChange = (val, op) => {
        // console.log(val,op)
        this.setState({
            tpl_id: op[0].value
        })
    }

    NoticeCopyChange = (val, op) => {
        // console.log(val,op)
        this.setState({
            tpl_id: op[0].value
        })
    }

    RecordCopyChange = (val, op) => {
        this.setState({
            tpl_id: op[0].value
        })
    }

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
        const { titleValue, toWhoValue, webhook, RadioFlowState, cronValue, theUser2Name, myKey } = this.state

        const userChildren = [];
        for (let i = 0; i < this.state.userDateSource.length; i++) {
            userChildren.push(<Option key={this.state.userDateSource[i].value} children>{this.state.userDateSource[i].name}</Option>);
        }


        const mailChildren = [];
        for (let i = 0; i < this.state.mailDateSource.length; i++) {
            mailChildren.push({
                value: this.state.mailDateSource[i].id,
                label: this.state.mailDateSource[i].title,
                children: [
                    {
                        value: this.state.mailDateSource[i].content.content,
                        label: this.state.mailDateSource[i].content.content,
                    }
                ]
            })
        };

        const SMSChildren = [];
        for (let i = 0; i < this.state.SMSDateSource.length; i++) {
            SMSChildren.push({
                value: this.state.SMSDateSource[i].id,
                label: this.state.SMSDateSource[i].title,
                children: [
                    {
                        value: this.state.SMSDateSource[i].content.content,
                        label: this.state.SMSDateSource[i].content.content,
                    }
                ]
            })
        };

        const robotChildren = [];
        for (let i = 0; i < this.state.robotDateSource.length; i++) {
            this.state.robotDateSource[i].content_format === "text" ? robotChildren.push({
                value: this.state.robotDateSource[i].id,
                label: this.state.robotDateSource[i].title,
                children: [
                    {
                        value: this.state.robotDateSource[i].content.content,
                        label: this.state.robotDateSource[i].content.content,
                    }
                ]
            }) :
                robotChildren.push({
                    value: this.state.robotDateSource[i].id,
                    label: this.state.robotDateSource[i].title,
                    children: [
                        {
                            value: this.state.robotDateSource[i].content.text,
                            label: this.state.robotDateSource[i].content.text,
                        }
                    ]
                })
        };

        const noticeChildren = [];
        for (let i = 0; i < this.state.noticeDateSource.length; i++) {
            this.state.noticeDateSource[i].content_format === "text" ? noticeChildren.push({
                value: this.state.noticeDateSource[i].id,
                label: this.state.noticeDateSource[i].title,
                children: [
                    {
                        value: this.state.noticeDateSource[i].content.content,
                        label: this.state.noticeDateSource[i].content.content,
                    }
                ]
            }) :
                noticeChildren.push({
                    value: this.state.noticeDateSource[i].id,
                    label: this.state.noticeDateSource[i].title,
                    children: [
                        {
                            value: this.state.noticeDateSource[i].content.text,
                            label: this.state.noticeDateSource[i].content.text,
                        }
                    ]
                })
        };

        const groupChildren = [];
        for (let i = 0; i < this.state.groupDateSource.length; i++) {
            this.state.groupDateSource[i].content_format === "text" ? groupChildren.push({
                value: this.state.groupDateSource[i].id,
                label: this.state.groupDateSource[i].title,
                children: [
                    {
                        value: this.state.groupDateSource[i].content.content,
                        label: this.state.groupDateSource[i].content.content,
                    }
                ]
            }) :
                groupChildren.push({
                    value: this.state.groupDateSource[i].id,
                    label: this.state.groupDateSource[i].title,
                    children: [
                        {
                            value: this.state.groupDateSource[i].content.text,
                            label: this.state.groupDateSource[i].content.text,
                        }
                    ]
                })
        };

        const recordChildren = [];
        for (let i = 0; i < this.state.recordDateSource.length; i++) {
            recordChildren.push({
                value: this.state.recordDateSource[i].id,
                label: this.state.recordDateSource[i].title,
                children: [
                    {
                        value: this.state.recordDateSource[i].content.content,
                        label: this.state.recordDateSource[i].content.content,
                    }
                ]
            })
        };

        return (
            <div className="app-container">
                <Divider >
                    <HistoryOutlined />  推送任务
                </Divider>

                {/*新建按钮*/}
                {/* <div height="30px" width="100%"  >
                    <Button className="new-button" type="primary" onClick={this.showModal} htmlType="submit">
                        新建推送
                    </Button>
                </div> */}

                {/* 下方表格 */}
                {/* <Table
                    columns={this.columns}
                    dataSource={this.state.dataSource}
                    pagination={this.state.pagination}
                    scroll={{ y: 'calc(100vh - 280px)' }}
                /> */}
                {/* 下方表格 */}
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 35, top: 37, zIndex: 1 }}>
                        <PlusCircleOutlined style={{ fontSize: "15px", color: "#000000" }} onClick={this.showModal} />
                    </div>
                    <Table
                        columns={this.columns}
                        dataSource={this.state.dataSource}
                        pagination={this.state.pagination}
                        scroll={{ y: 'calc(100vh - 280px)', x: '100%' }}

                    />
                </div>


                {/* 新建模板弹出框 */}
                <Modal
                    title="新建推送"
                    width="645px"
                    visible={this.state.visible}
                    onOk={this.onFinish}
                    onCancel={this.handleCancel}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    okText="执行"
                    cancelText="取消"
                    bodyStyle={{ height: '580px', overflowY: 'auto', marginLeft: '45px' }}
                    destroyOnClose={true}
                    key={myKey}
                >

                    <Form
                        className="addModel"
                        name="basic"
                        onFinish={this.onFinish}
                        ref={this.formRef}
                        labelCol={{ span: 4 }}
                    >

                        {/* 标题栏 */}
                        <Form.Item
                            label="推送名称"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    validator: (_, value, callback) => {
                                        if (!titleValue) {
                                            callback('请输入推送名称')
                                        } else {
                                            callback()
                                        }
                                    }
                                },

                            ]}
                        >
                            <Input
                                placeholder="请输入推送名称"
                                value={titleValue}
                                onChange={this.handleTitleChange.bind(this)}
                                style={{ width: 400, height: 40, borderRadius: 5 }}
                            />
                        </Form.Item>


                        <Form.Item
                            label="推送类型"
                            name="style"
                            rules={[{ required: true }]}
                        >
                            <Select
                                style={{ width: 400 }}
                                onChange={e => { this.setState({ flowState: e }) }}
                                className="selectStyle"
                            >
                                <Option value={1} >邮件</Option>
                                <Option value={2} >短信</Option>
                                <Option value={3} >钉钉工作通告</Option>
                                <Option value={4} >钉钉群通知</Option>
                                <Option value={5} >钉钉机器人</Option>
                                <Option value={6} >钉钉待办</Option>
                            </Select>
                        </Form.Item>



                        {
                            this.state.flowState == '1' &&
                            <>
                                <Form.Item
                                    label="发件人"
                                    name="mail-1"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="请选择发件人"
                                        style={{ width: 400, height: 40, borderRadius: 5 }}
                                        onChange={this.handleUserChange.bind(this)}
                                        className="selectStyle"
                                        onFocus={this.onFocusUser}
                                    >
                                        {userChildren}
                                    </Select>
                                </Form.Item>


                                <Form.Item
                                    label="收件人"
                                    name="mail-3"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="xxxx@ximalaya.com"
                                        value={toWhoValue}
                                        onChange={this.handleToWhoChange.bind(this)}
                                        style={{ width: 400, height: 40, borderRadius: 5 }}
                                    />
                                </Form.Item>

                                {/* <Form.Item
                                label=""
                                name="mail-4"
                                rules={[
                                    {
                                        required: true
                                    },
                                ]}
                                style={{minHeight: 10}}
                            >
                                
                            </Form.Item> */}

                                <Form.Item
                                    label="发送方式"
                                    name="xxx"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={this.handleRadioChange.bind(this)}
                                    >
                                        <Radio value={1}>仅创建</Radio>
                                        <Radio value={2}>创建并发送</Radio>
                                        <Radio value={3}>周期发送</Radio>

                                    </Radio.Group>
                                </Form.Item>

                                {
                                    (this.state.is_periodic_tasks == true) && <>
                                        <Form.Item
                                            label="定时规则"
                                            name="cron"

                                            rules={[{ required: true }]}
                                        >
                                            <Input
                                                placeholder="Cron 表达式"
                                                value={cronValue}
                                                onChange={this.handleCronChange.bind(this)}
                                                style={{ width: 400, height: 40, borderRadius: 5 }}
                                            />
                                        </Form.Item>
                                        <Row style={{ marginBottom: 24, marginTop: -24 }}>
                                            <Col sm={4}></Col>
                                            <Col sm={20}>
                                                <Popover
                                                    className="shili"
                                                    placement="right"
                                                    content={this.cronExample}
                                                    trigger="click"
                                                >
                                                    <span>示例</span>
                                                </Popover>
                                            </Col>
                                        </Row></>
                                }

                                <Form.Item
                                    label="编辑方式"
                                    name="mail-6"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ styleFlowState: e }) }}
                                        className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} disabled>手动输入</Option>

                                    </Select>
                                </Form.Item>
                                {
                                    this.state.styleFlowState == "111" &&
                                    <>
                                        <Form.Item
                                            label="正文"
                                            name="mbzw"
                                            rules={[
                                                {
                                                    required: true
                                                },
                                            ]}
                                        >
                                            <Cascader
                                                options={mailChildren}
                                                style={{ width: 400 }}
                                                placeholder="请选择正文"
                                                notFoundContent="暂无模板"
                                                onFocus={this.onFocusMail}
                                                onChange={this.MailCopyChange}
                                            />
                                        </Form.Item>
                                    </>

                                }
                            </>
                        }

                        {
                            this.state.flowState == '2' && <>

                                <Form.Item
                                    label="接收方"
                                    name="receiver"

                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="请输入接收方"
                                        value={toWhoValue}
                                        onChange={this.handleToWhoChange.bind(this)}
                                        style={{ width: 400, height: 40, borderRadius: 5 }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="发送方式"
                                    name="send-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={this.handleRadioChange.bind(this)}
                                    >
                                        <Radio value={1}>仅创建</Radio>
                                        <Radio value={2}>创建并发送</Radio>
                                        <Radio value={3}>周期发送</Radio>

                                    </Radio.Group>
                                </Form.Item>

                                {
                                    this.state.is_periodic_tasks == true &&
                                    <Form.Item
                                        label="定时规则"
                                        name="rules"
                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Cron 表达式"
                                            value={cronValue}
                                            onChange={this.handleCronChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />
                                        <Popover
                                            className="shili"
                                            placement="right"
                                            content={this.cronExample}
                                            trigger="click"
                                        >
                                            <span>示例</span>
                                        </Popover>
                                    </Form.Item>
                                }

                                <Form.Item
                                    label="编辑方式"
                                    name="edit-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ styleFlowState: e }) }}
                                        className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} disabled>手动输入</Option>

                                    </Select>
                                </Form.Item>
                                {
                                    this.state.styleFlowState == "111" &&
                                    <>
                                        <Form.Item
                                            label="正文"
                                            name="mbzw"
                                            rules={[
                                                {
                                                    required: true
                                                },
                                            ]}
                                        >
                                            <Cascader
                                                options={SMSChildren}
                                                style={{ width: 400 }}
                                                placeholder="请选择正文"
                                                notFoundContent="暂无模板"
                                                onFocus={this.onFocusSMS}
                                                onChange={this.SMSCopyChange}
                                            />
                                        </Form.Item>
                                    </>

                                }

                            </>
                        }

                        {
                            this.state.flowState == '3' &&
                            <>
                                {/* <Form.Item
                                    label="发送方"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="请输入发送方"
                                        value={theUser2Name}
                                        onChange={this.handleUser2Change.bind(this)}
                                        style={{ width: 400, height: 40, borderRadius: 5 }}
                                    />

                                </Form.Item> */}



                                <Form.Item
                                    label="接收对象"
                                    name="receiver"

                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                    style={{ minHeight: 10 }}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        className="selectStyle"
                                        onChange={e => { this.setState({ atflowState: e }) }}
                                    // defaultValue={12}
                                    >
                                        <Option value={11} disabled>@所有人</Option>
                                        <Option value={12} >@指定的人</Option>
                                    </Select>
                                </Form.Item>
                                {
                                    this.state.atflowState == 12 &&

                                    <Form.Item
                                        label="被@的人"
                                        name="whobeat"

                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="工号"
                                            value={toWhoValue}
                                            onChange={this.handleToWhoChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />
                                    </Form.Item>
                                }
                                <Form.Item
                                    label="发送方式"
                                    name="send-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={this.handleRadioChange.bind(this)}
                                    >
                                        <Radio value={1}>仅创建</Radio>
                                        <Radio value={2}>创建并发送</Radio>
                                        <Radio value={3}>周期发送</Radio>

                                    </Radio.Group>
                                </Form.Item>


                                {
                                    this.state.is_periodic_tasks == true &&
                                    <Form.Item
                                        label="定时规则"
                                        name="rules"

                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Cron 表达式"
                                            value={cronValue}
                                            onChange={this.handleCronChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />

                                        <Popover
                                            className="shili"
                                            placement="right"
                                            content={this.cronExample}
                                            trigger="click"
                                        >
                                            <span>示例</span>
                                        </Popover>

                                    </Form.Item>
                                }


                                <Form.Item
                                    label="编辑方式"
                                    name="edit-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ styleFlowState: e }) }}
                                        className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} disabled>手动输入</Option>

                                    </Select>
                                </Form.Item>
                                {
                                    this.state.styleFlowState == "111" &&
                                    <>
                                        <Form.Item
                                            label="正文"
                                            name="mbzw"
                                            rules={[
                                                {
                                                    required: true
                                                },
                                            ]}
                                        >
                                            <Cascader
                                                options={noticeChildren}
                                                style={{ width: 400 }}
                                                placeholder="请选择正文"
                                                notFoundContent="暂无模板"
                                                onFocus={this.onFocusNotice}
                                                onChange={this.NoticeCopyChange}
                                            />
                                        </Form.Item>
                                    </>

                                }
                            </>
                        }

                        {
                            this.state.flowState == '4' &&
                            <>
                                <Form.Item
                                    label="发送方"
                                    name="theUser2Name"

                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="请输入发送方"
                                        value={theUser2Name}
                                        onChange={this.handleUser2Change.bind(this)}
                                        style={{ width: 400, height: 40, borderRadius: 5 }}
                                    />

                                </Form.Item>



                                {/* <Form.Item
                                    label="接收对象"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                    style={{ minHeight: 10 }}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ atflowState: e }) }}
                                    >
                                        <Option value={10} >不@任何人</Option>
                                        <Option value={11} >@所有人</Option>
                                        <Option value={12} >@指定的人</Option>
                                    </Select>
                                </Form.Item>
                                {
                                    this.state.atflowState== 12 &&

                                    <Form.Item
                                        label="被@的人"
                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="工号"
                                            value={toWhoValue}
                                            onChange={this.handleToWhoChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />
                                    </Form.Item>
                                } */}
                                <Form.Item
                                    label="发送方式"
                                    name="handleRadio"

                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={this.handleRadioChange.bind(this)}
                                    >
                                        <Radio value={1}>仅创建</Radio>
                                        <Radio value={2}>创建并发送</Radio>
                                        <Radio value={3}>周期发送</Radio>

                                    </Radio.Group>
                                </Form.Item>


                                {
                                    this.state.is_periodic_tasks == true &&
                                    <Form.Item
                                        label="定时规则"
                                        name="rule"

                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Cron 表达式"
                                            value={cronValue}
                                            onChange={this.handleCronChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />

                                        <Popover
                                            className="shili"
                                            placement="right"
                                            content={this.cronExample}
                                            trigger="click"
                                        >
                                            <span>示例</span>
                                        </Popover>

                                    </Form.Item>
                                }


                                <Form.Item
                                    label="编辑方式"
                                    name="edit-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ styleFlowState: e }) }}
                                        className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} disabled>手动输入</Option>

                                    </Select>
                                </Form.Item>
                                {
                                    this.state.styleFlowState == "111" &&
                                    <>
                                        <Form.Item
                                            label="正文"
                                            name="mbzw"
                                            rules={[
                                                {
                                                    required: true
                                                },
                                            ]}
                                        >
                                            <Cascader
                                                options={groupChildren}
                                                style={{ width: 400 }}
                                                placeholder="请选择正文"
                                                notFoundContent="暂无模板"
                                                onFocus={this.onFocusGroup}
                                                onChange={this.GroupCopyChange}
                                            />
                                        </Form.Item>
                                    </>

                                }
                            </>
                        }

                        {
                            this.state.flowState == '5' &&
                            <>
                                <Form.Item
                                    label="发送方"
                                    name="theUser2Name"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="请输入发送方"
                                        value={webhook}
                                        onChange={this.handleWebhookChange.bind(this)}
                                        style={{ width: 400, height: 40, borderRadius: 5 }}
                                    />

                                </Form.Item>

                                <Form.Item
                                    label="密钥"
                                    name="secret"
                                >
                                    <Input
                                        placeholder="请输入密钥"
                                        style={{ width: 400, height: 40, borderRadius: 5 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="发送对象"
                                    name="send-object"

                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                    style={{ minHeight: 10 }}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        className="selectStyle"
                                        onChange={e => { this.setState({ atflowState: e }) }}
                                    >
                                        <Option value={10} >不@任何人</Option>
                                        <Option value={11} >@所有人</Option>
                                        <Option value={12} >@指定的人</Option>
                                    </Select>
                                </Form.Item>
                                {
                                    this.state.atflowState == 12 &&

                                    <Form.Item
                                        label="被@的人"
                                        name="whobeat"

                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="工号"
                                            value={toWhoValue}
                                            onChange={this.handleToWhoChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />
                                    </Form.Item>
                                }
                                <Form.Item
                                    label="发送方式"
                                    name="send-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={this.handleRadioChange.bind(this)}
                                    >
                                        <Radio value={1}>仅创建</Radio>
                                        <Radio value={2}>创建并发送</Radio>
                                        <Radio value={3}>周期发送</Radio>

                                    </Radio.Group>
                                </Form.Item>


                                {
                                    this.state.is_periodic_tasks == true &&
                                    <Form.Item
                                        label="定时规则"
                                        name="rules"

                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Cron 表达式"
                                            value={cronValue}
                                            onChange={this.handleCronChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />

                                        <Popover
                                            className="shili"
                                            placement="right"
                                            content={this.cronExample}
                                            trigger="click"
                                        >
                                            <span>示例</span>
                                        </Popover>

                                    </Form.Item>
                                }


                                <Form.Item
                                    label="编辑方式"
                                    name="edit-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ styleFlowState: e }) }}
                                        className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} disabled>手动输入</Option>

                                    </Select>
                                </Form.Item>
                                {
                                    this.state.styleFlowState == "111" &&
                                    <>
                                        <Form.Item
                                            label="正文"
                                            name="mbzw"
                                            rules={[
                                                {
                                                    required: true
                                                },
                                            ]}
                                        >
                                            <Cascader
                                                options={robotChildren}
                                                style={{ width: 400 }}
                                                placeholder="请选择正文"
                                                notFoundContent="暂无模板"
                                                onFocus={this.onFocusRobot}
                                                onChange={this.RobotCopyChange}
                                            />
                                        </Form.Item>
                                    </>

                                }
                            </>
                        }

                        {
                            this.state.flowState == '6' && <>
                                <Form.Item
                                    label="待办方式"
                                    name="is_alone"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ recordFlowState: e }) }}
                                        className="selectStyle"
                                    >
                                        <Option value={false} >协作待办</Option>
                                        <Option value={true} >独立待办</Option>

                                    </Select>
                                </Form.Item>

                                {
                                    this.state.recordFlowState === false && <>
                                        <Form.Item
                                            label="执行者"
                                            name="user_id_list"
                                            rules={[{ required: true }]}
                                        >
                                            <Input
                                                placeholder="请输入接收方"
                                                // value={toWhoValue}
                                                // onChange={this.handleToWhoChange.bind(this)}
                                                style={{ width: 400, height: 40, borderRadius: 5 }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="参与者"
                                            name="participant_id_list"
                                        >
                                            <Input
                                                placeholder="请输入参与者"
                                                // value={toWhoValue}
                                                // onChange={this.handleToWhoChange.bind(this)}
                                                style={{ width: 400, height: 40, borderRadius: 5 }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="逾期时间"
                                            name="due_timedelta"
                                        >
                                            <Input
                                                placeholder="请输入逾期时间"
                                                // value={toWhoValue}
                                                // onChange={this.handleToWhoChange.bind(this)}
                                                style={{ width: 400, height: 40, borderRadius: 5 }}
                                            />
                                        </Form.Item>

                                    </>
                                }
                                {
                                    this.state.recordFlowState === true && <>
                                        <Form.Item
                                            label="执行者"
                                            name="user_id_list"
                                            rules={[{ required: true }]}
                                        >
                                            <Input
                                                placeholder="请输入执行者"
                                                // value={toWhoValue}
                                                // onChange={this.handleToWhoChange.bind(this)}
                                                style={{ width: 400, height: 40, borderRadius: 5 }}
                                            />
                                        </Form.Item>
                                    </>
                                }


                                <Form.Item
                                    label="发送方式"
                                    name="send-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={this.handleRadioChange.bind(this)}
                                    >
                                        <Radio value={1}>仅创建</Radio>
                                        <Radio value={2}>创建并发送</Radio>
                                        <Radio value={3}>周期发送</Radio>

                                    </Radio.Group>
                                </Form.Item>

                                {
                                    this.state.is_periodic_tasks == true &&
                                    <Form.Item
                                        label="定时规则"
                                        name="rules"
                                        rules={[
                                            {
                                                required: true
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Cron 表达式"
                                            value={cronValue}
                                            onChange={this.handleCronChange.bind(this)}
                                            style={{ width: 400, height: 40, borderRadius: 5 }}
                                        />
                                        <Popover
                                            className="shili"
                                            placement="right"
                                            content={this.cronExample}
                                            trigger="click"
                                        >
                                            <span>示例</span>
                                        </Popover>
                                    </Form.Item>
                                }

                                <Form.Item
                                    label="编辑方式"
                                    name="edit-style"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={e => { this.setState({ styleFlowState: e }) }}
                                        className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} disabled>手动输入</Option>

                                    </Select>
                                </Form.Item>
                                {
                                    this.state.styleFlowState == "111" &&
                                    <>
                                        <Form.Item
                                            label="正文"
                                            name="mbzw"
                                            rules={[{ required: true }]}
                                        >
                                            <Cascader
                                                options={recordChildren}
                                                style={{ width: 400 }}
                                                placeholder="请选择正文"
                                                notFoundContent="暂无模板"
                                                onFocus={this.onFocusRecord}
                                                onChange={this.RecordCopyChange}
                                            />
                                        </Form.Item>
                                    </>

                                }

                            </>
                        }

                    </Form>

                </Modal>

                {/* 详情弹窗 */}
                <Modal
                    title="详情"
                    width="645px"
                    className="Detail"
                    visible={this.state.visibleDetail}
                    onCancel={(e) => { this.setState({ visibleDetail: false }) }}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    footer={
                        [] // 设置footer为空，去掉 取消 确定默认按钮
                    }
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
                    <span className="title"> uuid:</span>
                    <span className="ans">{this.state.detail.uuid}</span>
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
                    {/* <span className="title"> 收件方：</span>
                    <span className="ans">{"暂无"}</span>
                    <br /> */}
                    <span className="title"> 状态：</span>
                    <span className="ans">{this.state.detail.status == 1000 ? "完成" :
                        this.state.detail.status == 999 ? "失败" :
                            this.state.detail.status == 300 ? "执行中" :
                                this.state.detail.status == 100 ? "等待中" : "生效"
                    }</span>
                    <br />

                    <span className="title"> 状态原因：</span>
                    <span className="ans">{this.state.detail.reason}</span>
                    <br />

                </Modal>

                {/* 编辑弹窗 */}
                <EditForm
                    currentRowData={this.state.currentRowData}
                    visible={this.state.editVisible}
                    onCancel={this.handleEditCancel}
                    onOk={this.handleEditOk}
                />

                {/* 转让弹窗 */}
                <Modal
                    title="转让"
                    width="645px"
                    visible={this.state.transferVisible}
                    onCancel={() => { this.setState({ transferVisible: false }) }}
                    onOk={this.handleTransferOk}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    bodyStyle={{ height: '208px', }}
                >
                    <Form ref={this.transFormRef} style={{ margin: "65px 0 0 50px" }}>
                        <Form.Item
                            label="接收人"
                            name="ding_talk_id"
                            rules={[{ required: true }]}
                        >
                            <Input
                                placeholder="工号"
                                style={{ width: '431px', height: '40px', border: '1px solid #DCDFE6', borderRadius: '4px' }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>

        )
    }

    getRefresh() {
        let that = this;
        apis.getTask({
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

                    }
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
            myKey: Math.random()
        });
        // 给Modal添加key，每次弹出的时候 改变key的值，保证每次key的值不同 这里使用了Math.random()
    };

    handleCancel = (e) => {
        this.formRef.current.resetFields();
        this.setState({
            visible: false,
        });
    };

    handleEditOk = (id, data) => {
        console.log("okk", data.username)
        this.setState({
            editVisible: false,
        });
        // const { form } = this.editFormRef.props;
        // console.log(form)
        //     this.editFormRef.current.validateFields((err, values) => {
        //       if (err) {
        //         return;
        //       }
        //   console.log(values)
        let values = {
            title: data.title,
            tpl_id: data.www[0],
            style: data.style,
        }
        // console.log(data.www[0])
        switch (data.send_style) {
            case 1:
                values = {
                    ...values,
                    is_run_now: false,
                    is_periodic_tasks: false
                }
                break;
            case 2:
                values = {
                    ...values,
                    is_run_now: true,
                    is_periodic_tasks: false
                }
                break;
            case 3:
                values = {
                    ...values,
                    is_run_now: false,
                    is_periodic_tasks: true,
                    // crontab_info: data.cronValue,
                }
                break;

        }

        switch (data.style) {
            case "mail":
                values = {
                    ...values,
                    data: {
                        to: data.to,
                        username: data.username,
                        cc: "",
                        bcc: "",
                    },
                };
                break;
            case "sms":
                values = {
                    ...values,
                    data: {
                        to: data.to,
                    },
                };
                break;
            case "ding_notice":
                values = {
                    ...values,
                    data: {
                        is_at_all: data.is_at_all,
                        agent_id: "12479228",
                        user_id_list: data.user_id_list
                    },
                };
                break;
            case "ding_group":
                values = {
                    ...values,
                    data: {
                        is_at_all: data.is_at_all,
                        chat_id: data.chat_id,
                        user_id_list: data.user_id_list
                    },
                };
                break;
            case "ding_robot":
                values = {
                    ...values,
                    data: {
                        is_at_all: data.atflowState == 11 ? true : false,
                        webhook: data.webhook,
                        secret:data.secret,
                        user_id_list: data.atflowState == 12 ? data.user_id_list : "",
                    },
                };
                break;
            case "ding_record":
                let aloneNo = {};
                    if (data.is_alone === false) {
                        aloneNo = {
                            participant_id_list: data.participant_id_list,
                            due_timedelta: data.due_timedelta,
                        }
                    }
                values = {
                    ...values,
                    data: {
                        user_id_list: data.user_id_list,
                        is_alone: data.is_alone,
                        ...aloneNo
                    },
                };
                break;

        }
        console.log(values)
        apis.editTask(id, values).then((response) => {
            console.log('response:',response)
            // this.editFormRef.current.resetFields();
            this.setState({ editVisible: false });
            message.success("编辑成功!")
            this.getRefresh()
        }).catch(e => {
            message.success("编辑失败,请重试!")
            console.log(e)
        })

    };

    handleEditCancel = (e) => {
        // this.editFormRef.current.resetFields()
        // console.log(this.editFormRef.current)

        this.setState({
            editVisible: false,
        });
    };

    handleEdit = (e, obj) => {
        // console.log(Object.assign({}, obj));
        this.state.currentRowData = Object.assign({}, obj)
        this.setState({
            //   currentRowData:{a:1},
            editVisible: true,
        });
        console.log(this.state.currentRowData)
    };

    handleTransfer = (e, obj) => {
        this.setState({
            transferVisible: true,
            transferId: obj.id
        });
    }

    handleTransferOk = () => {
        let id = this.state.transferId;
        this.transFormRef.current.validateFields()
            .then(values => {
                console.log(values);
                apis.transferTask(id, values).then(res => {
                    if (res.code == 0) {
                        message.success("转让成功！");
                        this.transFormRef.current.resetFields();
                        this.setState({ transferVisible: false })
                        this.getRefresh();

                    } else {
                        message.error(res.message);
                    };
                })
            })
            .catch(errorInfo => {
                console.log(errorInfo)
            })
    }

    onFinish = () => {
        // console.log(this.formRef.current.getFieldValue('users'))
        this.formRef.current
            .validateFields()
            .then((val) => {
                console.log(val)
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
                        is_run_now: this.state.is_run_now,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: this.state.is_periodic_tasks
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
                        is_run_now: this.state.is_run_now,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: this.state.is_periodic_tasks
                    };
                }

                else if (this.state.flowState === 3) {
                    datas = {
                        title: this.state.titleValue,
                        data: {
                            is_at_all: this.state.is_at_all,
                            agent_id: "12479228",
                            user_id_list: this.state.toWhoValue
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'ding_notice',
                        is_run_now: this.state.is_run_now,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: this.state.is_periodic_tasks
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
                        is_run_now: this.state.is_run_now,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: this.state.is_periodic_tasks
                    };
                }
                else if (this.state.flowState === 5) {

                    datas = {
                        title: this.state.titleValue,
                        data: {
                            webhook: this.state.webhook,
                            secret:val.secret,
                            is_at_all: this.state.is_at_all,
                            user_id_list: this.state.toWhoValue,
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'ding_robot',
                        is_run_now: this.state.is_run_now,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: this.state.is_periodic_tasks
                    }
                }
                else if (this.state.flowState === 6) {
                    let aloneNo = {};
                    if (val.is_alone === false) {
                        aloneNo = {
                            participant_id_list: val.participant_id_list,
                            due_timedelta: val.due_timedelta,
                        }
                    }
                    datas = {
                        title: this.state.titleValue,
                        data: {
                            user_id_list: val.user_id_list,
                            is_alone: val.is_alone,
                            ...aloneNo
                        },
                        tpl_id: this.state.tpl_id,
                        style: 'ding_record',
                        is_run_now: this.state.is_run_now,
                        crontab_info: this.state.cronValue,
                        is_periodic_tasks: this.state.is_periodic_tasks
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
            title: `删除推送`,
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

    handleSend = (e, obj) => {
        let that = this;
        confirm({
            title: ``,
            icon: <ExclamationCircleOutlined />,
            content: `确认要发送${obj.title}吗？`,
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

    deleteAction = (e, obj) => {
        apis.deleteTask(obj.id).then(res => {

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

    sendAction = (e, obj) => {
        apis.sendTask(obj.id).then(res => {

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

    handleDetail = (e, obj) => {
        apis.detailTask(obj.id).then(res => {

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
};




