import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  baseURL: "https://queueless-lab.onrender.com",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Session helpers
//
// Auth lives in localStorage (not sessionStorage) so a login is shared across
// every tab/window of the same browser. A 24h expiry timestamp is stored
// alongside the token and enforced on every request.
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_KEYS = ["token", "tokenExpiry", "user", "ownerName", "hospitalName"];

export const setSession = ({ token, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("tokenExpiry", String(Date.now() + SESSION_DURATION_MS));
  localStorage.setItem("user", JSON.stringify(user || {}));
  localStorage.setItem("ownerName", user?.ownerName || "");
  localStorage.setItem(
    "hospitalName",
    user?.hospitalName || user?.labName || ""
  );
};

export const clearSession = () => {
  SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
  document.cookie =
    "hospitalId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const isSessionValid = () => {
  const token = localStorage.getItem("token");
  const expiry = Number(localStorage.getItem("tokenExpiry") || 0);
  return Boolean(token) && Date.now() < expiry;
};

let isShowingSessionPopup = false; // ✅ prevent multiple popups

const endSession = async (text) => {
  if (isShowingSessionPopup) return;
  isShowingSessionPopup = true;

  await Swal.fire({
    icon: "warning",
    title: "Session Ended",
    text,
    confirmButtonText: "OK",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  clearSession();
  window.location.href = "/login";
};

// ✅ Attach token + enforce the 24h expiry before every request
axiosInstance.interceptors.request.use((config) => {
  const isAuthRoute = (config.url || "").includes("/api/auth/");
  const token = localStorage.getItem("token");

  if (!isAuthRoute && token && !isSessionValid()) {
    endSession("Your session has expired. Please login again.");
    return Promise.reject(new Error("Session expired"));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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

    if (status === 401) {
      const isMultiLogin =
        message.toLowerCase().includes("device") ||
        message.toLowerCase().includes("logged in elsewhere");

      await endSession(
        isMultiLogin
          ? "Another device is connected with same login credentials."
          : "Your session has expired. Please login again."
      );
    }

    return Promise.reject(error);
  }
);

export const apiRequest = (method, url, data = null) => {
  const config = {
    method,
    url,
  };

  if (data) {
    config.data = data;
  }

  return axiosInstance(config);
};
