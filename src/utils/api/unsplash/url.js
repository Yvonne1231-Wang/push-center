const baseUrl = "/api/v1.0";
//const baseUrl = "";
//const baseUrl = "http://192.168.3.88:8000/api/v2.0";

export default {
  getData: baseUrl + '/tpl',

  getUser:  baseUrl + '/mail',
  
  getMailbox:baseUrl + '/tpl/mail',
  deleteMailbox:baseUrl +'/tpl/mail/',
  createMailModal: baseUrl + '/tpl/mail',
  editMail: baseUrl + '/tpl/mail',

  getSMS:baseUrl + '/tpl/sms',
  deleteSMS:baseUrl +'/tpl/sms/',
  createSMS: baseUrl + '/tpl/sms',
  editSMS: baseUrl + '/tpl/sms',

  getDingRecord: baseUrl + '/tpl/ding_record',
  deleteDingRecord:baseUrl +'/tpl/ding_record/',
  createDingRecord:baseUrl +'/tpl/ding_record',
  editDingRecord:baseUrl +'/tpl/ding_record',

  getDingRobot: baseUrl + '/tpl/ding_robot',
  deleteDingRobot:baseUrl +'/tpl/ding_robot/',
  createDingRobot:baseUrl +'/tpl/ding_robot',
  editDingRobot:baseUrl +'/tpl/ding_robot',

  getDingGroup: baseUrl + '/tpl/ding_group',
  deleteDingGroup:baseUrl +'/tpl/ding_group/',
  createDingGroup:baseUrl +'/tpl/ding_group',
  editDingGroup:baseUrl +'/tpl/ding_group',

  getDingNotice: baseUrl + '/tpl/ding_notice',
  deleteDingNotice:baseUrl +'/tpl/ding_notice/',
  createDingNotice:baseUrl +'/tpl/ding_notice',
  editDingNotice:baseUrl +'/tpl/ding_notice',

  getHistory: baseUrl + '/task/history',
  createHistory: baseUrl + '/task',
  deleteHistory: baseUrl + '/task/history/id',
  detailHistory: baseUrl + '/task/history/id',
  sendHistory:baseUrl + '/task/history/id',

  getTask: baseUrl + '/task',
  deleteTask: baseUrl + '/task/id',
  detailTask: baseUrl + '/task/id',
  editTask:baseUrl + '/task/id',
  sendTask:baseUrl + '/task/id',
  transferTask:baseUrl + '/task',

  getScene: baseUrl + '/scene',
  createScene: baseUrl + '/scene',
  deleteScene: baseUrl + '/scene/id',
  detailScene: baseUrl + '/scene/id',
  editScene:baseUrl + '/scene/id',
  transferScene:baseUrl + '/scene',




  Upload: baseUrl +'/upload'
};
