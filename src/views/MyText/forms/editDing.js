import React, { Component } from "react";
import apis from "../../../utils/api/unsplash/index";

import { Form, Input, Select, Button, Modal, Radio, message, Popover, Space, Col, Row } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";


const { TextArea } = Input

export default class editDing extends Component {
    state = {
        MarkdownContent: ""

    }

    editFormRef = React.createRef();

    // markdown编辑器
    editorRef = React.createRef();
    onMarkdownChange = (source, data) => {
        let regex = /\{{(.+?)\}}/g;
        let option = this.editorRef.current.getInstance().getMarkdown().match(regex);
        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        // let addRes = []
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

        this.setState({ MarkdownContent: this.editorRef.current.getInstance().getMarkdown() });
    }

    onTextareaChange(e) {
        let regex = /\{{(.+?)\}}/g;
        let option = e.target.value.match(regex);

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
        // console.log(addRes);

    };

    render() {
        const {
            visible,
            currentRowData,
            isCopy
        } = this.props;


        const { Option } = Select;

        const { content_format } = currentRowData;
        // const { text, btns} = content;
        const text = Object.hasOwnProperty.call(currentRowData, 'content') ? currentRowData.content.text : '';
        const btns = Object.hasOwnProperty.call(currentRowData, 'content') ? currentRowData.content.btns : ''
        let formdata = { ...currentRowData }
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
                width="640px"
                destroyOnClose={true}
            >

                <Form
                    className="addModel"
                    name="basic"
                    labelCol={{ span: 4 }}
                    initialValues={formdata}
                    ref={this.editFormRef}
                >
                    <Form.Item >
                        <Row>
                            <Col span={4}></Col>
                            <Col span={20} className="radio-content">
                                <Radio.Group disabled defaultValue={content_format}>
                                    <Radio value="text">文本</Radio>
                                    <Radio value="markdown">Markdown</Radio>
                                    <Radio value="actionCard">ActionCard</Radio>
                                    {/* <Radio value={4}>OD</Radio> */}
                                </Radio.Group>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item
                        label="短信标题"
                        name="title"
                        rules={[{ required: true }]}
                    >
                        <Input
                            style={{ width: 463, height: 40 }}
                            placeholder="请输入模板名称" />
                    </Form.Item>

                    {
                        content_format == "text" &&
                        <Form.Item
                            label="正文"
                            name="content"
                            rules={[{ required: true }]}
                        >
                            <TextArea
                                placeholder="请输入正文"
                                onChange={this.onTextareaChange.bind(this)}
                                style={{ width: 463, height: 250 }}
                            />
                        </Form.Item>
                    }
                    {
                        content_format == "markdown" &&
                        <Form.Item
                            label="正文"
                            name="text"
                            rules={[
                                {
                                    required: true,
                                    validator: (_, value, callback) => {
                                        if (!this.state.MarkdownContent) {
                                            callback('请输入正文')
                                        } else {
                                            callback()
                                        }
                                    }
                                },
                            ]}
                        >
                            <Editor
                                ref={this.editorRef}
                                placeholder="请输入正文"
                                previewStyle="vertical"
                                height="330px"
                                initialEditType="markdown"
                                useCommandShortcut={true}
                                width="463px"
                                initialValue={text}
                                onChange={this.onMarkdownChange}
                                config={
                                    {
                                        markdown: // testEditor.getMarkdown().replace(/`/g, '\\`')
                                            `## Test
                                            \`\`\`
                                            console.log('what can i do for you')
                                            \`\`\`

                                            # 123123`,
                                        onload: (editor, func) => {
                                            let md = editor.getMarkdown();
                                            let html = editor.getHTML();
                                            debugger
                                        }
                                    }
                                }
                            />
                        </Form.Item>
                    }
                    {
                        content_format == "actionCard" &&
                        <>
                            <Form.List name="users" initialValue={btns}>
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, fieldKey, ...restField }) => (
                                            <Space key={key} style={{ display: 'flex' }} align="baseline">
                                                <Form.Item
                                                    className="addAD-Input-Dad addAD-Input-Dad-First"
                                                    {...restField}
                                                    name={[name, 'title']}
                                                    fieldKey={[fieldKey, 'title']}
                                                    rules={[{ required: true, message: '请输入按钮名称' }]}
                                                >
                                                    <Input className="addAD-Input" placeholder="按钮名称" />
                                                </Form.Item>
                                                <Form.Item
                                                    className="addAD-Input-Dad"
                                                    {...restField}
                                                    name={[name, 'actionURL']}
                                                    fieldKey={[fieldKey, 'actionURL']}
                                                    rules={[{ required: true, message: '请输入链接url' }]}
                                                >
                                                    <Input className="addAD-Input" placeholder="链接url" />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" className="addAD-Button" onClick={() => add()} block icon={<PlusOutlined />}>
                                                添加跳转
                                            </Button>
                                        </Form.Item>
                                    </>)}
                            </Form.List>

                            <Form.Item
                                label="正文"
                                name="text"
                                rules={[
                                    {
                                        required: true,
                                        validator: (_, _value, callback) => {
                                            if (!this.state.MarkdownContent) {
                                                callback('请输入正文')
                                            } else {
                                                callback()
                                            }
                                        }
                                    },
                                ]}
                            >
                                <Editor
                                    ref={this.editorRef}
                                    placeholder="请输入正文"
                                    previewStyle="vertical"
                                    height="330px"
                                    initialEditType="markdown"
                                    useCommandShortcut={true}
                                    width="463px"
                                    initialValue={text}

                                    onChange={this.onMarkdownChange}

                                    config={
                                        {
                                            markdown: // testEditor.getMarkdown().replace(/`/g, '\\`')
                                                `## Test
                                            \`\`\`
                                            console.log('what can i do for you')
                                            \`\`\`

                                            # 123123`,
                                            onload: (editor, func) => {
                                                let md = editor.getMarkdown();
                                                let html = editor.getHTML();
                                                debugger
                                            }
                                        }
                                    }
                                />
                            </Form.Item>
                        </>
                    }
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
        const { item = {}, onOk, t } = this.props
        const { id, content_format } = this.props.currentRowData

        this.editFormRef.current.validateFields()
            .then(values => {
                console.log(values);
                const data = {
                    ...values,

                    MarkdownContent: this.state.MarkdownContent,
                    content_format: content_format
                    // btns:this.editFormRef.current.getFieldValue('users')
                }
                onOk(id, data)
            }
            )
            .catch(errorInfo => {
                console.log(errorInfo)
            })
    }
}




