import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import { Plus, ArrowLeft, Settings, Pencil, Trash2, ChevronDown } from "lucide-react";
import "../Scss/Reports.scss";

export default function ParameterRangeManager() {
  const [view, setView] = useState("list");

  const [parameters, setParameters] = useState([]);
  const [parameterId, setParameterId] = useState("");

  const [subParameters, setSubParameters] = useState([]);
  const [subParameterId, setSubParameterId] = useState("");

  const [ranges, setRanges] = useState([]);

  const [gender, setGender] = useState("ANY");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [ageType, setAgeType] = useState("year");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ================= FETCH =================
  const fetchParameters = async () => {
    const res = await apiRequest("get", "/api/parameter/");
    setParameters(res?.data?.data || res?.data || []);
  };

  const fetchSubParameters = async (id) => {
    const res = await apiRequest("get", `/api/parameter/subCategory/${id}`);
    const data = res?.data?.data || res?.data || [];
    setSubParameters(Array.isArray(data) ? data : []);
  };

  const fetchRanges = async (subId) => {
    const res = await apiRequest("get", `/api/parameter/defaultParameter/${subId}`);
    setRanges(res?.data?.data || res?.data || []);
  };

  useEffect(() => { fetchParameters(); }, []);

  // ================= HANDLERS =================
  const handleParameterChange = (e) => {
    const id = e.target.value;
    setParameterId(id);
    setSubParameterId("");
    setRanges([]);
    if (id) fetchSubParameters(id);
    else setSubParameters([]);
  };

  const handleSubParameterChange = (e) => {
    const id = e.target.value;
    setSubParameterId(id);
    if (id) fetchRanges(id);
    else setRanges([]);
  };

  // ================= EDIT =================
  const handleEdit = (range) => {
    setIsEditing(true);
    setEditId(range._id);
    setView("add");
    setParameterId(range.parameterId);
    setSubParameterId(range.subCategoryId);
    setGender(range.gender || "ANY");
    setAgeFrom(range.ageFrom);
    setAgeTo(range.ageTo || "");
    setMinValue(range.minValue);
    setMaxValue(range.maxValue);
    setAgeType(range.ageType);

    if (range.parameterId) fetchSubParameters(range.parameterId);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this range?")) return;
    await apiRequest("delete", `/api/parameter/defaultParameter/${id}`);
    fetchRanges(subParameterId);
  };

  // ================= RESET =================
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setGender("ANY");
    setAgeFrom("");
    setAgeTo("");
    setMinValue("");
    setMaxValue("");
    setAgeType("year");
  };

  const handleBack = () => {
    setView("list");
    resetForm();
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parameterId || !subParameterId) {
      alert("Select parameter & sub parameter");
      return;
    }

    const payload = {
      parameterId,
      subCategoryId: subParameterId,
      gender,
      ageFrom: Number(ageFrom),
      ageTo: ageTo ? Number(ageTo) : null,
      minValue: Number(minValue),
      maxValue: Number(maxValue),
      ageType,
    };

    if (isEditing) {
      await apiRequest("put", `/api/parameter/defaultParameter/${editId}`, payload);
    } else {
      await apiRequest("post", "/api/parameter/defaultParameter/add", payload);
    }

    setView("list");
    resetForm();
    fetchRanges(subParameterId);
  };

  const getLabel = (item) =>
    `${item.name || item.subParameterName} (${item.code || item.subParameterCode})`;

  const genderBadge = (g) => {
    const map = { MALE: "blue", FEMALE: "pink", ANY: "purple" };
    return (
      <span className={`status-badge ${map[g] || "pending"}`} style={{ textTransform: "capitalize", fontSize: "0.78rem" }}>
        {g}
      </span>
    );
  };

  return (
    <div className="reports-wrapper">
      <div className="reports-container">

        {/* ── HEADER ── */}
        <div className="reports-header">
          <h2>
            <Settings size={22} />
            Parameter Range Manager
          </h2>

          {view === "list" ? (
            <button className="btn-report btn-primary" onClick={() => { resetForm(); setView("add"); }}>
              <Plus size={16} /> Add Range
            </button>
          ) : (
            <button className="btn-report btn-secondary" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* ══════════════════════════════════════
            LIST VIEW
        ══════════════════════════════════════ */}
        {view === "list" && (
          <div className="reports-form-card" style={{ marginBottom: 30 }}>

            {/* Filter row */}
            <div className="reports-form-grid" style={{ marginBottom: ranges.length > 0 ? 30 : 0 }}>

              {/* Parameter select */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "#374151" }}>
                  Parameter
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={parameterId}
                    onChange={handleParameterChange}
                    style={{ width: "100%", paddingRight: 40 }}
                  >
                    <option value="">— Select Parameter —</option>
                    {parameters.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-parameter select */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "#374151" }}>
                  Sub-Parameter
                </label>
                <select
                  value={subParameterId}
                  onChange={handleSubParameterChange}
                  disabled={!parameterId}
                  style={{ width: "100%" }}
                >
                  <option value="">— Select Sub Parameter —</option>
                  {subParameters.map((sp) => (
                    <option key={sp._id} value={sp._id}>
                      {getLabel(sp)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table or empty state */}
            {subParameterId && (
              ranges.length > 0 ? (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Gender</th>
                      <th>Age Range</th>
                      <th>Age Type</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranges.map((r, i) => (
                      <tr key={r._id}>
                        <td style={{ color: "#9ca3af", fontWeight: 400, fontFamily: "inherit" }}>
                          {i + 1}
                        </td>
                        <td>{genderBadge(r.gender)}</td>
                        <td>
                          {r.ageFrom}
                          <span style={{ color: "#9ca3af", margin: "0 4px" }}>–</span>
                          {r.ageTo ?? <span title="No upper limit">∞</span>}
                        </td>
                        <td style={{ textTransform: "capitalize", color: "#6b7280" }}>{r.ageType}</td>
                        <td style={{ fontWeight: 700, color: "#10b981" }}>{r.minValue}</td>
                        <td style={{ fontWeight: 700, color: "#667eea" }}>{r.maxValue}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button
                              className="btn-small btn-report btn-info"
                              onClick={() => handleEdit(r)}
                              title="Edit"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              className="btn-small btn-report btn-danger"
                              onClick={() => handleDelete(r._id)}
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
                  color: "#9ca3af",
                  border: "2px dashed #e5e7eb",
                  borderRadius: 16,
                }}>
                  <Settings size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontWeight: 600, color: "#6b7280" }}>No ranges found</h3>
                  <p style={{ margin: "8px 0 20px", fontSize: "0.9rem" }}>
                    No default ranges have been added for this sub-parameter yet.
                  </p>
                  <button
                    className="btn-report btn-primary"
                    onClick={() => { resetForm(); setView("add"); }}
                  >
                    <Plus size={16} /> Add First Range
                  </button>
                </div>
              )
            )}

            {!subParameterId && !parameterId && (
              <div style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "#d1d5db",
              }}>
                <Settings size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#9ca3af" }}>
                  Select a parameter to view its ranges.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            ADD / EDIT VIEW
        ══════════════════════════════════════ */}
        {view === "add" && (
          <form className="reports-form-card" onSubmit={handleSubmit}>

            <h3 style={{ textAlign: "center", marginBottom: 32, fontWeight: 700, color: "#1f2937", fontSize: "1.4rem" }}>
              {isEditing ? "Edit Range" : "Add New Range"}
            </h3>

            {/* Section: selection */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 16px" }}>
                Parameter
              </p>

              <div className="reports-form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>Parameter *</label>
                  <select value={parameterId} onChange={handleParameterChange} required style={{ width: "100%" }}>
                    <option value="">— Select Parameter —</option>
                    {parameters.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>Sub-Parameter *</label>
                  <select value={subParameterId} onChange={handleSubParameterChange} required disabled={!parameterId} style={{ width: "100%" }}>
                    <option value="">— Select Sub Parameter —</option>
                    {subParameters.map((sp) => (
                      <option key={sp._id} value={sp._id}>{getLabel(sp)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: "none", borderTop: "2px solid #f3f4f6", margin: "0 0 28px" }} />

            {/* Section: patient criteria */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 16px" }}>
                Patient Criteria
              </p>

              <div className="reports-form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: "100%" }}>
                    <option value="ANY">Any</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>Age Type</label>
                  <select value={ageType} onChange={(e) => setAgeType(e.target.value)} style={{ width: "100%" }}>
                    <option value="year">Year</option>
                    <option value="month">Month</option>
                    <option value="day">Day</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>Age From *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 0"
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>
                    Age To
                    <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty for no limit"
                    value={ageTo}
                    onChange={(e) => setAgeTo(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: "none", borderTop: "2px solid #f3f4f6", margin: "0 0 28px" }} />

            {/* Section: reference values */}
            <div style={{ marginBottom: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 16px" }}>
                Reference Values
              </p>

              <div className="reports-form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#10b981" }}>Min Value *</label>
                  <input
                    type="number"
                    placeholder="e.g. 4.0"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    required
                    style={{ width: "100%", borderColor: "#10b981" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#667eea" }}>Max Value *</label>
                  <input
                    type="number"
                    placeholder="e.g. 11.0"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    required
                    style={{ width: "100%", borderColor: "#667eea" }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="reports-button-group">
              <button type="button" className="btn-report btn-secondary" onClick={handleBack}>
                <ArrowLeft size={16} /> Cancel
              </button>
              <button type="submit" className="btn-report btn-success">
                {isEditing ? <><Pencil size={16} /> Update Range</> : <><Plus size={16} /> Save Range</>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}