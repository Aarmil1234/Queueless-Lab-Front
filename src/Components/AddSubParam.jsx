import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import {
  Plus,
  ArrowLeft,
  Settings,
  Trash2,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import "../Scss/Reports.scss";

export default function SubParameterManager() {
  const [view, setView] = useState("list");

  const [parameters, setParameters] = useState([]);
  const [parameterId, setParameterId] = useState("");
  const [subParams, setSubParams] = useState([]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ===============================
  // FETCH
  // ===============================
  const fetchParameters = async () => {
    try {
      const res = await apiRequest("get", "/api/parameter/");
      setParameters(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubParams = async (id) => {
    try {
      const res = await apiRequest("get", `/api/parameter/subCategory/${id}`);
      setSubParams(res?.data || []);
    } catch (err) {
      console.error(err);
      setSubParams([]);
    }
  };

  useEffect(() => { fetchParameters(); }, []);

  const handleParameterChange = (e) => {
    const id = e.target.value;
    setParameterId(id);
    if (id) fetchSubParams(id);
    else setSubParams([]);
  };

  // ===============================
  // RESET FORM
  // ===============================
  const resetForm = () => {
    setCode("");
    setName("");
    setIsActive(true);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => { setMessage(""); setMessageType(""); }, 3500);
      return () => clearTimeout(t);
    }
  }, [message]);

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parameterId || !code || !name) {
      showMessage("All fields are required.", "error");
      return;
    }
    try {
      setLoading(true);
      await apiRequest("post", "/api/parameter/subCategory/add", {
        parameterId, code, name, isActive,
      });
      showMessage("Sub-parameter added successfully.", "success");
      resetForm();
      setView("list");
      fetchSubParams(parameterId);
    } catch (err) {
      console.error(err);
      showMessage("Failed to add sub-parameter.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub-parameter?")) return;
    try {
      await apiRequest("delete", `/api/parameter/subCategory/${id}`);
      showMessage("Deleted successfully.", "success");
      fetchSubParams(parameterId);
    } catch (err) {
      console.error(err);
      showMessage("Delete failed.", "error");
    }
  };

  return (
    <div className="reports-wrapper">
      <div className="reports-container">

        {/* ── HEADER ── */}
        <div className="reports-header">
          <h2>
            <Settings size={22} />
            Sub Parameter Manager
          </h2>

          {view === "list" ? (
            <button
              className="btn-report btn-primary"
              onClick={() => { resetForm(); setView("add"); }}
            >
              <Plus size={16} /> Add Sub Parameter
            </button>
          ) : (
            <button
              className="btn-report btn-secondary"
              onClick={() => { resetForm(); setView("list"); }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* ── TOAST MESSAGE ── */}
        {message && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            padding: "14px 20px",
            borderRadius: 12,
            background: messageType === "success" ? "#ecfdf5" : "#fef2f2",
            border: `1.5px solid ${messageType === "success" ? "#6ee7b7" : "#fca5a5"}`,
            color: messageType === "success" ? "#065f46" : "#991b1b",
            fontWeight: 600,
            fontSize: "0.92rem",
            animation: "fadeInDown 0.4s ease",
          }}>
            {messageType === "success"
              ? <CheckCircle size={18} style={{ flexShrink: 0 }} />
              : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
            {message}
          </div>
        )}

        {/* ══════════════════════════════════════
            LIST VIEW
        ══════════════════════════════════════ */}
        {view === "list" && (
          <div className="reports-form-card" style={{ marginBottom: 30 }}>

            {/* Filter row */}
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                margin: "0 0 12px",
              }}>
                Filter by Parameter
              </p>
              <select
                value={parameterId}
                onChange={handleParameterChange}
                style={{ width: "100%", maxWidth: 420 }}
              >
                <option value="">— Select Parameter —</option>
                {parameters.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            {parameterId && (
              subParams.length > 0 ? (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subParams.map((s, i) => (
                      <tr key={s._id}>
                        <td style={{ color: "#9ca3af", fontWeight: 400, fontFamily: "inherit" }}>
                          {i + 1}
                        </td>
                        <td>
                          <span style={{
                            fontFamily: "'Courier New', monospace",
                            background: "#f3f4f6",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: "0.85rem",
                            color: "#667eea",
                            fontWeight: 700,
                          }}>
                            {s.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#1f2937" }}>{s.name}</td>
                        <td>
                          <span className={`status-badge ${s.isActive ? "completed" : "pending"}`}>
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <button
                              className="btn-small btn-report btn-danger"
                              onClick={() => handleDelete(s._id)}
                              title="Delete"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: "2px dashed #e5e7eb",
                  borderRadius: 16,
                }}>
                  <Settings size={40} style={{ opacity: 0.25, marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontWeight: 600, color: "#6b7280" }}>
                    No sub-parameters found
                  </h3>
                  <p style={{ margin: "8px 0 20px", fontSize: "0.9rem", color: "#9ca3af" }}>
                    No sub-parameters have been added for this parameter yet.
                  </p>
                  <button
                    className="btn-report btn-primary"
                    onClick={() => { resetForm(); setView("add"); }}
                  >
                    <Plus size={16} /> Add First Sub Parameter
                  </button>
                </div>
              )
            )}

            {!parameterId && (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <Settings size={48} style={{ opacity: 0.15, marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#9ca3af" }}>
                  Select a parameter above to view its sub-parameters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            ADD VIEW
        ══════════════════════════════════════ */}
        {view === "add" && (
          <form className="reports-form-card" onSubmit={handleSubmit}>

            <h3 style={{
              textAlign: "center",
              marginBottom: 32,
              fontWeight: 700,
              color: "#1f2937",
              fontSize: "1.4rem",
            }}>
              Add Sub Parameter
            </h3>

            {/* Section: parent */}
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                margin: "0 0 16px",
              }}>
                Parent Parameter
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 420 }}>
                <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>
                  Parameter *
                </label>
                <select
                  value={parameterId}
                  onChange={(e) => setParameterId(e.target.value)}
                  required
                  style={{ width: "100%" }}
                >
                  <option value="">— Select Parameter —</option>
                  {parameters.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "2px solid #f3f4f6", margin: "0 0 28px" }} />

            {/* Section: details */}
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                margin: "0 0 16px",
              }}>
                Sub-Parameter Details
              </p>

              <div className="reports-form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. RBC_1"
                    required
                    style={{ width: "100%", fontFamily: "'Courier New', monospace" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. RBC Morphology"
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "2px solid #f3f4f6", margin: "0 0 28px" }} />

            {/* Section: status */}
            <div style={{ marginBottom: 0 }}>
              <p style={{
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                margin: "0 0 16px",
              }}>
                Status
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: `2px solid ${isActive ? "#10b981" : "#e5e7eb"}`,
                    background: isActive ? "#ecfdf5" : "#f9fafb",
                    color: isActive ? "#065f46" : "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isActive
                    ? <ToggleRight size={20} style={{ color: "#10b981" }} />
                    : <ToggleLeft size={20} style={{ color: "#9ca3af" }} />}
                  {isActive ? "Active" : "Inactive"}
                </button>
                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                  Click to toggle active status
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="reports-button-group">
              <button
                type="button"
                className="btn-report btn-secondary"
                onClick={() => { resetForm(); setView("list"); }}
              >
                <ArrowLeft size={16} /> Cancel
              </button>

              <button
                type="submit"
                className="btn-report btn-success"
                disabled={loading}
              >
                {loading
                  ? <><span style={{ opacity: 0.7 }}>Saving…</span></>
                  : <><Plus size={16} /> Save Sub Parameter</>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}