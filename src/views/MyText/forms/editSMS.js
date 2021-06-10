import React, { Component } from "react";
import apis from "../../../utils/api/unsplash/index";

import { Form, Input, Select, Space, Modal, Radio, message, Popover, Cascader, Col, Row } from "antd";
import { MinusCircleOutlined} from "@ant-design/icons";

const {TextArea} = Input

export default class EditSMS extends Component {
    state = {


    }

    editFormRef = React.createRef();

    onEditorChange = (val) => {
        let regex = /\{{(.+?)\}}/g;
        let option = val.target.value.match(regex);
        
        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        let addRes = this.editFormRef.current.getFieldValue('variable') || []
        if (res) {
            let val = addRes.map(ele=>ele.name);
            res = Array.from(new Set(res));
            for (let i = 0; i < res.length; i++) {
                addRes.push({name: res[i]})
            }
            for(let i = 0; i < val.length; i++){
                let index = -1
                for(let j = 0; j < addRes.length; j++){
                    if(val[i] === addRes[j].name) index = j;
                }
                if(index !== -1) addRes.splice(index, 1)
            }
            this.editFormRef.current.setFieldsValue({ variable: addRes });
        }
    }

    // componentDidMount(){
    //     if(this.editFormRef.current){
    //         this.editFormRef.current.setFieldsValue({
    //             ...this.props.currentRowData,
    //             content: this.props.currentRowData.content.content
    //         })
    //     }
    // }

    // componentWillReceiveProps(nextProps){
    //     console.log(nextProps,this.editFormRef)
    //     debugger
    //     if(this.editFormRef.current){
    //         this.editFormRef.current.setFieldsValue({
    //             ...nextProps.currentRowData,
    //             content: nextProps.currentRowData.content.content
    //         })
    //     }
    // }

    render() {
        const {
            visible,
            currentRowData,
            isCopy,
            isSMS,
        } = this.props;


        const { Option } = Select;

        // const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: {
                sm: { span: 4 },
            },
            wrapperCol: {
                sm: { span: 16 },
            },
        };
        let formdata = {...currentRowData}
        formdata = {
            ...formdata,
            content: Object.hasOwnProperty.call(currentRowData, 'content') ? currentRowData.content.content : ''
        }
        return (
            <Modal
                title={isCopy ? '复制' : '编辑'}
                visible={visible}
                onCancel={this.handleCancel}
                onOk={this.handleOk}
                okText={isCopy ? '创建' : '更新'}
                cancelText="取消"
                maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                width="50%"
                destroyOnClose={true}
            >

                <Form
                    className="addModel"
                    name="basic"
                    labelCol={{ span: 4 }}
                    initialValues={formdata}
                    ref={this.editFormRef}
                >
                    <Form.Item
                        label={isSMS ? "短信标题" :"待办标题"}
                        name="title"
                        rules={[{required: true}]}
                    >
                        <Input
                            style={{ width: 463, height: 40 }}
                            placeholder="请输入模板名称" />
                    </Form.Item>


                    <Form.Item
                        label={isSMS ? "短信正文" :"待办事项"}
                        name="content"
                        rules={[{required: true}]}
                    >
                        <TextArea
                            placeholder={isSMS ? "请输入短信正文" :"请输入待办事项"}
                            onChange={this.onEditorChange}
                            style={{ width: 463, height: 250 }}
                        />
                    </Form.Item>
                    <Form.List  name="variable" >
                            {(fields, { remove }) => (
                                <>
                                    {fields.map(({ key, name, fieldKey, ...restField }) => {
                                        let FormItem ="";
                                        if(key == 0){
                                            FormItem = (
                                            <Form.Item
                                                label="参数变量"
                                                className="variableFirst"
                                                {...restField}
                                                name={[name, 'name']}
                                                fieldKey={[fieldKey, 'name']}
                                                rules={[{ required: true }]}
                                                style={{ width: 220 }}
                                            >
                                            <Input disabled />
                                            </Form.Item>)
                                        }else{
                                            FormItem = (
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'name']}
                                                fieldKey={[fieldKey, 'name']}
                                                rules={[{ required: true }]}
                                                style={{ width: 139, marginLeft:80}}
                                            >
                                            <Input disabled />
                                            </Form.Item>)
                                        }
                                        return (<Space key={key} style={{ display: 'flex', marginBottom: 8 , marginLeft:15}} align="baseline">
                                            {FormItem}
                                                
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'value']}
                                                fieldKey={[fieldKey, 'value']}
                                                rules={[{ required: true, message: '请输入参数示例' }]}
                                                style={{ width: 130 }}

                                            >
                                                <Input placeholder="参数示例" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'desc']}
                                                fieldKey={[fieldKey, 'desc']}
                                                rules={[{ required: true, message: '请输入备注' }]}
                                                style={{ width: 181 }}

                                            >
                                                <Input placeholder="备注" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>)
                                    })}

                                </>
                            )}
                        </Form.List>

                </Form>
                <Row>
                    <Col sm={4}></Col>
                    <Col sm={20}>
                        <Popover
                            className="shili"
                            style
                            placement="right"
                            content={(
                                <div>
                                    <p>示例：</p>
                                    <p>&lt;p&gt;安全警告&lt;/p&gt;</p>
                                </div>
                            )}
                            trigger="click"

                        >
                            <span>查看示例</span>
                        </Popover>

                    </Col>
                </Row>





            </Modal>



        );

    }

    handleCancel = () => {
        const { onCancel } = this.props

        this.editFormRef.current.resetFields();
        onCancel();
    }

    handleOk = () => {
        const { item = {}, onOk } = this.props
        const {id} = this.props.currentRowData

        this.editFormRef.current.validateFields()
            .then(values => {
                // console.log(values);
                const data = {
                    ...values,
                }
                onOk(id,data)
            }
            )
            .catch(errorInfo => {
                console.log(errorInfo)
            })
    }
}




