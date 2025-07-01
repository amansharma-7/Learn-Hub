import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headers, params) => {
  // console.log("body data is -> ", bodyData);
  // console.log("headers is -> ", headers);
  // console.log("params is -> ", params);
  return axiosInstance({
    method: method,
    url: url,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
  // const queryString = params
  //   ? "?" + new URLSearchParams(params).toString()
  //   : "";

  // const response = fetch(url + queryString, {
  //   method: method,
  //   headers: headers ? headers : {},
  //   body: bodyData ? JSON.stringify(bodyData) : null,
  // });
  // console.log(response);
  // return response;
};
