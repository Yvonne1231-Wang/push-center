import apis from "../../utils/api/unsplash/index";
import React, { Component, useState } from "react";
import Highlighter from 'react-highlight-words';
import { Table, Form, Button, Input, Divider, Modal, Tooltip, message, Row, Col, Popover, Radio, Space } from 'antd';
import { SearchOutlined, MailOutlined, LinkOutlined, PictureOutlined, PlusCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
// import ListsComponent from "../../components/ListComponent";
import './dingdingRobot.scss';
import Markdown from "../../components/Markdown";
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";
import EditDing from "./forms/editDing";


const { confirm } = Modal;
const { TextArea } = Input;

export default class dingdingNotice extends Component {
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
        deleteVisible: false,
        flowState: 1,
        textareaValue: '',
        MarkdownContent: '',
        titleValue: '',
        fileList: [],
        file: null,
        btnsArray: [],
        btns: {
            title: "",
            actionURL: ""
        },

        editVisible: false,
        currentRowData: '',
        isCopy: false,

        filter_fields: [],

        searchText: '',
        searchedColumn: '',
        searchArr: {}
    }

    pageChange = (page, size) => {
        this.state.current = page
        this.state.pageSize = size
        this.getRefresh()
    }

    componentDidMount() {
        apis.getDingNotice({
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
        })
    }


    searchInput = []

    getColumnSearchProps = (dataIndex, title) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ width:' 200px',height: '97px',padding: 8,boxShadow :' 0px 2px 4px 1px rgba(0,0,0,0.5)', borderRadius:'5px'}}>
                <Input
                    ref={node => {
                        this.searchInput[dataIndex] = node;
                    }}
                    prefix={<SearchOutlined style={{color:'#B1B1B1',fontSize:'12px'}} />}
                    placeholder={`搜索 ${title}`}
                    value={selectedKeys[0]}
                    onChange={e => this.handleSearch(e, dataIndex)}
                    onPressEnter={e => this.handleSearch(e, dataIndex)}
                    style={{ marginBottom: 8,marginTop: 5 }}
                />
                <Space>
                    <Button 
                        onClick={(e) => this.handleReset(e, dataIndex)} 
                        size="small" 
                        style={{ width: '67px',height:'21px' ,background:'##FFFFFF',border:'1px solid #DADADA',borderRadius:'5px' ,fontSize:'12px',margin:'12px'}}
                    >
                        重置
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => this.search()}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: '67px',height:'21px' ,background:'#40404C',border:'1px solid #40404C',borderRadius:'5px' ,fontSize:'12px',color: '#FFFFFF'}}
                    >
                        搜索
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: <SearchOutlined style={{ color: '#D8D8D8' }} />,


        render: text => {

            if (this.state.searchedColumn === dataIndex) {
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

    });

    handleSearch = (e, dataIndex) => {
        this.state.searchArr[dataIndex] = [e.target.value]
        this.state.searchedColumn = dataIndex
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
        this.searchInput[dataIndex].handleReset(e);
        this.state.searchData[dataIndex] = [];
        this.search();
    };

    //每列名称
    columns = [
        {
            title: "模版ID",
            dataIndex: "id",
            key: "id",
            align: "center",
            width: 150
        },
        {
            title: "标题",
            key: "title",
            dataIndex: "title",
            align: "center",
            width: 200,
            ...this.getColumnSearchProps("title", "标题"),
        },
        {
            title: "正文",
            key: "content",
            dataIndex: "content",
            align: "center",
            textWrap: 'word-break',
            ellipsis: true,
            render: (content, data) => {
                if (data.content_format == "text") { 
                    return <div>
                            <Tooltip placement="topLeft" title={content['content']}>{content['content']}</Tooltip>
                            </div>;
                } 
                else { 
                    return <div>
                            <Tooltip placement="topLeft" title={content['text']}>{content['text']}</Tooltip>
                            </div>;
                }
            }
        },
        {
            title: "更新时间",
            dataIndex: "updated_at",
            key: "updated_at",
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
                    <Button className="handle-button" onClick={(e) => this.handleEdit(e, obj)}>编辑</Button>
                    <Button className="handle-button" onClick={(e) => this.handleCopy(e, obj)}>复制</Button>

                    <Button className="handle-button" onClick={(e) => this.handleDelete(e, obj)}>删除</Button>

                </>
            }
        },
    ];


    // 更新文本框里的值
    onEditorChange = (val) => {
        this.setState({
            initValue: val
        })
    };

    //设置textareaValue
    handleTextareaChange(e) {
        let regex = /\{{(.+?)\}}/g;
        let option = e.target.value.match(regex);

        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        let addRes = this.formRef.current.getFieldValue('variable') || []
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
            this.formRef.current.setFieldsValue({ variable: addRes });
        }
        this.setState({
            textareaValue: e.target.value
        })
    };

    handleTitleChange(e) {
        this.setState({
            titleValue: e.target.value
        })
    }

    formRef = React.createRef();

    controls = ['bold', 'italic', 'underline', 'separator', 'text-color', 'strike-through', 'text-align', 'code'];

    radioChange = (e) => {
        console.log(e);
        this.setState({ flowState: e });
    };

    // beforeUpload = (file, fileList, type) => {
    //     if(type === 'file'){
    //         let data = {
    //             path: 'http://xxx',
    //             name: '12331'
    //         }
    //         this.state.file.push(data)
    //         this.setState({
    //             file: this.state.file
    //         })
    //     }else if(type === 'photo'){
    //         let data = {
    //             path: 'http://xxx',
    //             name: '12331'
    //         }
    //         this.state.photo.push(data)
    //         this.setState({
    //             photo: this.state.photo
    //         })
    //     }
    //     return false;
    // };

    //上传附件功能的属性
    uploadProps = {
        action: 'http://192.168.41.49/api/v1.0/upload',

        onRemove: (file) => {
            this.setState(({ fileList }) => {
                const index = fileList.indexOf(file);
                // console.log(index)
                const newFileList = fileList;
                newFileList.splice(index, 1);
                this.setState({
                    fileList: this.newFileList,
                });
                return false;
            });
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
                file: this.state.file
            })
            // return false;
        },
        fileList: this.state.fileList,
    }

    onTitleChange(e){
        // console.log(this.formRef.current.getFieldValue('variable'))s
        let regex = /\{{(.+?)\}}/g;
        let option = e.target.value.match(regex);

        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        var addRes = this.formRef.current.getFieldValue('variable') || []
        // console.log('0',addRes)
        if (res.length!=0) {
            let val = addRes.map(ele=>ele.name);
            res = Array.from(new Set(res));
            outer:for (let i = 0; i < res.length; i++) {
                for(let j = 0; j < val.length; j++){
                    if(val[j] == res[i]){
                        continue outer;
                    }
                }
                addRes.push({name: res[i]})
            }
            // console.log('4:',addRes)
            // for(let i = 0; i < val.length; i++){
            //     let index = -1
            //     for(let j = 0; j < addRes.length; j++){
            //         if(val[i] === addRes[j].name) {index = j;}
            //     }
            //     if(index !== -1) {addRes.splice(index, 1);}
            // }
            this.formRef.current({ variable: addRes });
        }
    }
    onURLChange(e){
        let regex = /\{{(.+?)\}}/g;
        let option = e.target.value.match(regex);

        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        let addRes = this.formRef.current.getFieldValue('variable') || []
        if (res.length!=0) {
            let val = addRes.map(ele=>ele.name);
            res = Array.from(new Set(res));
            outer:for (let i = 0; i < res.length; i++) {
                for(let j = 0; j < val.length; j++){
                    if(val[j] == res[i]){
                        continue outer;
                    }
                }
                addRes.push({name: res[i]})
            }
            this.formRef.current.setFieldsValue({ variable: addRes });
        }
    }

    // markdown编辑器
    editorRef = React.createRef();
    onMarkdownChange = (source, data) => {
        let regex = /\{{(.+?)\}}/g;
        let option = this.editorRef.current.getInstance().getMarkdown().match(regex);
        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        let addRes = this.formRef.current.getFieldValue('variable') || []
        if (res.length!=0) {
            let val = addRes.map(ele=>ele.name);
            res = Array.from(new Set(res));
            outer:for (let i = 0; i < res.length; i++) {
                for(let j = 0; j < val.length; j++){
                    if(val[j] == res[i]){
                        continue outer;
                    }
                }
                addRes.push({name: res[i]})
            }
            this.formRef.current.setFieldsValue({ variable: addRes });
        }
        this.setState({ MarkdownContent: this.editorRef.current.getInstance().getMarkdown() });
        // console.log(source, this.editorRef.current.getInstance().getMarkdown())
    }


    render() {
        // const uploadProps = {
        //     action: '',

        // }
        const { textareaValue, titleValue, initValue } = this.state
        return (
            <div className="app-container">
                <Divider >
                    <MailOutlined /> 钉钉工作通告
                </Divider>


               {/* 下方表格 */}
               <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 35, top: 37, zIndex: 1 }}>
                        <PlusCircleOutlined style={{fontSize:"15px", color: "#000000"}} onClick={this.showModal} />
                    </div>
                    <Table
                        columns={this.columns}
                        dataSource={this.state.dataSource}
                        pagination={this.state.pagination}
                        scroll={{ y: 'calc(100vh - 280px)' }}
                    />
                 </div>

                {/* 新建模板弹出框 */}
                <Modal
                    title="新建模版"
                    width="645px"
                    bodyStyle={{margin:'10px 10px'}}
                    visible={this.state.visible}
                    onOk={this.onFinish}
                    onCancel={this.handleCancel}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    okText="保存"
                    cancelText="取消"
                    destroyOnClose={true}
                >

                    <Form
                        className="addModel"
                        name="basic"
                        onFinish={this.onFinish}
                        ref={this.formRef}
                        labelCol={{ span: 4 }}
                    >
                        <Form.Item>
                            <Row>
                                <Col span={4}></Col>
                                <Col span={20} className="radio-content">
                                    <Radio.Group defaultValue={1}
                                        onChange={e => this.radioChange(e.target.value)}
                                    >
                                        <Radio value={1}>文本</Radio>
                                        <Radio value={2}>Markdown</Radio>
                                        <Radio value={3}>ActionCard</Radio>
                                        {/* <Radio value={4}>OD</Radio> */}
                                    </Radio.Group>
                                </Col>
                            </Row>
                        </Form.Item>

                        {/* 标题栏 */}
                        <Form.Item
                            label="标题名称"
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
                                placeholder="默认为模板名称"
                                value={titleValue}
                                onChange={this.handleTitleChange.bind(this)}
                                style={{ width: '461px' ,height: '40px',borderRadius:' 5px '}}
                            />
                        </Form.Item>

                        {/* 添加附件 */}
                        {/* {(this.state.flowState == '2' || this.state.flowState == '3') &&
                            <Form.Item  style={{marginLeft:100}} >
                                <Upload {...this.uploadProps}>
                                    <LinkOutlined style={{ fontSize: '13px', color: '#000000' }} />添加附件｜<CaretDownOutlined />
                                </Upload>
                            </Form.Item>
                        } */}

                        {
                            this.state.flowState == '1' &&
                            <Form.Item
                                label="正文"
                                name="info1"
                                rules={[
                                    {
                                        required: true,
                                        validator: (_, value, callback) => {
                                            // console.log(textareaValue);
                                            if (!textareaValue) {
                                                callback('请输入正文')
                                            } else {
                                                callback()
                                            }
                                        }
                                    },
                                ]}
                            >
                                <TextArea
                                    value={textareaValue}
                                    rows={4}
                                    placeholder="请输入正文"
                                    onChange={this.handleTextareaChange.bind(this)}
                                    style={{ width: '461px' ,height: '260px',borderRadius:' 5px '}}  
                                />
                                <Popover
                                    className="shili"
                                    placement="right"
                                    content={(
                                        <div>
                                            <p>示例：</p>
                                            <p>&lt;p&gt;安全警告&lt;/p&gt;</p>
                                        </div>
                                    )}
                                    trigger="click"
                                >
                                    <div>查看示例</div>
                                </Popover>
                            </Form.Item>
                        }

                        {
                            this.state.flowState == '2' &&
                            <Form.Item
                                label="正文"
                                name="info2"
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
                                <Popover
                                    className="shili"
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
                            </Form.Item>

                        }
                        {
                            this.state.flowState == '3' &&
                            <Form.List name="users">
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
                                                    <Input className="addAD-Input" placeholder="按钮名称" onChange ={this.onTitleChange.bind(this)} />
                                                </Form.Item>
                                                <Form.Item
                                                    className="addAD-Input-Dad"
                                                    {...restField}
                                                    name={[name, 'actionURL']}
                                                    fieldKey={[fieldKey, 'actionURL']}
                                                    rules={[{ required: true, message: '请输入链接url' }]}
                                                >
                                                    <Input className="addAD-Input" placeholder="链接url" onChange ={this.onURLChange.bind(this)}/>
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" className="addAD-Button" onClick={() => add()} block icon={<PlusOutlined />}>
                                                添加跳转
                                    </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        }
                        {
                            this.state.flowState == '3' &&
                            <Form.Item
                                label="正文"
                                name="info3"
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
                                <Popover
                                    className="shili"
                                    placement="right"
                                    content={(
                                        <div>
                                            <p>示例：</p>
                                            <p>&lt;p&gt;安全警告&lt;/p&gt;</p>
                                        </div>
                                    )
                                    }
                                    trigger="click"
                                >
                                    <span>查看示例</span>
                                </Popover>
                            </Form.Item>
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

                </Modal>

                {/* 编辑弹窗 */}
                <EditDing
                    currentRowData={this.state.currentRowData}
                    visible={this.state.editVisible}
                    onCancel={this.handleEditCancel}
                    onOk={this.state.isCopy ? this.handleCopyOk : this.handleEditOk}
                    isCopy={this.state.isCopy}
                />
            </div>

        )
    }

    getRefresh() {
        let that = this;
        apis.getDingNotice({
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
                // console.log(this.state.flowState)
                let data = {
                    variable:this.formRef.current.getFieldValue('variable')
                }
                let type = ['text', 'markdown', 'actionCard']
                data['content_format'] = type[parseInt(this.state.flowState) - 1]
                if (this.state.flowState === 1) {
                    data = {
                        ...data,
                        ...val,
                        title: this.state.titleValue,
                        content: {
                            content: this.state.textareaValue,
                        },
                    }
                } else if (this.state.flowState === 2) {
                    console.log(this.state.MarkdownContent)
                    // let path = {
                    //     file: [],
                    //     photo: []
                    // }

                    // this.state.file.forEach(ele => {
                    //     path.file.push(ele.path)
                    // })
                    // this.state.photo.forEach(ele => {
                    //     path.photo.push(ele.path)
                    // })
                    data = {
                        ...data,
                        ...val,
                        title: this.state.titleValue,
                        content: {
                            text: this.state.MarkdownContent,
                            title: this.state.titleValue,
                        },
                        path: null
                    }
                } else if (this.state.flowState === 3) {

                    data = {
                        ...data,
                        ...val,
                        title: this.state.titleValue,
                        content: {
                            title: this.state.titleValue,
                            text: this.state.MarkdownContent,
                            btnOrientation: "0",
                            btns: this.formRef.current.getFieldValue('users')
                        },
                        path: null,
                        // style:'ding_robot'
                    }
                }
                apis.createDingNotice(data)
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
        apis.deleteDingNotice(obj.id).then(res => {

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

    handleEdit = (e, obj) => {

        this.state.currentRowData = Object.assign({}, obj)
        this.setState({
            editVisible: true,
            isCopy: false
        });
        console.log(this.state.currentRowData)
    };

    handleCopy = (e, obj) => {
        this.state.currentRowData = Object.assign({}, obj)
        this.setState({
            editVisible: true,
            isCopy: true
        });
        // console.log(this.state.currentRowData)
    }

    handleEditCancel = (e) => {
        this.setState({
            editVisible: false,
        });
    };


    handleEditOk = (id, data) => {
        // console.log("okk", data.content_format==="text")
        let val = {
            variable:data.variable,
            title: data.title,
        }
        switch (data.content_format) {
            case "text":
                val = {
                    ...val,
                    content: {
                        content: data.content,
                    },
                    content_format: "text",
                };
                break;
            case "markdown":
                val = {
                    ...val,
                    content: {
                        text: data.MarkdownContent,
                        title: data.title
                    },
                    content_format: "markdown",
                };
                break;
            case "actionCard":
                val = {
                    ...val,
                    content: {
                        text: data.MarkdownContent,
                        title: data.title,
                        btnOrientation: "0",
                        btns: data.users

                    },
                    content_format: "actionCard",
                    // style:'ding_robot'
                };
                break;
        }
        // console.log(val)
        apis.editDingNotice(id, val).then((response) => {
            // this.editFormRef.current.resetFields();
            this.setState({ editVisible: false });
            message.success("编辑成功!")
            this.getRefresh()
        }).catch(e => {
            message.success("编辑失败,请重试!")
        })
    };

    handleCopyOk = (id, data) => {
        console.log("okk", data)
        let val = {
            variable:data.variable,
            title: data.title,
        }
        switch (data.content_format) {
            case "text":
                val = {
                    ...val,
                    content: {
                        content: data.content,
                    },
                    content_format: "text",
                };
                break;
            case "markdown":
                val = {
                    ...val,
                    content: {
                        text: data.MarkdownContent,
                        title: data.title
                    },
                    content_format: "markdown",
                };
                break;
            case "actionCard":
                val = {
                    ...val,
                    content: {
                        text: data.MarkdownContent,
                        title: data.title,
                        btnOrientation: "0",
                        btns: data.users

                    },
                    content_format: "actionCard",
                    // style:'ding_robot'
                };
                break;
        }
        // console.log(val)

        apis.createDingNotice(val).then((response) => {
            // this.editFormRef.current.resetFields();
            this.setState({ editVisible: false });
            message.success("复制成功!")
            this.getRefresh()
        }).catch(e => {
            message.success("复制失败,请重试!")
        })
    };




}