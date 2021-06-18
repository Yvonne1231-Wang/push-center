import apis from "../../utils/api/unsplash/index";
import React, { Component } from "react";
import Highlighter from 'react-highlight-words';
import { Table, Form, Button, Input, Divider, Modal, Dropdown, message, Switch, Select, Space, Radio, Tooltip, Menu } from 'antd';
import { SearchOutlined, PlusCircleOutlined, CheckOutlined, CloseOutlined, CaretDownOutlined, ExclamationCircleOutlined, DoubleRightOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
// import ListsComponent from "../../components/ListComponent";
import './task.scss';
import EditScene from "./forms/editScene"
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";

import { NavLink } from "react-router-dom";
// import {bus} from "./bus";





const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;

export default class MyScene extends Component {
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

        detail: [{ tpl: { variable: [{}] } }],

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
        delete_task: false
    }

    pageChange = (page, size) => {
        this.state.current = page
        this.state.pageSize = size
        this.getRefresh()
    }

    componentDidMount() {
        apis.getScene({
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
            // if (this.state.filter_fields.length !== 0) {
            //     let dataArr = {};
            //     let arr = this.state.filter_fields.map(ele => {
            //         dataArr[ele.value] = [];
            //         return ele.name;
            //     });
            //     if (Object.keys(this.state.searchArr).length === 0) {
            //         this.state.searchArr = dataArr;
            //     }
            // }
            // this.state.choice = this.state.filter_fields[2].choice
            // console.log(this.state.searchArr)
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

    onRef = (ref) => {
        this.child = ref;
    }


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
            title: "渠道数量",
            key: "task_count",
            dataIndex: "task_count",
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
                    <Button className="handle-button" onClick={(e) => this.handleEdit(e, obj)}>编辑</Button>

                    {/* <Button className="handle-button" onClick={(e) => this.handleDelete(e, obj)}>删除</Button> */}
                    <Dropdown overlay={
                        <Menu>
                            {/* <Menu.Item key="1" onClick={(e) => this.handleEdit(e, obj)}>编辑</Menu.Item> */}
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

    detailColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            align: "center",
            width: 50
        },

        {
            title: "uuid",
            dataIndex: "uuid",
            key: "uuid",
            align: "center",
            textWrap: 'word-break',
            ellipsis: true,
            width: 100,
            render: (uuid) => {
                return <div>
                    <Tooltip placement="topLeft" title={uuid}>{uuid}</Tooltip>
                </div>;
            },

        },
        {
            title: "推送名称",
            key: "title",
            dataIndex: "title",
            align: "center",
            width: 150,
            textWrap: 'word-break',
            ellipsis: true,
            render: (val) => {
                return <div>
                    <Tooltip placement="topLeft" title={val}>{val}</Tooltip>
                </div>;
            },
        },
        {
            title: "推送类型",
            key: "style",
            dataIndex: "style",
            align: "center",
            width: 100,
            render: (val) => {
                return <div>
                    <Tooltip placement="topLeft" title={this.styleEtoC(val)}>{this.styleEtoC(val)}</Tooltip>
                </div>;
            },
        },

        {
            title: "推送次数",
            key: "count",
            dataIndex: "count",
            align: "center",
            width: 100,

        },
        {
            title: "参数变量",
            key: "tpl",
            dataIndex: "tpl",
            align: "center",
            width: 100,
            textWrap: 'word-break',
            ellipsis: true,
            render: (tpl) => {
                return <Tooltip
                    placement="left"
                    overlayClassName='tplDetail'
                    title={tpl.variable.map((val) => { return <div> {Object.keys(val).map((key) => {return <span > <b>{this.variableEtoC(key)}</b>: {val[key]} <br /></span>})} <br /></div> })}
                    >
                    {tpl.variable.map((val) => `${val.name}  `)}
                </Tooltip>
            }

        },


    ];

    formRef = React.createRef();
    transFormRef = React.createRef();

    variableEtoC = (val) => val == 'name' ? '参数变量' : val == 'desc' ? '备注' : '参数示例'

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



        return (
            <div className="app-container">
                <Divider >
                    <HistoryOutlined />  场景推送
                </Divider>

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


                {/* 详情弹窗 */}
                <Modal
                    title="详情"
                    width="800px"
                    // className="Detail"
                    visible={this.state.visibleDetail}
                    onCancel={(e) => { this.setState({ visibleDetail: false }) }}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    footer={
                        [] // 设置footer为空，去掉 取消 确定默认按钮
                    }
                    bodyStyle={{ overflowY: 'auto' }}
                >

                    <Table
                        columns={this.detailColumns}
                        dataSource={this.state.detail}
                        // pagination={this.state.pagination}
                        scroll={{ y: 'calc(100vh - 280px)', x: '100%' }}
                    />

                </Modal>

                {/* 编辑/新增弹窗 */}
                <EditScene
                    onFinish={this.onFinish}
                    onRef={this.onRef}
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
        apis.getScene({
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
        // this.setState({
        //     visible: true,
        //     myKey: Math.random()
        // });
        this.child.showModal(0);
    };




    handleEdit = (e, obj) => {
        this.child.showModal(1, obj);
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
                apis.transferScene(id, values).then(res => {
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
        this.getRefresh();
    };

    handleDelete = (e, obj) => {
        let that = this;
        confirm({
            title: `删除推送`,
            icon: <ExclamationCircleOutlined />,
            content: <div >
                请选择是否同时删除所有任务: <br /><br />
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    onChange={(checked) => this.setState({ delete_task: checked })}
                    style={{ margin: '0 auto' }}
                />
            </div>,
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
        apis.deleteScene(obj.id, { delete_task: this.state.delete_task }).then(res => {
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
        apis.detailScene(obj.id).then(res => {
            if (res.code == 0) {
                this.setState({
                    visibleDetail: true,
                    detail: res.data.task_details
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            console.log(err);
            message.error(err.message);
        });
    }
};




