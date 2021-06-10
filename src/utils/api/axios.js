import axios from "axios";
import browser from "../common/browser";
import url from "./unsplash/url";

// 创建 axios 实例
let http = axios.create({
  // headers: {'Content-Type': 'application/json'},
  headers: {
    "x-requested-with": "XMLHttpRequest",
    // Cookie: 'csrftoken=ccrwPjqMMft5W6HHTPihbHLoMZT1jGAiXrr4h5I8XJe0ptILKRkROyWGw5dBvGkz; sessionid=stoi7y5r2nhkucrypqqh7rtcq0ukru5d'
  },
  timeout: 600000,
});

// 设置 post、put 默认 Content-Type
http.defaults.headers.post["Content-Type"] = "application/json";
http.defaults.headers.put["Content-Type"] = "application/json";
// 添加请求拦截器
http.interceptors.request.use(
  (config) => {
    console.log(config);
    //发送文件时不需要对数据进行处理
    if(config.url === url.Upload){
      return config;
    }
    if(config.url === url.addAppScanAsset){
      return config;
    }

    if (config.method === "post" || config.method === "put") {
      // post、put 提交时，将对象转换为string, 为处理Java后台解析问题

      config.data = JSON.stringify(config.data);
    } 
    else if (config.method === "get" && browser.isIE) {
      // 给GET 请求后追加时间戳， 解决IE GET 请求缓存问题
      let symbol = config.url.indexOf("?") >= 0 ? "&" : "?";
      config.url += symbol + "_=" + Date.now();
      console.log("==========", config.url, symbol, Date.now());
    }
    // 请求发送前进行处理
    return config;
  },
  (error) => {
    // 请求错误处理
    console.log(error);
    // notification.error({
    //   message: '😭 出错啦，请重试或者钉钉联系 张泽光',
    //   description: '错误信息：' + error.msg,
    // });
    return Promise.reject(error);
  }
);

// 添加响应拦截器
http.interceptors.response.use(
  (response) => {
    console.log(response, "response");
    let { data } = response;
    return data;
  },
  (error) => {
    console.log(error.response);
    error.response = error.response || "";
    // if (error.response.status === 401) {
    //   window.location.reload();
    // }
    console.log("error" + error);
    let info = {};
    let { status, statusText, data } = error.response;
    if (!error.response) {
      info = {
        code: 5000,
        msg: "Network Error",
      };
    } else {
      // 此处整理错误信息格式
      info = {
        code: status,
        data: data,
        msg: statusText,
      };
    }
    return Promise.reject(info);
  }
);

// /**
//  * 创建统一封装过的 axios 实例
//  * @return {AxiosInstance}
//  */
export default function () {
  return http;
}
