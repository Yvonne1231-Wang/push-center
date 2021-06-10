import apis from "../../utils/api/unsplash/index";
import React, { Component, useState } from "react";
import { Table, Form, Button, Input, Divider, Modal, Upload, message, Row, Col, Popover, Select, Space, Radio, Cascader } from 'antd';
import { SearchOutlined, MailOutlined, LinkOutlined, PictureOutlined, CaretDownOutlined, ExclamationCircleOutlined, MinusCircleOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
// import ListsComponent from "../../components/ListComponent";
import './history.scss';
import Markdown from "../../components/Markdown";
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";
// import {bus} from "./bus";
import { NavLink} from "react-router-dom";


const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;

export default class HistoryDetail extends Component {
    state = {
        dataSource: [],
        pagination: {
            current: 1,
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: null

        },
        current: "",//目前正在查看的item id
        visible: false,
        visibleDetail:false,
        flowState: '',
        styleFlowState: 1,
        RadioFlowState: true,
        atflowState:'',


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
        theUser2Name:'',

        mailDateSource: [],
        SMSDateSource: [],
        userDateSource: '',
        robotDateSource: [],
        groupDateSource: [],
        noticeDateSource: [],

        detail:{
            tpl: {
                title: ''
            },
            reason:'',
            data:{
                webhook:'',
                name:'',
                agent_id:'',
                chat_id:'',

            }
        },

        task_id:'',
    }

    

    pageChange = (page, size) => {
        this.state.current = page
        this.state.pageSize = size
        this.getRefresh()
    }
    
    

    componentDidMount() {
        // bus.on('id',
        // let parentData = {}
        // bus.on('id',(data) => {
        //     parentData = data
        //     this.state.task_id = data.task_id;
        //     debugger
        //     console.log(data,this.state.task_id)
        // })
        console.log(this.props.location.search.slice(this.props.location.search.lastIndexOf('=') + 1, this.props.location.search.length))
        this.state.task_id=this.props.location.search.slice(this.props.location.search.lastIndexOf('=') + 1, this.props.location.search.length)
        console.log(this.state.task_id)
        apis.getHistory({
            page: this.state.pagination.current,
            page_size: this.state.pagination.pageSize,
            task_id:this.state.task_id
        }).then(res => {
            this.setState({
                dataSource: res.data.results,
                pagination: {
                    className: "dingdingRobot-pagination",
                    current: res.data.page,
                    pageSize: res.data.page_size,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    total: res.data.total,
                    showTotal: (total) => `共加载 ${total} 个`,
                    onChange: this.pageChange
                }
            })
            console.log(res)
        })
    }

    formRef = React.createRef();


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
            width: 200
        },
        {
            title: "推送类型",
            key: "style",
            dataIndex: "style",
            align: "center",
            width: 150,
            render: (val) => {
                if (val == "ding_group") {
                    return <>钉钉群通知</>
                } else if (val == "ding_robot") {
                    return <> 钉钉机器人</>
                } else if (val == "ding_notice") {
                    return <> 钉钉公告</>
                } else if (val == "mail") {
                    return <> 邮件</>
                } else if (val == "sms") {
                    return <> 短信</>
                } else if (val == "tel") {
                    return <> 电话</>
                } else {
                    return <> 未知类型</>
                }
            }
        },
        {
            title: "发送方式",
            key: "is_periodic_tasks",
            dataIndex: "is_periodic_tasks",
            align: "center",
            width: 150,
            render: (val) => {
                if (val == false) {
                    return <>立即发送 </>
                }

                else {
                    return <> 定时发送</>
                }
            }
        },
        {
            title: "状态",
            key: "status",
            dataIndex: "status",
            align: "center",
            width: 150,
            render: (val) => {
                if (val == 1000) {
                    return <>完成</>
                } else if (val == 999) {
                    return <> 失败</>
                } else if (val == 300) {
                    return <> 执行中</>
                } else if (val == 100) {
                    return <> 等待中</>
                } else {
                    return <> 未知状态</>
                }
            }
        },

        {
            title: "推送时间",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            width: 200
        },
        {
            title: "操作",
            key: "handle",
            align: "center",
            width: 200,
            render: (obj) => {
                return <>
                    <Button className="handle-button" onClick={(e) => this.handleDetail(e, obj)}>详情</Button>
                    <Button className="handle-button">重发</Button>

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

    render() {
        // bus.on('id',(data) => {this.state.task_id = data.task_id;console.log(data,this.state.task_id)})

        // console.log('then',this.state.task_id)

        const { titleValue, toWhoValue, webhook, RadioFlowState, cronValue,theUser2Name } = this.state

        const userChildren = [];
        for (let i = 0; i < this.state.userDateSource.length; i++) {
            userChildren.push(<Option key={this.state.userDateSource[i].value} children>{this.state.userDateSource[i].name}</Option>);
        }


        const mailChildren = [];
        for (let i = 0; i < this.state.mailDateSource.length ; i++) {
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
        for (let i = 0; i < this.state.SMSDateSource.length ; i++) {
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
        for (let i = 0; i < this.state.robotDateSource.length ; i++) {
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
        for (let i = 0; i < this.state.groupDateSource.length ; i++) {
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


        return (
            <div className="app-container">
                <Divider >
                    <HistoryOutlined />  id:{this.state.task_id}的历史推送记录
                </Divider>

                {/*搜索模块*/}
                <div>
                    <Row justify='center'>
                        <Col span={8}>
                        <NavLink to={'/task'}>
                            <Button className="input-button" type="primary">
                                返回
                            </Button>
                        </NavLink>
                        </Col>
                   
                        <Col span={6}>
                        
                            <Input className="input" prefix={<SearchOutlined />} placeholder="请输入关键词" />
                        </Col>
                        <Col span={8}>
                    
                            <Button className="input-button" type="primary" htmlType="submit">
                                搜索
                            </Button>
                        
                        </Col>
                       
                    </Row>
                </div>

                {/* 下方表格 */}
                <Table
                    columns={this.columns}
                    dataSource={this.state.dataSource}
                    pagination={this.state.pagination}
                />

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
                                            callback('请输入标题')
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
                            rules={[
                                {
                                    required: true,
                                },

                            ]}
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
                                        // className="selectStyle"
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
                                        placeholder="邮箱"
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
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={e => { this.setState({ RadioFlowState: e.target.value }) }} value={RadioFlowState}
                                    >
                                        <Radio value={true}>立即发送</Radio>
                                        <Radio value={false}>定时发送</Radio>

                                    </Radio.Group>
                                </Form.Item>

                                {
                                    RadioFlowState == false &&
                                    <Form.Item
                                        label="定时规则"
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
                                    // className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} >手动输入</Option>

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
                            this.state.flowState == '2'  && <>

                                <Form.Item
                                    label="接收方"
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
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        onChange={e => { this.setState({ RadioFlowState: e.target.value }) }} value={RadioFlowState}
                                    >
                                        <Radio value={true}>立即发送</Radio>
                                        <Radio value={false}>定时发送</Radio>

                                    </Radio.Group>
                                </Form.Item>

                                {
                                    RadioFlowState == false &&
                                    <Form.Item
                                        label="定时规则"
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
                                    // className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} >手动输入</Option>

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
                            this.state.flowState == '3'  &&
                            <>
                                <Form.Item
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

                                </Form.Item>



                                <Form.Item
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
                                        // defaultValue={12}
                                    >
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
                                }
                                <Form.Item
                                    label="发送方式"
                                    name="mail-5"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group onChange={e => { this.setState({ RadioFlowState: e.target.value }) }} value={RadioFlowState}
                                    >
                                        <Radio value={true}>立即发送</Radio>
                                        <Radio value={false}>定时发送</Radio>
                                    </Radio.Group>
                                </Form.Item>


                                {
                                    RadioFlowState == false &&
                                    <Form.Item
                                        label="定时规则"
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
                                    // className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} >手动输入</Option>

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
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group onChange={e => { this.setState({ RadioFlowState: e.target.value }) }} value={RadioFlowState}
                                    >
                                        <Radio value={true}>立即发送</Radio>
                                        <Radio value={false}>定时发送</Radio>
                                    </Radio.Group>
                                </Form.Item>


                                {
                                    RadioFlowState == false &&
                                    <Form.Item
                                        label="定时规则"
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
                                    // className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} >手动输入</Option>

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
                                    label="发送对象"
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
                                }
                                <Form.Item
                                    label="发送方式"
                                    name="mail-5"
                                    rules={[
                                        {
                                            required: true
                                        },
                                    ]}
                                >
                                    <Radio.Group onChange={e => { this.setState({ RadioFlowState: e.target.value }) }} value={RadioFlowState}
                                    >
                                        <Radio value={true}>立即发送</Radio>
                                        <Radio value={false}>定时发送</Radio>
                                    </Radio.Group>
                                </Form.Item>


                                {
                                    RadioFlowState == false &&
                                    <Form.Item
                                        label="定时规则"
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
                                    // className="selectStyle"
                                    >
                                        <Option value={111} >模版导入</Option>
                                        <Option value={112} >手动输入</Option>

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

                    </Form>

                </Modal>

                {/* 详情弹窗 */}
                <Modal
                    title="详情"
                    width="645px"
                    visible={this.state.visibleDetail}
                    onCancel={(e)=> {this.setState({visibleDetail: false})}}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    bodyStyle={{ height: '580px', overflowY: 'auto', marginLeft: '45px' }}
                >

                    <span className="title"> 推送名称：</span>
                    <span className="ans">{this.state.detail.title}</span>
                    <br />
                    <span className="title"> 推送名称：</span>
                    <span className="ans">{this.state.detail.style=="ding_group"?"钉钉群通知":
                                            this.state.detail.style=="ding_robot"?"钉钉机器人":
                                            this.state.detail.style=="ding_notice"?"钉钉公告":
                                            this.state.detail.style == "mail"?"邮件":
                                            this.state.detail.style == "sms"?"短信":
                                            this.state.detail.style == "tel"?"电话":"未知类型"

                                            }</span>
                    <br />
                 
                    <span className="title"> 模板id：</span>
                    <span className="ans">{this.state.detail.tpl_id}</span>
                    <br />
                    <span className="title"> 模板标题：</span>
                    <span className="ans">{this.state.detail.tpl.title}</span>
                     <br />
                    <span className="title"> 创建时间：</span>
                    <span className="ans">{this.state.detail.created_at}</span>
                    <br />
                    <span className="title"> 发件方：</span>
                    <span className="ans">{
                                            this.state.detail.style=="ding_group"?this.state.detail.data.chat_id:
                                            this.state.detail.style=="ding_robot"?this.state.detail.data.webhook:
                                            this.state.detail.style=="ding_notice"?this.state.detail.data.agent_id:
                                            this.state.detail.style == "mail"?this.state.detail.data.name:
                                            this.state.detail.style == "sms"?"管理员短信":
                                            this.state.detail.style == "tel"?"管理员电话":"未知类型"
                                            }</span>
                    <br />
                    <span className="title"> 收件方：</span>
                    <span className="ans">{"暂无"}</span>
                    <br />
                    <span className="title"> 状态：</span>
                    <span className="ans">{this.state.detail.status == 1000? "完成":
                                            this.state.detail.status == 999? "失败":
                                            this.state.detail.status == 300? "执行中":
                                            this.state.detail.status == 100? "等待中":"未知状态"
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
                        className: "dingdingRobot-pagination",
                        current: res.data.page,
                        pageSize: res.data.page_size,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        total: res.data.total,
                        onChange: this.pageChange,
                        showTotal: (total) => `共加载 ${total} 个`,
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
                if(this.state.atflowState==11){
                    this.setState({is_at_all:true})
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
                            user_id_list:this.state.toWhoValue
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
                            user_id_list:this.state.toWhoValue
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
                    detail:res.data
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

}