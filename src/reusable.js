import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  baseURL: "https://queueless-lab.onrender.com",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isShowingSessionPopup = false; // ✅ prevent multiple popups

// ✅ Handle 401 + popup
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "";
    const url = error?.config?.url || "";

    // ✅ 🚫 SKIP LOGIN API
    if (url.includes("/api/auth/login")) {
      return Promise.reject(error);
    }

    if (status === 401 && !isShowingSessionPopup) {
      isShowingSessionPopup = true;

      const isMultiLogin =
        message.toLowerCase().includes("device") ||
        message.toLowerCase().includes("logged in elsewhere");

      await Swal.fire({
        icon: "warning",
        title: "Session Ended",
        text: isMultiLogin
          ? "Another device is connected with same login credentials."
          : "Your session has expired. Please login again.",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      sessionStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export const apiRequest = (method, url, data = null) => {
  return axiosInstance({
    method,
    url,
    data,
  });
};