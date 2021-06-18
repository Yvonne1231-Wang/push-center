import axios from "./axios";

let instance = axios();
export default {
  get(url, params, headers) {
    let options = {};
    if (params) {
      options.params = params;
    }

    if (headers) {
      options.headers = headers;
    }

    return instance.get(url, options);
  },
  post(url, params, headers) {
    let options = {};
    if (headers) {
      options.headers = headers;
    }
    return instance.post(url, params, options);
  },
  put(url, params, headers) {
    let options = {};
    if (headers) {
      options.headers = headers;
    }
    return instance.put(url, params, options);
  },
  delete(url, data, headers) {
    let options = {};
    if (data) {
      options.data = data;
    }
    console.log(options.data);
    if (headers) {
      options.headers = headers;
    }

    return instance.delete(url, options);
  },
};
