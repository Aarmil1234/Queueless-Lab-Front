import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import {
  Plus,
  ArrowLeft,
  Settings,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import "../Scss/Reports.scss";

export default function SubParameterManager() {
  const [view, setView] = useState("list");

  const [parameters, setParameters] = useState([]);
  const [parameterId, setParameterId] = useState("");
  const [subParams, setSubParams] = useState([]);

  // form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ===============================
  // FETCH PARAMETERS
  // ===============================
  const fetchParameters = async () => {
    try {
      const res = await apiRequest("get", "/api/parameter/");
      setParameters(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // FETCH SUB PARAMETERS
  // ===============================
  const fetchSubParams = async (id) => {
    try {
      const res = await apiRequest(
        "get",
        `/api/parameter/subCategory/${id}`
      );
      setSubParams(res?.data || []);
    } catch (err) {
      console.error(err);
      setSubParams([]);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const handleParameterChange = (e) => {
    const id = e.target.value;
    setParameterId(id);
    if (id) fetchSubParams(id);
    else setSubParams([]);
  };

  // ===============================
  // ADD SUB PARAMETER
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!parameterId || !code || !name) {
      setMessage("All fields required");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("post", "/api/parameter/subCategory/add", {
        parameterId,
        code,
        name,
        isActive
      });

      setMessage("Sub parameter added");
      setMessageType("success");

      setCode("");
      setName("");
      setIsActive(true);

      setView("list");
      fetchSubParams(parameterId);

    } catch (err) {
      console.error(err);
      setMessage("Failed to add");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub parameter?")) return;

    try {
      await apiRequest("delete", `/api/parameter/subCategory/${id}`);
      setMessage("Deleted successfully");
      setMessageType("success");
      fetchSubParams(parameterId);
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
      setMessageType("error");
    }
  };

  // auto hide
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  return (
    <div className="reports-wrapper">
      <div className="reports-container">

        {/* HEADER */}
        <div className="reports-header">
          <h2>
            <Settings size={28} />
            Sub Parameter Manager
          </h2>

          {view === "list" && (
            <button
              className="btn-report btn-primary"
              onClick={() => setView("add")}
            >
              <Plus size={18} /> Add Sub Parameter
            </button>
          )}

          {view === "add" && (
            <button
              className="btn-report btn-secondary"
              onClick={() => setView("list")}
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            marginBottom: "20px",
            padding: "12px",
            borderRadius: "10px",
            background: messageType === "success" ? "#10b981" : "#ef4444",
            color: "#fff"
          }}>
            {message}
          </div>
        )}

        {/* LIST */}
        {view === "list" && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label>Parameter</label>
              <select
                value={parameterId}
                onChange={handleParameterChange}
              >
                <option value="">-- Select --</option>
                {parameters.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {parameterId && (
              subParams.length > 0 ? (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subParams.map(s => (
                      <tr key={s._id}>
                        <td>{s.code}</td>
                        <td>{s.name}</td>
                        <td>
                          <span className={`status-badge ${s.isActive ? "completed" : "pending"}`}>
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDelete(s._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="reports-form-card">
                  <h3>No Sub Parameters Found</h3>
                </div>
              )
            )}
          </>
        )}

        {/* ADD */}
        {view === "add" && (
          <form className="reports-form-card" onSubmit={handleSubmit}>
            <h3>Add Sub Parameter</h3>

            <div className="reports-form-grid">
              <label>Parameter:</label>
              <select
                value={parameterId}
                onChange={(e) => setParameterId(e.target.value)}
                required
              >
                <option value="">-- Select --</option>
                {parameters.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label>Code:</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. RBC_1"
                required
              />

              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. RBC Morphology"
                required
              />

              <label>Active:</label>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value === "true")}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>

            <div className="reports-button-group">
              <button
                type="button"
                className="btn-report btn-secondary"
                onClick={() => setView("list")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-report btn-success"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}