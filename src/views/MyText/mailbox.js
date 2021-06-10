import apis from "../../utils/api/unsplash/index";
import React, { Component } from "react";
import Highlighter from 'react-highlight-words';
import { Table, Form, Button, Input, Divider, Modal, Upload, message, Row, Col, Popover, Space, Tooltip } from 'antd';
import { SearchOutlined, MailOutlined, LinkOutlined, PictureOutlined, CaretDownOutlined, ExclamationCircleOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
// import ListsComponent from "../../components/ListComponent";
import './mailbox.scss';
import 'braft-editor/dist/index.css';
import BraftEditor from "braft-editor";

import EditMail from "./forms/editMail"


const { confirm } = Modal;


export default class Mailbox extends Component {
    state = {
        dataSource: [],
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true
        },
        current: 1,//目前正在查看的item id
        pageSize: 10,

        visible: false,
        deleteVisible: false,
        titleValue: '',
        initValue: BraftEditor.createEditorState(null),
        fileList: [],
        file: null,
        path: '',
        currentRowData: '',
        isCopy: false,
        addRes: [],

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
        // console.log("121")
        apis.getMailbox({
            page: this.state.pagination.current,
            page_size: this.state.pagination.pageSize
        }).then(res => {
            // console.log(res.data.fiter_fields)
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
            // console.log(res)
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
            console.log(this.state.searchArr)
        });
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
            width: 150,
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
            render: (content) => {
                return <div>
                        <Tooltip placement="topLeft" title={content['content']}>{content['content']}</Tooltip>
                        </div>;
            },
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

    // props = {
    //     name: 'file',
    //     action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    //     headers: {
    //         authorization: 'authorization-text',
    //     },
    //     onChange(info) {
    //         if (info.file.status !== 'uploading') {
    //             console.log(info.file, info.fileList);
    //         }
    //         if (info.file.status === 'done') {
    //             message.success(`${info.file.name} file uploaded successfully`);
    //         } else if (info.file.status === 'error') {
    //             message.error(`${info.file.name} file upload failed.`);
    //         }
    //     },
    // };

    uploadProps = {
        // action: 'http://192.168.41.49/api/v1.0/upload',
        customRequest: (param) => {
            if (!param.file) {
                return false
            }
            var formData = new FormData();
            formData.append('file', param.file)
            // console.log(formData)
            apis.Upload(formData).then(res => {
                if (res.code === 0) {
                    this.setState({
                        path: res.data.download,
                        fileList: [param.file]
                    })
                }
            })
        },
        onRemove: (file) => {
            this.setState({
                fileList: []
            });
            return true
        },

        onChange: (info) => {

            // let fileList = [...info.fileList];

            // if (fileList.length === 2) {
            //     let newFileList = fileList.slice(-1);
            //     this.setState({
            //         fileList: this.newFileList,
            //     });
            //     message.warning("一个版本只能上传一个文件")
            // };

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

        },
        maxCount: 1,
    }

    handleTitleChange(e) {
        this.setState({
            titleValue: e.target.value
        })
    }


    onEditorChange = (val) => {
        // console.log(val)
        let regex = /\{{(.+?)\}}/g;
        let option = val.toHTML().match(regex);
        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        let addRes = this.formRef.current.getFieldValue('variable') || []
        if (res) {
            let val = addRes.map(ele => ele.name);
            res = Array.from(new Set(res));
            for (let i = 0; i < res.length; i++) {
                addRes.push({ name: res[i] })
            }
            for (let i = 0; i < val.length; i++) {
                let index = -1
                for (let j = 0; j < addRes.length; j++) {
                    if (val[i] === addRes[j].name) index = j;
                }
                if (index !== -1) addRes.splice(index, 1)
            }
            this.formRef.current.setFieldsValue({ variable: addRes });
        }

        // console.log(addRes);


        this.setState({
            initValue: val,
            // addRes: addRes
        })
    }

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
                // html += `<image src=http://192.168.41.49${res.data.download} />`
                html += `<image src=${res.data.download} />`
                console.log(html)
                this.setState({
                    initValue: BraftEditor.createEditorState(html)
                })
            }
        })
    }

    formRef = React.createRef();

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



    render() {
        const { initValue, titleValue } = this.state
        // console.log(this.state.fileList)
        return (
            <div className="app-container">
                <Divider >
                    <MailOutlined /> 邮件模板
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
                    visible={this.state.visible}
                    onOk={this.onFinish}
                    onCancel={this.handleCancel}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    okText="保存"
                    cancelText="取消"
                    bodyStyle={{margin:'10px 10px'}}
                    destroyOnClose={true}
                >
                    <Form
                        name="basic"
                        onFinish={this.onFinish}
                        ref={this.formRef}
                    >
                        <Form.Item
                            label="邮件标题"
                            name="subject"
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
                                value={titleValue}
                                onChange={this.handleTitleChange.bind(this)}
                                placeholder="请输入模板名称"
                                style={{ width: '461px' ,height: '40px',borderRadius:' 5px '}}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginLeft: 100 }}>
                            <Upload
                                fileList={this.state.fileList}
                                {...this.uploadProps}>
                                <LinkOutlined style={{ fontSize: '13px', color: '#000000' }} />添加附件｜<CaretDownOutlined />
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            label="邮件正文"
                            name="info"
                            rules={[
                                {
                                    required: true,
                                    validator: (_, value, callback) => {
                                        if (!initValue) {
                                            callback('请输入邮件正文')
                                        } else {
                                            callback()
                                        }
                                    }
                                },
                            ]}
                        >
                            <BraftEditor
                                value={initValue}
                                controls={this.controls}
                                extendControls={this.extendControls}
                                onChange={this.onEditorChange}
                                placeholder="请输入邮件正文，支持Html语法"
                                className="html-BraftEditor"
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
                        <Form.List  name="variable" >
                            {(fields, { remove }) => (
                                <>
                                    {fields.map(({ key, name, fieldKey, ...restField }) => {
                                        let FormItem ="";
                                        if(key == 0){
                                            FormItem = (
                                            <Form.Item
                                                label="参数变量"
                                                {...restField}
                                                name={[name, 'name']}
                                                fieldKey={[fieldKey, 'name']}
                                                rules={[{ required: true }]}
                                                style={{ width: 220 }}
                                            ><Input disabled />
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
                                        return (<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
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
                <EditMail
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
        apis.getMailbox({
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
                    initValue: '',
                    filter_fields: res.data.filter_fields,
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
        // console.log(111)
        console.log(this.formRef.current.getFieldValue('variable'))
        this.formRef.current
            .validateFields()
            .then((val) => {
                console.log(this.state.path)
                apis.createMailModal({
                    ...val,
                    content: {
                        content: this.state.initValue.toHTML(),
                        sub_type: 'html',
                        subject: this.state.titleValue
                    },
                    title: this.state.titleValue,
                    content_format: "html",
                    path: this.state.path,
                    variable: this.formRef.current.getFieldValue('variable')
                    // title:subject
                })
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
        apis.deleteMailbox(obj.id).then(res => {
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
    }

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
        console.log(this.state.currentRowData)
    }

    handleEditCancel = (e) => {
        this.setState({
            editVisible: false,
        });
    };


    handleEditOk = (id, data) => {
        console.log("okk", data)

        apis.editMail(id, {
            content: {
                content: data.editorValue,
                sub_type: 'html',
                subject: data.title
            },
            title: data.title,
            content_format: "html",
            path: data.path,
            variable: data.variable

        }).then((response) => {
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

        apis.createMailModal({
            content: {
                content: data.editorValue,
                sub_type: 'html',
                subject: data.title
            },
            title: data.title,
            content_format: "html",
            path: data.path,
            variable: data.variable
        }).then((response) => {
            // this.editFormRef.current.resetFields();
            this.setState({ editVisible: false });
            message.success("复制成功!")
            this.getRefresh()
        }).catch(e => {
            message.success("复制失败,请重试!")
        })
    };

}