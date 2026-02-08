import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import {
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowLeft,
  Settings,
  Pencil,
  Trash2,
  Save
} from "lucide-react";
import "../Scss/Reports.scss";

export default function ParameterRangeManager() {
  const [view, setView] = useState("list");

  const [parameters, setParameters] = useState([]);
  const [parameterId, setParameterId] = useState("");
  const [ranges, setRanges] = useState([]);

  // form states
  const [gender, setGender] = useState("ANY");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [ageType, setAgeType] = useState("year");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // EDIT STATES
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ===============================
  // FETCH PARAMETERS
  // ===============================
  const fetchParameters = async () => {
    try {
      const res = await apiRequest("get", "/api/parameter/");
      setParameters(res?.data || []);
    } catch (err) {
      console.error("PARAM FETCH ERROR:", err);
    }
  };

  // ===============================
  // FETCH RANGES
  // ===============================
  const fetchRanges = async (id) => {
    try {
      const res = await apiRequest(
        "get",
        `/api/parameter/defaultParameter/${id}`
      );
      setRanges(res?.data || []);
    } catch (err) {
      console.error("RANGE FETCH ERROR:", err);
      setRanges([]);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const handleParameterChange = (e) => {
    const id = e.target.value;
    setParameterId(id);
    if (id) fetchRanges(id);
    else setRanges([]);
  };

  // ===============================
  // EDIT
  // ===============================
  const handleEdit = (range) => {
    setIsEditing(true);
    setEditId(range._id);
    setView("add");

    setParameterId(range.parameterId);
    setGender(range.gender || "ANY");
    setAgeFrom(range.ageFrom);
    setAgeTo(range.ageTo);
    setMinValue(range.minValue);
    setMaxValue(range.maxValue);
    setAgeType(range.ageType);
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this reference range?\n\nThis action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await apiRequest(
        "delete",
        `/api/parameter/defaultParameter/${id}`
      );

      setMessage("Range deleted successfully");
      setMessageType("success");

      fetchRanges(parameterId);

    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      setMessage("Failed to delete range");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // SUBMIT (ADD + EDIT)
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!parameterId) {
      setMessage("Please select a parameter");
      setMessageType("error");
      return;
    }

    const payload = {
      parameterId,
      ageFrom: Number(ageFrom),
      ageTo: Number(ageTo),
      minValue: Number(minValue),
      maxValue: Number(maxValue),
      ageType,
      ...(gender !== "ANY" && { gender })
    };

    try {
      setLoading(true);

      if (isEditing) {
        await apiRequest(
          "put",
          `/api/parameter/defaultParameter/${editId}`,
          payload
        );
        setMessage("Range updated successfully!");
      } else {
        await apiRequest(
          "post",
          "/api/parameter/defaultParameter/add",
          payload
        );
        setMessage("Range added successfully!");
      }

      setMessageType("success");

      setView("list");
      setIsEditing(false);
      setEditId(null);

      fetchRanges(parameterId);

      // reset form
      setGender("ANY");
      setAgeFrom("");
      setAgeTo("");
      setMinValue("");
      setMaxValue("");
      setAgeType("year");

    } catch (err) {
      console.error("SAVE ERROR:", err);
      setMessage("Failed to save range");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setView("list");
    setIsEditing(false);
    setEditId(null);
    setGender("ANY");
    setAgeFrom("");
    setAgeTo("");
    setMinValue("");
    setMaxValue("");
    setAgeType("year");
  };

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="reports-wrapper">
      <div className="reports-container">

        {/* HEADER */}
        <div className="reports-header">
          <h2>
            <Settings size={28} />
            Parameter Range Manager
          </h2>

          {view === "list" && (
            <button
              className="btn-report btn-primary"
              onClick={() => setView("add")}
            >
              <Plus size={18} /> Add Range
            </button>
          )}

          {view === "add" && (
            <button
              className="btn-report btn-secondary"
              onClick={handleCancelEdit}
            >
              <ArrowLeft size={18} /> Back to List
            </button>
          )}
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            marginBottom: "20px",
            padding: "16px 20px",
            borderRadius: "12px",
            background: messageType === "success" 
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
              : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "white",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            animation: "slideDown 0.4s ease",
            fontWeight: "600"
          }}>
            {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message}
          </div>
        )}

        {/* ===============================
            LIST VIEW
        =============================== */}
        {view === "list" && (
          <>
            {/* PARAMETER DROPDOWN */}
            <div style={{ marginBottom: "30px" }}>
              <div className="reports-form-grid d-flex flex-column align-items-start gap-2">
                <label className="text-white">Parameter:</label>
                <select
                  value={parameterId}
                  onChange={handleParameterChange}
                  style={{width: "300px"}}
                >
                  <option value="">-- Select Parameter --</option>
                  {parameters.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE */}
            {parameterId && (
              ranges.length > 0 ? (
                <div className="reports-table-card">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Gender</th>
                        <th>Age From</th>
                        <th>Age To</th>
                        <th>Age Type</th>
                        <th>Min Value</th>
                        <th>Max Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranges.map((r) => (
                        <tr key={r._id}>
                          <td>
                            <span className={`status-badge ${
                              r.gender === 'MALE' ? 'completed' : 
                              r.gender === 'FEMALE' ? 'pending' : ''
                            }`}>
                              {r.gender || "ANY"}
                            </span>
                          </td>
                          <td>{r.ageFrom}</td>
                          <td>{r.ageTo}</td>
                          <td style={{ textTransform: 'capitalize' }}>{r.ageType}</td>
                          <td style={{ fontWeight: "700", color: "#667eea" }}>{r.minValue}</td>
                          <td style={{ fontWeight: "700", color: "#667eea" }}>{r.maxValue}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                              <button
                                className="btn-small btn-info"
                                onClick={() => handleEdit(r)}
                                title="Edit Range"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                className="btn-small"
                                onClick={() => handleDelete(r._id)}
                                disabled={loading}
                                title="Delete Range"
                                style={{
                                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                  color: "white",
                                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="reports-form-card" style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#6b7280"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>📊</div>
                  <h3 style={{ fontSize: "1.3rem", color: "#374151", marginBottom: "8px" }}>
                    No Ranges Found
                  </h3>
                  <p style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
                    No reference ranges configured for this parameter yet.
                  </p>
                  <button
                    className="btn-report btn-primary"
                    onClick={() => setView("add")}
                  >
                    <Plus size={18} /> Add First Range
                  </button>
                </div>
              )
            )}

            
          </>
        )}

        {/* ===============================
            ADD / EDIT FORM
        =============================== */}
        {view === "add" && (
          <form className="reports-form-card" onSubmit={handleSubmit}>
            <h3>{isEditing ? "Edit Reference Range" : "Add New Reference Range"}</h3>
            <p style={{
              textAlign: "center",
              color: "#6b7280",
              marginBottom: "30px",
              fontSize: "0.95rem"
            }}>
              {isEditing 
                ? "Update the reference range values below" 
                : "Define reference ranges based on gender, age, and parameter values"}
            </p>

            <div className="reports-form-grid">

              {/* PARAMETER DROPDOWN */}
              <label>Parameter:</label>
              <select
                value={parameterId}
                onChange={(e) => setParameterId(e.target.value)}
                required
                disabled={isEditing}
              >
                <option value="">-- Select Parameter --</option>
                {parameters.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>

              {/* GENDER */}
              <label>Gender:</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="ANY">Any (Applies to All)</option>
              </select>

              {/* AGE TYPE */}
              <label>Age Type:</label>
              <select value={ageType} onChange={(e) => setAgeType(e.target.value)}>
                <option value="year">Years</option>
                <option value="month">Months</option>
              </select>

              {/* AGE FROM */}
              <label>Age From:</label>
              <input
                type="number"
                value={ageFrom}
                onChange={(e) => setAgeFrom(e.target.value)}
                placeholder="e.g., 0"
                required
              />

              {/* AGE TO */}
              <label>Age To:</label>
              <input
                type="number"
                value={ageTo}
                onChange={(e) => setAgeTo(e.target.value)}
                placeholder="e.g., 18"
                required
              />

              {/* MIN VALUE */}
              <label>Minimum Value:</label>
              <input
                type="number"
                step="0.01"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="e.g., 12.0"
                required
              />

              {/* MAX VALUE */}
              <label>Maximum Value:</label>
              <input
                type="number"
                step="0.01"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="e.g., 16.0"
                required
              />

            </div>

            <div className="reports-button-group">
              <button
                type="button"
                className="btn-report btn-secondary"
                onClick={handleCancelEdit}
              >
                <ArrowLeft size={18} /> Cancel
              </button>

              <button 
                type="submit" 
                className="btn-report btn-success" 
                disabled={loading}
              >
                {loading ? (
                  "Saving..."
                ) : isEditing ? (
                  <>
                    <Save size={18} /> Update Range
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Save Range
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .btn-small:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-small:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}