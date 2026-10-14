import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "https://queueless-lab.onrender.com", timeout: 60000, headers: { "Content-Type": "application/json" } });
const payloadOf = (response) => response?.data?.data?.data ?? response?.data?.data ?? response?.data;

export { API, payloadOf };

export default function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("Super Admin");
  const [mobileNumber, setMobileNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (mode === "login") {
        const response = await API.post("/api/super-admin/login", { email, password });
        const result = payloadOf(response);
        const token = result?.token || result?.accessToken;
        if (token) localStorage.setItem("superAdminToken", token);
        if (result?.user) localStorage.setItem("superAdminUser", JSON.stringify(result.user));
        navigate("/super-admin/dashboard");
      } else if (mode === "forgot") {
        await API.post("/api/super-admin/forgot-password", { name, email, mobileNumber, password });
        setMode("otp"); setNotice("OTP sent. Check the super admin email or phone for the verification code.");
      } else if (mode === "otp") {
        await API.post("/api/super-admin/verify-otp", { email, otp });
        setMode("reset"); setNotice("Email verified. Choose a new password.");
      } else {
        await API.post("/api/super-admin/reset-password", { email, otp, newPassword });
        setMode("login"); setPassword(""); setOtp(""); setNewPassword(""); setNotice("Password reset. Sign in with your new password.");
      }
    } catch (e) { setError(e?.response?.data?.message || e?.response?.data?.data?.message || "Request failed. Check the details and try again."); }
    finally { setBusy(false); }
  };

  const title = { login: "", forgot: "Recover access", otp: "Verify your email", reset: "Set a new password" }[mode];
  return <main className="login-wrapper">
    <section className="registration-container auth-container">
      <div className="form-card">
        <div className="form-header py-3 p-2 text-center">
          <h1 className="brand-title">Queueless</h1>
          <h2>{title}</h2>
          <p className="mb-0 mt-2">{mode === "login" ? "Manage labs and monitor platform activity." : "Follow the steps to restore your account."}</p>
        </div>
        <div className="form-body">
          <form onSubmit={submit}>
            {mode === "forgot" && <><div className="form-group mb-3"><label className="form-label">Full name</label><input className="form-control" value={name} onChange={e => setName(e.target.value)} required /></div><div className="form-group mb-3"><label className="form-label">Mobile number</label><input className="form-control" value={mobileNumber} onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ""))} maxLength={10} required /></div></>}
            {mode !== "login" && <div className="form-group mb-3"><label className="form-label">Email address</label><input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>}
            {mode === "login" && <div className="form-group mb-3"><label className="form-label">Email address</label><input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@queueless.com" required /></div>}
            {mode === "login" && <div className="form-group mb-3"><label className="form-label">Password</label><input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>}
            {mode === "forgot" && <div className="form-group mb-3"><label className="form-label">Current password</label><input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>}
            {mode === "otp" && <div className="form-group mb-3"><label className="form-label">6 digit OTP</label><input className="form-control" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} required /></div>}
            {mode === "reset" && <><div className="form-group mb-3"><label className="form-label">6 digit OTP</label><input className="form-control" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} required /></div><div className="form-group mb-3"><label className="form-label">New password</label><input className="form-control" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} required /></div></>}
            {error && <div className="alert alert-danger py-2">{error}</div>}{notice && <div className="alert alert-success py-2">{notice}</div>}
            <button className="btn-custom btn-primary w-100 justify-content-center" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "forgot" ? "Send verification code" : mode === "otp" ? "Verify code" : "Reset password"}</button>
          </form>
          <div className="text-center mt-3">{mode === "login" ? <button className="btn btn-link" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }}>Forgot password?</button> : <button className="btn btn-link" onClick={() => { setMode("login"); setError(""); setNotice(""); }}><ArrowLeft size={15} /> Back to sign in</button>}</div>
        </div>
      </div>
    </section>
  </main>;
}
