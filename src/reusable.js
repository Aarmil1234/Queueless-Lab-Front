import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://medicarenew-0of0.onrender.com/medicare",
  baseURL: "https://queueless-lab.onrender.com",
  timeout: 60000,
});

export const apiRequest = async (method, url, data = null, isAuth = true) => {
  const token = sessionStorage.getItem("token");

  const config = {
    method,
    url,
    headers: {},
    data,
  };

  if (isAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return axios(config);
};
