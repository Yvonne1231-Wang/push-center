import React, { Component } from "react";
import apis from "../../../utils/api/unsplash/index";
import { PictureOutlined, LinkOutlined, CaretDownOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Form, Input, Select, Rate, Modal, Radio, message, Popover, Cascader, Col, Row, Upload, Space } from "antd";
import BraftEditor from "braft-editor";


const { TextArea } = Input

export default class EditMail extends Component {
    state = {
        // htmlContent: BraftEditor.createEditorState("111"),
        path:"",
        fileList:[],

    };


    componentWillReceiveProps(nextProps) {
        // console.log("componentWillReceiveProps")
        if (this.props.currentRowData !== nextProps.currentRowData) {
          this.setState({
              path:nextProps.currentRowData.path,
              fileList:nextProps.currentRowData.path ? [{
                name: '原有附件',
                status: 'done',
                url: nextProps.currentRowData.path,
            }] : [],
               editorValue:nextProps.currentRowData.content.content
          });
        }
      }

    editFormRef = React.createRef();
    
    // async componentDidMount(){
    //     console.log(Object.hasOwnProperty.call(this.props.currentRowData, 'content') ? this.props.currentRowData.content.content : null)
    // }


    // html编辑器里的添加图片
    uploadHandler = (param) => {
        if (!param.file) {
            return false
        }
        console.log(param.file)
        var formData = new FormData();
        formData.append('file', param.file)
        console.log(formData)
        apis.Upload(formData).then(res => {
            if (res.code === 0) {
                let html = this.state.initValue.toHTML()
                html += `<image src=http://192.168.41.49${res.data.download} />`
                console.log(html)
                this.setState({
                    initValue: BraftEditor.createEditorState(html)
                })
            }
        })
    }

    //html编辑器功能栏
    controls = ['bold', 'italic', 'underline', 'separator', 'text-color', 'strike-through', 'text-align', 'code'];
    extendControls = [
        {
            key: 'antd-uploader',
            type: 'component',
            component: (
                <Upload
                    accept="image/*"
                    showUploadList={false}
                    customRequest={this.uploadHandler}
                >
                    {/* 这里的按钮最好加上type="button"，以避免在表单容器中触发表单提交，用Antd的Button组件则无需如此 */}
                    <button type="button" className="control-item button upload-button" data-title="插入图片">
                        <PictureOutlined style={{ fontSize: '13px', color: '#535355' }} />
                        {/* <Icon type="picture" theme="filled" /> */}
                    </button>
                </Upload>
            )
        }
    ]
    
    onEditorChange = (val) => {
        // console.log(val)
        let regex = /\{{(.+?)\}}/g;
        let option = val.toHTML().match(regex);
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

        this.setState({ editorValue:val.toHTML() })
    }

    render() {
        const {
            visible,
            currentRowData,
            isCopy
        } = this.props;


        const { title, variable, path } = currentRowData;


        const uploadProps = {
            // action: 'http://192.168.41.49/api/v1.0/upload',
            customRequest:(param) => {
                console.log(param.file)
                if (!param.file) {
                    return false
                }
                var formData = new FormData();
                formData.append('file', param.file)
                // console.log(formData)
                apis.Upload(formData).then(res=>{
                    if(res.code === 0){
                        this.setState({
                            path : res.data.download
                          })
                    }
                })
            },
            maxCount:1,
            // onRemove: (file) => {
            //     this.setState(({ fileList }) => {
            //         console.log(file,fileList)
            //         const index = fileList.indexOf(file);
            //         // console.log(index)
            //         const newFileList = fileList;
            //         newFileList.splice(index, 1);
            //         this.setState({
            //             fileList: this.newFileList,
            //             path:""
            //         });
            //         return false;
            //     });
            // },
            onRemove: (file) => {
                this.setState({
                    fileList: []
                });
                return true
            },
            onChange: (info) => {
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
            beforeUpload: (file) => {
                console.log('beforeUpload:', file)
                this.state.fileList.push(file)
                this.setState({
                    fileList: [file] 
                })
                
                // return false;
            },

        }

        // let formdata = { ...currentRowData }
        // formdata = {
        //     ...formdata,
        //     content: Object.hasOwnProperty.call(currentRowData, 'content') ? currentRowData.content.content : ''
        // }

        // let htmlContent= BraftEditor.createEditorState(Object.hasOwnProperty.call(currentRowData, 'content') ? currentRowData.content.content : null);
        // let htmlContent = BraftEditor.createEditorState("23131")
        // console.log(htmlContent.toHTML())
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
                    ref={this.editFormRef}
                >
                    <Form.Item
                        label="短信标题"
                        name="title"
                        rules={[{ required: true }]}
                        initialValue={title}
                    >
                        <Input
                            style={{ width: 463, height: 40 }}
                            placeholder="请输入模板名称" />
                    </Form.Item>



                    <Form.Item style={{ marginLeft: 100 }}>
                        <Upload fileList = {this.state.fileList} {...uploadProps}>
                            <LinkOutlined style={{ fontSize: '13px', color: '#000000' }} />添加附件｜<CaretDownOutlined />
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        label="邮件正文"
                        rules={[{ required: true }]}
                    >
                        <BraftEditor
                            defaultValue={ BraftEditor.createEditorState(Object.hasOwnProperty.call(currentRowData, 'content') ? currentRowData.content.content : null)}
                            controls={this.controls}
                            extendControls={this.extendControls}
                            onChange={this.onEditorChange}
                            placeholder="请输入邮件正文，支持Html语法"
                            className="html-BraftEditor"
                        />
                    </Form.Item>
                    <Form.List  name="variable" initialValue={variable} >
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
        this.state.file={};

        this.editFormRef.current.resetFields();
        onCancel();
    }

    handleOk = () => {
        const { item = {}, onOk } = this.props
        const { id } = this.props.currentRowData

        this.editFormRef.current.validateFields()
            .then(values => {
                const data = {
                    ...values,
                    editorValue:this.state.editorValue,
                    path: this.state.path,
                    variable:this.editFormRef.current.getFieldValue('variable')
                }
                console.log(data);

                onOk(id, data)
            }
            )
            .catch(errorInfo => {
                console.log(errorInfo)
            })
    }
}




