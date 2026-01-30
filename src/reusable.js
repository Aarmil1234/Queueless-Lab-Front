import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://medicarenew-0of0.onrender.com/medicare",
  baseURL: "https://queueless-lab.onrender.com",
  timeout: 60000,
});

export const apiRequest = async (method, url, data = {}) => {
  try {
    const res = await axiosInstance({
      method,
      url,
      data,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};
