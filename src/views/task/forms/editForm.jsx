import React, { Component } from "react";
import apis from "../../../utils/api/unsplash/index";

import { Form, Input, Row, Select, Col, Modal, Radio, message, Popover, Cascader } from "antd";
// import { Form } from "@ant-design/compatible"
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");
export default class EditForm extends Component {
  state = {

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
    theUser2Name: '',
    is_run_now: false,
    is_periodic_tasks: false,

    mailDateSource: [],
    SMSDateSource: [],
    userDateSource: '',
    robotDateSource: [],
    groupDateSource: [],
    noticeDateSource: [],
    recordDateSource: [],

    styleFlowState: "111",
    atflowState: "",

    cronChange: false

  }

  componentWillReceiveProps(nextProps) {
    // console.log("componentWillReceiveProps")
    // if (this.props.currentRowData !== nextProps.currentRowData) {
    this.setState({
      is_periodic_tasks: nextProps.currentRowData.is_periodic_tasks,
      is_at_all: Object.hasOwnProperty.call(nextProps.currentRowData, "data") ? nextProps.currentRowData.data.is_at_all : false,
      atflowState: nextProps.currentRowData.style == "ding_robot" ? Object.hasOwnProperty.call(nextProps.currentRowData, "data") ? nextProps.currentRowData.data.is_at_all ? 11 : nextProps.currentRowData.data.user_id_list.length ? 12 : 10 : '' : '',
      recordFlowState: Object.hasOwnProperty.call(nextProps.currentRowData, "data") ? nextProps.currentRowData.data.is_alone : false,
    });
    // }
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

  onFocusRecord = (e) => {
    let that = this;
    apis.getDingRecord({
      page: '1',
      // size: this.state.pageSize,
      // ...this.state.searchData
    }).then(res => {
      // console.log(res);
      if (res.code == 0 || res.code == 200) {
        // console.log(res.data)
        that.setState({
          recordDateSource: res.data.results
        });
      } else {
        message.error(res.message);
      }
    }).catch(err => {
      message.error(err);
    });
  }


  cronExample = (
    <div>
      <p>https://cron.qqe2.com/ </p>
      <p>https://tool.lu/crontab</p>
      <p>https://mviess.de/sysadm/crontabmaker/index.php</p>
    </div>
  );


  editFormRef = React.createRef();


  render() {
    const {
      visible,
      currentRowData,
    } = this.props;


    const { Option } = Select;

    // const { getFieldDecorator } = form;
    const { data, style, is_alone, is_periodic_tasks, is_run_now, tpl_id } = currentRowData;
    const send_style = is_run_now ? 2 : is_periodic_tasks ? 3 : 1
    const formItemLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 16 },
      },
    };

    const userChildren = [];
    for (let i = 0; i < this.state.userDateSource.length; i++) {
      userChildren.push(<Option key={this.state.userDateSource[i].value} children>{this.state.userDateSource[i].name}</Option>);
    }


    const mailChildren = [];
    for (let i = 0; i < this.state.mailDateSource.length; i++) {
      mailChildren.push({
        value: this.state.mailDateSource[i].id,
        label: this.state.mailDateSource[i].title,
        children: [
          {
            value: this.state.mailDateSource[i].id,
            label: this.state.mailDateSource[i].content.content,
          }
        ]
      })
    };

    const SMSChildren = [];
    for (let i = 0; i < this.state.SMSDateSource.length; i++) {
      SMSChildren.push({
        value: this.state.SMSDateSource[i].id,
        label: this.state.SMSDateSource[i].title,
        children: [
          {
            value: this.state.SMSDateSource[i].id,
            label: this.state.SMSDateSource[i].content.content,
          }
        ]
      })
    };

    const robotChildren = [];
    for (let i = 0; i < this.state.robotDateSource.length; i++) {
      this.state.robotDateSource[i].content_format === "text" ? robotChildren.push({
        value: this.state.robotDateSource[i].id,
        label: this.state.robotDateSource[i].title,
        children: [
          {
            value: this.state.robotDateSource[i].content.content,
            label: this.state.robotDateSource[i].content.content,
          }
        ]
      }) :
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
      this.state.noticeDateSource[i].content_format === "text" ? noticeChildren.push({
        value: this.state.noticeDateSource[i].id,
        label: this.state.noticeDateSource[i].title,
        children: [
          {
            value: this.state.noticeDateSource[i].content.content,
            label: this.state.noticeDateSource[i].content.content,
          }
        ]
      }) :
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
    for (let i = 0; i < this.state.groupDateSource.length; i++) {
      this.state.groupDateSource[i].content_format === "text" ? groupChildren.push({
        value: this.state.groupDateSource[i].id,
        label: this.state.groupDateSource[i].title,
        children: [
          {
            value: this.state.groupDateSource[i].content.content,
            label: this.state.groupDateSource[i].content.content,
          }
        ]
      }) :
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

    const recordChildren = [];
    for (let i = 0; i < this.state.recordDateSource.length; i++) {
      recordChildren.push({
        value: this.state.recordDateSource[i].id,
        label: this.state.recordDateSource[i].title,
        children: [
          {
            value: this.state.recordDateSource[i].content.content,
            label: this.state.recordDateSource[i].content.content,
          }
        ]
      })
    };

    return (
      <Modal
        title="编辑"
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        destroyOnClose={true}
        okText='更新'
        width='645px'
        bodyStyle={{ margin: '50px 50px' }}
      >
        <Form {...formItemLayout} initialValues={{ ...currentRowData, ...data }} ref={this.editFormRef}>
          <Form.Item
            label="推送名称"
            name="title"
            // initialValue={title}
            rules={[{ required: true }]}
          >
            <Input
              placeholder="请输入推送名称"
              style={{ width: 400, height: 40, borderRadius: 5 }}
            />
          </Form.Item>

          <Form.Item
            label="推送类型"
            name="style"
            rules={[{ required: true }]}
          // initialValue={style}

          >
            <Select
              style={{ width: 400, height: 40, borderRadius: 5 }}
              className="selectStyle"
              disabled
            >
              <Option value="mail" >邮件</Option>
              <Option value="sms" >短信</Option>
              <Option value="ding_notice" >钉钉工作通告</Option>
              <Option value="ding_group" >钉钉群通知</Option>
              <Option value="ding_robot" >钉钉机器人</Option>
              <Option value="ding_record" >钉钉待办</Option>
            </Select>
          </Form.Item>

          {
            style == "mail" && <>
              <Form.Item
                label="发件人"
                rules={[{ required: true }]}
                name="name"
              >
                <Select
                  placeholder="请选择发件人"
                  style={{ width: 400, height: 40, borderRadius: 5 }}
                  onChange={(e) => this.state.theUserName = e.target.value}
                  className="selectStyle"
                  onFocus={this.onFocusUser}
                >
                  {userChildren}
                </Select>
              </Form.Item>


              <Form.Item
                label="收件人"
                name="to"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="xxxx@ximalaya.com"
                  // onChange={this.handleToWhoChange.bind(this)}
                  style={{ width: 400, height: 40, borderRadius: 5 }}
                />
              </Form.Item>

              <Form.Item
                label="发送方式"
                name="send_style"
                rules={[{ required: true }]}
                initialValue={send_style}

              >
                <Radio.Group
                  onChange={e => { this.setState({ cronChange: true }); if (e.target.value == 3) { this.setState({ is_periodic_tasks: true }) } else { this.setState({ is_periodic_tasks: false }) }; }}
                >
                  <Radio value={1}>仅创建</Radio>
                  <Radio value={2}>创建并发送</Radio>
                  <Radio value={3}>周期发送</Radio>

                </Radio.Group>
              </Form.Item>

              {
                this.state.is_periodic_tasks == true && <>
                  <Form.Item
                    label="定时规则"
                    name='crontab_info'
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="Cron 表达式"
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Row style={{ marginBottom: 24, marginTop: -24 }}>
                    <Col sm={4}></Col>
                    <Col sm={20}>
                      <Popover
                        className="shili"
                        placement="right"
                        content={this.cronExample}
                        trigger="click"
                      >
                        <span>示例</span>
                      </Popover>
                    </Col>
                  </Row>
                </>
              }

              <Form.Item
                label="编辑方式"
                name="edit-style"
                rules={[{ required: true }]}
                initialValue={111}
              >
                <Select
                  style={{ width: 400 }}
                  // onChange={e => { this.setState({ styleFlowState: e }) }}
                  className="selectStyle"
                >
                  <Option value={111} >模版导入</Option>
                  <Option value={112} disabled>手动输入</Option>

                </Select>
              </Form.Item>

              <Form.Item
                label="正文"
                name="www"
                rules={[{ required: true }]}
                initialValue={[tpl_id, tpl_id]}
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
          {
            style == "sms" && <>
              <Form.Item
                label="接收方"
                name="to"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="请输入接收方"
                  style={{ width: 400, height: 40, borderRadius: 5 }}
                />
              </Form.Item>
              <Form.Item
                label="发送方式"
                name="send_style"
                rules={[{ required: true }]}
                initialValue={send_style}
              >
                <Radio.Group
                  onChange={e => { this.setState({ cronChange: true }); if (e.target.value == 3) { this.setState({ is_periodic_tasks: true }) } else { this.setState({ is_periodic_tasks: false }) }; }}
                >
                  <Radio value={1}>仅创建</Radio>
                  <Radio value={2}>创建并发送</Radio>
                  <Radio value={3}>周期发送</Radio>

                </Radio.Group>
              </Form.Item>

              {
                this.state.is_periodic_tasks == true && <>
                  <Form.Item
                    label="定时规则"
                    name='crontab_info'
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="Cron 表达式"
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Row style={{ marginBottom: 24, marginTop: -24 }}>
                    <Col sm={4}></Col>
                    <Col sm={20}>
                      <Popover
                        className="shili"
                        placement="right"
                        content={this.cronExample}
                        trigger="click"
                      >
                        <span>示例</span>
                      </Popover>
                    </Col>
                  </Row>
                </>
              }

              <Form.Item
                label="编辑方式"
                name="edit-style"
                rules={[{ required: true }]}
                initialValue={111}

              >
                <Select
                  style={{ width: 400 }}
                  // onChange={e => { this.setState({ styleFlowState: e }) }}
                  className="selectStyle"
                >
                  <Option value={111} >模版导入</Option>
                  <Option value={112} disabled>手动输入</Option>

                </Select>
              </Form.Item>
              {
                this.state.styleFlowState == "111" &&
                <>
                  <Form.Item
                    label="正文"
                    name="www"
                    rules={[{ required: true }]}
                    initialValue={[tpl_id, tpl_id]}
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
            style == "ding_notice" && <>
              <Form.Item
                label="接收对象"
                name="is_at_all"
                rules={[{ required: true }]}
                style={{ minHeight: 10 }}
              >
                <Select
                  style={{ width: 400 }}
                  onChange={e => { console.log(e); this.setState({ is_at_all: e }) }}
                  className="selectStyle"
                // defaultValue={12}
                >
                  <Option value={true} disabled>@所有人</Option>
                  <Option value={false} >@指定的人</Option>
                </Select>
              </Form.Item>
              {
                this.state.is_at_all == false &&

                <Form.Item
                  label="被@的人"
                  name="user_id_list"
                  rules={[{ required: true }]}

                >
                  <Input
                    placeholder="工号"
                    // value={toWhoValue}
                    // onChange={this.handleToWhoChange.bind(this)}
                    style={{ width: 400, height: 40, borderRadius: 5 }}
                  />
                </Form.Item>
              }
              <Form.Item
                label="发送方式"
                name="send_style"
                rules={[{ required: true }]}
                initialValue={send_style}

              >
                <Radio.Group
                  onChange={e => { this.setState({ cronChange: true }); if (e.target.value == 3) { this.setState({ is_periodic_tasks: true }) } else { this.setState({ is_periodic_tasks: false }) }; }}
                >
                  <Radio value={1}>仅创建</Radio>
                  <Radio value={2}>创建并发送</Radio>
                  <Radio value={3}>周期发送</Radio>

                </Radio.Group>
              </Form.Item>

              {
                this.state.is_periodic_tasks == true && <>
                  <Form.Item
                    label="定时规则"
                    name='crontab_info'
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="Cron 表达式"
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Row style={{ marginBottom: 24, marginTop: -24 }}>
                    <Col sm={4}></Col>
                    <Col sm={20}>
                      <Popover
                        className="shili"
                        placement="right"
                        content={this.cronExample}
                        trigger="click"
                      >
                        <span>示例</span>
                      </Popover>
                    </Col>
                  </Row>
                </>
              }

              <Form.Item
                label="编辑方式"
                name="edit-style"
                rules={[{ required: true }]}
                initialValue={111}
              >
                <Select
                  style={{ width: 400 }}
                  // onChange={e => { this.setState({ styleFlowState: e }) }}
                  className="selectStyle"
                >
                  <Option value={111} >模版导入</Option>
                  <Option value={112} disabled>手动输入</Option>

                </Select>
              </Form.Item>
              {
                true &&
                <>
                  <Form.Item
                    label="正文"
                    name="www"
                    rules={[{ required: true }]}
                    initialValue={[tpl_id, tpl_id]}
                  >
                    <Cascader
                      options={noticeChildren}
                      style={{ width: 400 }}
                      placeholder="请选择正文"
                      notFoundContent="暂无模板"
                      onFocus={this.onFocusNotice}
                    />
                  </Form.Item>
                </>

              }
            </>

          }
          {
            style == "ding_group" && <>
              <Form.Item
                label="发送方"
                name="chat_id"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="请输入发送方"
                  // value={theUser2Name}
                  // onChange={this.handleUser2Change.bind(this)}
                  style={{ width: 400, height: 40, borderRadius: 5 }}
                />

              </Form.Item>

              <Form.Item
                label="发送方式"
                name="send_style"
                rules={[{ required: true }]}
                initialValue={send_style}

              >
                <Radio.Group
                  onChange={e => { this.setState({ cronChange: true }); if (e.target.value == 3) { this.setState({ is_periodic_tasks: true }) } else { this.setState({ is_periodic_tasks: false }) }; }}
                >
                  <Radio value={1}>仅创建</Radio>
                  <Radio value={2}>创建并发送</Radio>
                  <Radio value={3}>周期发送</Radio>

                </Radio.Group>
              </Form.Item>

              {
                this.state.is_periodic_tasks == true && <>
                  <Form.Item
                    label="定时规则"
                    name='crontab_info'
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="Cron 表达式"
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Row style={{ marginBottom: 24, marginTop: -24 }}>
                    <Col sm={4}></Col>
                    <Col sm={20}>
                      <Popover
                        className="shili"
                        placement="right"
                        content={this.cronExample}
                        trigger="click"
                      >
                        <span>示例</span>
                      </Popover>
                    </Col>
                  </Row>
                </>
              }

              <Form.Item
                label="编辑方式"
                name="edit-style"
                rules={[{ required: true }]}
                initialValue={111}
              >
                <Select
                  style={{ width: 400 }}
                  // onChange={e => { this.setState({ styleFlowState: e }) }}
                  className="selectStyle"
                >
                  <Option value={111} >模版导入</Option>
                  <Option value={112} disabled>手动输入</Option>

                </Select>
              </Form.Item>

              {
                true &&
                <>
                  <Form.Item
                    label="正文"
                    name="www"
                    rules={[{ required: true }]}
                    initialValue={[tpl_id, tpl_id]}
                  >
                    <Cascader
                      options={groupChildren}
                      style={{ width: 400 }}
                      placeholder="请选择正文"
                      notFoundContent="暂无模板"
                      onFocus={this.onFocusGroup}
                    />
                  </Form.Item>
                </>

              }
            </>
          }

          {
            style == "ding_robot" && <>
              <Form.Item
                label="发送方"
                name="webhook"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="请输入发送方"
                  // value={webhook}
                  // onChange={this.handleWebhookChange.bind(this)}
                  style={{ width: 400, height: 40, borderRadius: 5 }}
                />

              </Form.Item>

              <Form.Item
                label="密钥"
                name="secret"
              >
                <Input
                  placeholder="请输入密钥"
                  style={{ width: 400, height: 40, borderRadius: 5 }}
                />
              </Form.Item>

              <Form.Item
                label="发送对象"
                name="atflowState"
                rules={[{ required: true }]}
                style={{ minHeight: 10 }}
                initialValue={this.state.atflowState}
              >
                <Select
                  style={{ width: 400 }}
                  className="selectStyle"
                  onChange={e => this.setState({ atflowState: e })}
                >
                  <Option value={10} >不@任何人</Option>
                  <Option value={11} >@所有人</Option>
                  <Option value={12} >@指定的人</Option>
                </Select>
              </Form.Item>
              {
                this.state.atflowState == 12 &&

                <Form.Item
                  label="被@的人"
                  name="user_id_list"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="工号"
                    // value={toWhoValue}
                    // onChange={this.handleToWhoChange.bind(this)}
                    style={{ width: 400, height: 40, borderRadius: 5 }}
                  />
                </Form.Item>
              }
              <Form.Item
                label="发送方式"
                name="send_style"
                rules={[{ required: true }]}
                initialValue={send_style}

              >
                <Radio.Group
                  onChange={e => { if (e.target.value == 3) { this.setState({ is_periodic_tasks: true }) } else { this.setState({ is_periodic_tasks: false }) }; }}
                >
                  <Radio value={1}>仅创建</Radio>
                  <Radio value={2}>创建并发送</Radio>
                  <Radio value={3}>周期发送</Radio>

                </Radio.Group>
              </Form.Item>

              {
                this.state.is_periodic_tasks == true && <>
                  <Form.Item
                    label="定时规则"
                    name='crontab_info'
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="Cron 表达式"
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Row style={{ marginBottom: 24, marginTop: -24 }}>
                    <Col sm={4}></Col>
                    <Col sm={20}>
                      <Popover
                        className="shili"
                        placement="right"
                        content={this.cronExample}
                        trigger="click"
                      >
                        <span>示例</span>
                      </Popover>
                    </Col>
                  </Row>
                </>
              }

              <Form.Item
                label="编辑方式"
                name="edit-style"
                rules={[{ required: true }]}
                initialValue={111}
              >
                <Select
                  style={{ width: 400 }}
                  // onChange={e => { this.setState({ styleFlowState: e }) }}
                  className="selectStyle"
                >
                  <Option value={111} >模版导入</Option>
                  <Option value={112} disabled>手动输入</Option>

                </Select>
              </Form.Item>

              {
                true &&
                <>
                  <Form.Item
                    label="正文"
                    name="www"
                    rules={[{ required: true }]}
                    initialValue={[tpl_id, tpl_id]}
                  >
                    <Cascader
                      options={robotChildren}
                      style={{ width: 400 }}
                      placeholder="请选择正文"
                      notFoundContent="暂无模板"
                      onFocus={this.onFocusRobot}
                    />
                  </Form.Item>
                </>

              }
            </>
          }

          {
            style == "ding_record" && <>
              <Form.Item
                label="待办方式"
                name="is_alone"
                rules={[{ required: true }]}
              >
                <Select
                  style={{ width: 400 }}
                  onChange={e => { this.setState({ recordFlowState: e }) }}
                  className="selectStyle"
                >
                  <Option value={false} >协作待办</Option>
                  <Option value={true} >独立待办</Option>

                </Select>
              </Form.Item>

              {
                this.state.recordFlowState === false && <>
                  <Form.Item
                    label="执行者"
                    name="user_id_list"

                    rules={[
                      {
                        required: true
                      },
                    ]}
                  >
                    <Input
                      placeholder="请输入接收方"
                      // value={toWhoValue}
                      // onChange={this.handleToWhoChange.bind(this)}
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="参与者"
                    name="participant_id_list"
                  >
                    <Input
                      placeholder="请输入参与者"
                      // value={toWhoValue}
                      // onChange={this.handleToWhoChange.bind(this)}
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="逾期时间"
                    name="due_timedelta"
                  >
                    <Input
                      placeholder="请输入逾期时间"
                      // value={toWhoValue}
                      // onChange={this.handleToWhoChange.bind(this)}
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>

                </>
              }
              {
                this.state.recordFlowState === true && <>
                  <Form.Item
                    label="执行者"
                    name="user_id_list"
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="请输入执行者"
                      // value={toWhoValue}
                      // onChange={this.handleToWhoChange.bind(this)}
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                </>
              }

              <Form.Item
                label="发送方式"
                name="send_style"
                rules={[{ required: true }]}
                initialValue={send_style}

              >
                <Radio.Group
                  onChange={e => { if (e.target.value == 3) { this.setState({ is_periodic_tasks: true }) } else { this.setState({ is_periodic_tasks: false }) }; }}
                >
                  <Radio value={1}>仅创建</Radio>
                  <Radio value={2}>创建并发送</Radio>
                  <Radio value={3}>周期发送</Radio>

                </Radio.Group>
              </Form.Item>

              {
                this.state.is_periodic_tasks == true && <>
                  <Form.Item
                    label="定时规则"
                    name='crontab_info'
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="Cron 表达式"
                      style={{ width: 400, height: 40, borderRadius: 5 }}
                    />
                  </Form.Item>
                  <Row style={{ marginBottom: 24, marginTop: -24 }}>
                    <Col sm={4}></Col>
                    <Col sm={20}>
                      <Popover
                        className="shili"
                        placement="right"
                        content={this.cronExample}
                        trigger="click"
                      >
                        <span>示例</span>
                      </Popover>
                    </Col>
                  </Row>
                </>
              }

              <Form.Item
                label="编辑方式"
                name="edit-style"
                rules={[{ required: true }]}
                initialValue={111}
              >
                <Select
                  style={{ width: 400 }}
                  // onChange={e => { this.setState({ styleFlowState: e }) }}
                  className="selectStyle"
                >
                  <Option value={111} >模版导入</Option>
                  <Option value={112} disabled>手动输入</Option>

                </Select>
              </Form.Item>

              {
                true &&
                <>
                  <Form.Item
                    label="正文"
                    name="www"
                    rules={[{ required: true }]}
                    initialValue={[tpl_id, tpl_id]}
                  >
                    <Cascader
                      options={recordChildren}
                      style={{ width: 400 }}
                      placeholder="请选择正文"
                      notFoundContent="暂无模板"
                      onFocus={this.onFocusRecord}
                    />
                  </Form.Item>


                </>

              }

            </>
          }

        </Form>
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
    const { id, content_format, data } = this.props.currentRowData


    this.editFormRef.current.validateFields()
      .then(values => {
        console.log(values);
        const datas = {
          ...values,
          username: this.state.theUserName ? this.state.theUserName : data.username ? data.username : "",
          atflowState: this.state.atflowState
        }
        onOk(id, datas)
      }
      )
      .catch(errorInfo => {
        console.log(errorInfo)
      })
  }
}




