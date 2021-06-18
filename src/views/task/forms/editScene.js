import React, { Component } from "react";
import apis from "../../../utils/api/unsplash/index";
import { Form, Input, Modal, Select, message } from "antd";

const { Option } = Select;

export default class editScene extends Component {
    state = {
        isEdit: false,
        visible: false,
        currentRowData:{},
        tasksAll:[],
    }
    
    editRef = React.createRef();

    componentDidMount() {
        this.props.onRef(this);
        apis.getTask({
            // page: 1000,
            page_size: 250
        }).then(res => {
            console.log(res);
            if (res.code == 0 || res.code == 200) {
                this.setState({
                    tasksAll:res.data.results
                });
            } else {
                message.error(res.message);
            }
        }).catch(err => {
            message.error(err);
        });
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
        const {tasksAll} = this.state;
        const children = [];
        for (let i = 0; i < tasksAll.length; i++) {
            children.push(<Option value={tasksAll[i].id} title={this.styleEtoC(tasksAll[i].style)}>{tasksAll[i].id}:{tasksAll[i].title}</Option>);
        }
        return (
            <Modal
                title={this.state.isEdit ? "修改场景" : "新建场景"}
                width="645px"
                visible={this.state.visible}
                onOk={this.state.isEdit ?this.editScene:this.onFinish}
                onCancel={this.handleCancel}
                maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                okText={this.state.isEdit ? "修改" : "新建"}
                cancelText="取消"
                bodyStyle={{ height: '380px', overflowY: 'auto', marginLeft: '45px' }}
                destroyOnClose={true}
                key={this.state.myKey}
            >

                <Form
                    className="addModel"
                    name="basic"
                    // onFinish={this.onFinish}
                    ref={this.editRef}
                    labelCol={{ span: 4 }}
                >

                    {/* 标题栏 */}
                    <Form.Item
                        label="名称"
                        name="title"
                        rules={[{ required: true }]}
                        initialValue = {this.state.currentRowData.title}
                    >
                        <Input
                            placeholder="请输入名称"
                            style={{ width: 400, height: 40, borderRadius: 5 }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="描述"
                        name="message"
                        rules={[{ required: true }]}
                        initialValue = {this.state.currentRowData.message}

                    >
                        <Input
                            placeholder="请输入描述"
                            style={{ width: 400, height: 40, borderRadius: 5 }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="渠道"
                        name="tasks"
                        rules={[{ required: true }]}
                        initialValue = {this.state.currentRowData.tasks}
                    >
                        <Select
                            className="selectStyleMulti"
                            mode="multiple"
                            allowClear
                            placeholder="请选择渠道"
                        >
                            {children}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="变更通知人"
                        name="change_recipient"
                        rules={[{ required: true }]}
                        initialValue = {this.state.currentRowData.change_recipient}
                    >
                        <Input
                            placeholder="请输入变更通知人"
                            style={{ width: 400, height: 40, borderRadius: 5 }}
                        />
                    </Form.Item>



                </Form>

            </Modal>

        )
    }
    showModal = (isEdit, currentRowData) => {
        if (isEdit) {
            this.setState({
                currentRowData: currentRowData,
                isEdit: true,
                myKey: Math.random(),
            });
        }
        this.setState({
            visible: true
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            currentRowData:{}
        }, () => {
            this.editRef.current.resetFields();
        });
    }

    onFinish = () => {
        let that = this
        this.editRef.current.validateFields()
        .then(
            val => {
                apis.createScene(val)
                .then(() => {
                    that.editRef.current.resetFields();
                    this.props.onFinish();
                });
            }
        )
        .catch(
            errorInfo => {
                console.log(errorInfo)
        })
        this.setState({
            visible: false,
        });
    }

    editScene = () => {
        this.editRef.current.validateFields()
        .then(
            val => {
                val ={
                    ...val,
                    // change_recipient:val.change_recipient[0]
                }
                apis.editScene(this.state.currentRowData.id,val)
                .then((res) =>{
                    message.success("编辑成功!") 
                    this.props.onFinish();
                })
                .catch((e) =>{
                    console.log(e);
                    message.success("编辑失败,请重试!");
                });
            }
            
        )
        .catch(
            errorInfo => {
                console.log(errorInfo)
        })
        this.setState({
            visible: false,
        });
    }

}