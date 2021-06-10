import apis from "../../utils/api/unsplash/index";
import React, { Component } from "react";
import Highlighter from 'react-highlight-words';
import { Table, Form, Button, Input, Divider, Modal, Tooltip, message, Row, Col, Popover,Space } from 'antd';
import { SearchOutlined, MailOutlined, LinkOutlined, PlusCircleOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
// import ListsComponent from "../../components/ListComponent";
import './mailbox.scss';
import 'braft-editor/dist/index.css';
import BraftEditor from "braft-editor";
// import TextArea from "antd/lib/input/TextArea";
import EditSMS from "./forms/editSMS"


const { confirm } = Modal;
const { TextArea } = Input;



export default class SMS extends Component {
    state = {
        dataSource: [],
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true
        },

        visible: false,
        deleteVisible: false,
        titleValue: '',
        initValue: '',
        fileList: [],
        file: null,
        path: '',

        editVisible: false,
        currentRowData: '',
        isCopy:false,
        
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
        apis.getDingRecord({
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
            if(this.state.filter_fields.length !== 0){
                let dataArr = {};
                let arr = this.state.filter_fields.map(ele => {
                    dataArr[ele.value] = [];
                    return ele.name;
                });
                if(Object.keys(this.state.searchArr).length === 0){
                    this.state.searchArr = dataArr;
                }
            }
        })
    }

    searchInput = []
   
    getColumnSearchProps = (dataIndex,title) => ({
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

        for(let key in arr){
            searchDataBefore[`${key}`] = arr[key].toString();
        }
        for(let i in searchDataBefore){
            if(searchDataBefore[i]){
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




    handleTitleChange(e) {
        this.setState({
            titleValue: e.target.value
        })
    }


    onEditorChange = (val) => {
        console.log(this.formRef.current.getFieldValue())
        let regex = /\{{(.+?)\}}/g;
        let option = val.target.value.match(regex);
        
        let res = []
        if (option) {
            res = option.map((item) => item.length ? item.substring(2, item.length - 2) : null);
        }
        let addRes = this.formRef.current.getFieldValue('variable') || []
        if (res) {
            // if(addRes.length === 0){
            //     addRes.push({
            //         name: res[i],
            //     })
            // }else{
            //     for (let i = 0; i < addRes.length; i++) {
            //         if(res.indexOf(addRes[i]['name']) === -1){
            //             addRes.push({
            //                 name: res[i],
            //             })
            //         }
            //     }
            // }
            let val = addRes.map(ele=>ele.name)
            // console.log(val)
            //Set是一种新的数据结构，它可以接收一个数组或者是类数组对象，自动去重其中的重复项目。
            //得到的结果，是一个对象，并不是数组，可以使用Array.from()，它可以把类数组对象、可迭代对象转化为数组：
            res = Array.from(new Set(res))
            for (let i = 0; i < res.length; i++) {
            //     let index = val.indexOf(res[i])
            //     // console.log(index, res[i])
            //     if(index === -1){
                    addRes.push({
                        name: res[i],
                    })
            //     }else{
            //         val.splice(index, 1)
            //     }
            }

            //判断这个name是否被删除
            for(let i = 0; i < val.length; i++){
                let index = -1
                for(let j = 0; j < addRes.length; j++){
                    if(val[i] === addRes[j].name) index = j;
                }
                if(index !== -1) addRes.splice(index, 1)
            }
            this.formRef.current.setFieldsValue({ variable: addRes })
        }
        // console.log(addRes);

        this.setState({
            initValue: val.target.value
        })
    }



    formRef = React.createRef();



    render() {
        const { initValue, titleValue, myKey } = this.state
        return (
            <div className="app-container">
                <Divider >
                    <MailOutlined /> 待办模板
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
                    bodyStyle={{margin:'10px 10px'}}
                    maskStyle={{ background: "rgba(217,218,217,0.5)" }}
                    okText="保存"
                    cancelText="取消"
                    key={myKey}
                    destroyOnClose={true}
                >
                    <Form
                        className="addModel"
                        name="basic"
                        onFinish={this.onFinish}
                        ref={this.formRef}
                        labelCol={{ span: 4 }}
                    >
                        <Form.Item
                            label="待办标题"
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
                                style={{ width: '461px' ,height: '40px',borderRadius:' 5px '}}
                                value={titleValue}
                                onChange={this.handleTitleChange.bind(this)}
                                placeholder="请输入模板名称" />
                        </Form.Item>


                        <Form.Item
                            label="待办事项"
                            name="content"
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
                            <TextArea
                                value={initValue}
                                onChange={this.onEditorChange}
                                placeholder="请输入待办事项"
                                className="sms-text"
                                rows="10" cols="60"
                            />
                            <br />
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
                <EditSMS
                    currentRowData={this.state.currentRowData}
                    visible={this.state.editVisible}
                    onCancel={this.handleEditCancel}
                    onOk={this.state.isCopy ? this.handleCopyOk : this.handleEditOk}
                    isCopy ={this.state.isCopy}
                    isSMS ={false}
                />

            </div>

        )
    }
    getRefresh() {
        let that = this;
        apis.getDingRecord({
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
    };
    handleCancel = (e) => {
        this.formRef.current.resetFields();
        this.setState({
            visible: false,
        });
    };

    onFinish = () => {
        // console.log(this.state.initValue, this.state.initValue.toHTML())
        this.formRef.current
            .validateFields()
            .then((val) => {
                console.log(val)
                apis.createDingRecord({
                    ...val,
                    content: {
                        content: this.state.initValue,
                    },
                    // title: this.state.titleValue,
                    content_format: "text",
                    // variable:this.formRef.current.getFieldValue('variable')
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
        apis.deleteDingRecord(obj.id).then(res => {
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
            isCopy:false
        });
        console.log(this.state.currentRowData)
    };

    handleCopy =(e, obj) => {
        this.state.currentRowData = Object.assign({}, obj)
        this.setState({
            editVisible: true,
            isCopy:true
        });
        console.log(this.state.currentRowData)
    }

    handleEditCancel = (e) => {
        this.setState({
            editVisible: false,
        });
    };


    handleEditOk = (id,data) => {
        // console.log("okk", data)

        apis.editDingRecord(id,{
            content: {
                content: data.content,
            },
            title: data.title,
            content_format: "text",
            variable:data.variable
        }).then((response) => {
            // this.editFormRef.current.resetFields();
            this.setState({ editVisible: false });
            message.success("编辑成功!")
            this.getRefresh()
        }).catch(e => {
            message.success("编辑失败,请重试!")
        })
    };

    handleCopyOk = (id,data) => {
        console.log("okk", data)

        apis.createDingRecord({
            content: {
                content: data.content,
            },
            title: data.title,
            content_format: "text",
            variable:data.variable
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
