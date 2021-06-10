import api from "../index";
import urls from "./url";
// import { formatUrl } from '../../common/utils'
// 这个东西是unsplash要求加在header里的验证，有兴趣的同学可以去看他的api，此处不再赘述
const header = {
  // Authorization: "Client-ID xxxxxxx",
  Authorization: "8918c26c91364e9f9447c241cb46ff09",
  "Content-Type": "application/json",
};

export default {
  getData: (params) => {
    return api.get(urls.getData, params, header)
  },
  //获取发件人邮箱
  getUser: (params) => {
    return api.get(urls.getUser, params, header)
  },

  //mailbox
  getMailbox: (params) => {
    return api.get(urls.getMailbox, params, header)
  },
  createMailModal: (params) => {
    return api.post(urls.createMailModal, params, header)
  },
  deleteMailbox: (id) => {
    return api.delete(urls.deleteMailbox + id, {}, header)
  },
  editMail: (id, param) => {
    return api.put(urls.editMail + "/" + id, param, header)
  },


  //sms
  getSMS: (params) => {
    return api.get(urls.getSMS, params, header)
  },
  createSMS: (params) => {
    return api.post(urls.createSMS, params, header)
  },
  deleteSMS: (id) => {
    return api.delete(urls.deleteSMS + id, {}, header)
  },
  editSMS: (id, param) => {
    return api.put(urls.editSMS + "/" + id, param, header)
  },

  // dingdingRecord
  getDingRecord: (params) => {
    return api.get(urls.getDingRecord, params, header)
  },
  createDingRecord: (params) => {
    return api.post(urls.createDingRecord, params, header)
  },
  deleteDingRecord: (id) => {
    return api.delete(urls.deleteDingRecord + id, {}, header)
  },
  editDingRecord: (id, params) => {
    return api.put(urls.editDingRecord + "/" + id, params, header)
  },

  // dingdingRobot
  getDingRobot: (params) => {
    return api.get(urls.getDingRobot, params, header)
  },
  createDingRobot: (params) => {
    return api.post(urls.createDingRobot, params, header)
  },
  deleteDingRobot: (id) => {
    return api.delete(urls.deleteDingRobot + id, {}, header)
  },
  editDingRobot: (id, params) => {
    return api.put(urls.editDingRobot + "/" + id, params, header)
  },


  //dingdingGroup
  getDingGroup: (params) => {
    return api.get(urls.getDingGroup, params, header)
  },
  createDingGroup: (params) => {
    return api.post(urls.createDingGroup, params, header)
  },
  deleteDingGroup: (id) => {
    return api.delete(urls.deleteDingGroup + id, {}, header)
  },
  editDingGroup: (id, param) => {
    return api.put(urls.editDingGroup + "/" + id, param, header)
  },


  //dingdingNotice
  getDingNotice: (params) => {
    return api.get(urls.getDingNotice, params, header)
  },
  createDingNotice: (params) => {
    return api.post(urls.createDingNotice, params, header)
  },
  deleteDingNotice: (id) => {
    return api.delete(urls.deleteDingNotice + id, {}, header)
  },
  editDingNotice: (id, param) => {
    return api.put(urls.editDingNotice + "/" + id, param, header)
  },

  //历史推送
  getHistory: (params) => {
    return api.get(urls.getHistory, params, header)
  },
  createHistory: (params) => {
    return api.post(urls.createHistory, params, header)
  },
  deleteHistory: (id) => {
    return api.delete(urls.deleteHistory + "/" + id, {}, header)
  },
  detailHistory: (id) => {
    return api.get(urls.detailHistory + "/" + id, {}, header)
  },
  sendHistory: (id) => {
    return api.post(urls.sendHistory + "/" + id, {}, header)
  },

  //推送管理
  getTask: (params) => {
    return api.get(urls.getTask, params, header)
  },
  deleteTask: (id) => {
    return api.delete(urls.deleteTask + "/" + id, {}, header)
  },
  detailTask: (id) => {
    return api.get(urls.detailTask + "/" + id, {}, header)
  },
  editTask: (id, params) => {
    return api.put(urls.editTask + "/" + id, params, header)
  },
  sendTask: (id) => {
    return api.post(urls.sendTask + "/" + id, {}, header)
  },
  transferTask: (id, params) => {
    return api.post(urls.transferTask + "/" + id + "/transfer", params, header)
  },





  Upload: (params) => {
    return api.post(urls.Upload, params, { "Content-Type": 'multipart/form-data' })
  },
};
