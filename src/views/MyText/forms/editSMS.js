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
                title={isCopy ? '??????' : '??????'}
                visible={visible}
                onCancel={this.handleCancel}
                onOk={this.handleOk}
                okText={isCopy ? '??????' : '??????'}
                cancelText="??????"
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
                        label={isSMS ? "????????????" :"????????????"}
                        name="title"
                        rules={[{required: true}]}
                    >
                        <Input
                            style={{ width: 463, height: 40 }}
                            placeholder="?????????????????????" />
                    </Form.Item>


                    <Form.Item
                        label={isSMS ? "????????????" :"????????????"}
                        name="content"
                        rules={[{required: true}]}
                    >
                        <TextArea
                            placeholder={isSMS ? "?????????????????????" :"?????????????????????"}
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
                                                label="????????????"
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
                                                rules={[{ required: true, message: '?????????????????????' }]}
                                                style={{ width: 130 }}

                                            >
                                                <Input placeholder="????????????" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'desc']}
                                                fieldKey={[fieldKey, 'desc']}
                                                rules={[{ required: true, message: '???????????????' }]}
                                                style={{ width: 181 }}

                                            >
                                                <Input placeholder="??????" />
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
                                    <p>?????????</p>
                                    <p>&lt;p&gt;????????????&lt;/p&gt;</p>
                                </div>
                            )}
                            trigger="click"

                        >
                            <span>????????????</span>
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




