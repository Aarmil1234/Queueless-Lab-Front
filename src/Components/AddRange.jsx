import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import { Plus, ArrowLeft, Settings, Pencil, Trash2, ChevronDown, Sliders } from "lucide-react";

// ─── Inline styles (mirrors your SCSS tokens, no extra file needed) ─────────
const css = {
  // wrapper + container
  wrapper: {
    minHeight: "100vh",
    padding: "90px 20px 40px 310px",
    background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute", top: "-20%", right: "-8%",
    width: 560, height: 560,
    background: "rgba(255,255,255,.10)", borderRadius: "50%",
    filter: "blur(70px)", pointerEvents: "none",
  },
  blob2: {
    position: "absolute", bottom: "-20%", left: "-8%",
    width: 480, height: 480,
    background: "rgba(255,255,255,.07)", borderRadius: "50%",
    filter: "blur(70px)", pointerEvents: "none",
  },
  container: {
    position: "relative", zIndex: 1,
    maxWidth: 1200, margin: "0 auto",
    display: "flex", flexDirection: "column", gap: 24,
  },

  // header
  header: {
    background: "rgba(255,255,255,.97)",
    backdropFilter: "blur(12px)",
    borderRadius: 20,
    padding: "22px 32px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 8px 32px rgba(0,0,0,.14)",
    gap: 16, flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex", alignItems: "center", gap: 12,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102,126,234,.4)",
  },
  h2: {
    margin: 0, fontSize: "1.45rem", fontWeight: 800,
    color: "#1f2937", letterSpacing: "-0.5px",
    fontFamily: "'DM Sans', sans-serif",
  },
  h2Sub: {
    fontSize: "0.8rem", color: "#9ca3af", fontWeight: 500, marginTop: 1,
  },

  // card (used for filter bar + form)
  card: {
    background: "rgba(255,255,255,.97)",
    borderRadius: 20,
    padding: "28px 32px",
    boxShadow: "0 8px 32px rgba(0,0,0,.13)",
  },

  // filter bar
  filterRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  selectWrap: {
    position: "relative",
  },
  selectLabel: {
    display: "block", fontSize: "0.78rem", fontWeight: 700,
    color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px",
    marginBottom: 8,
  },
  select: {
    width: "100%", padding: "12px 42px 12px 16px",
    border: "2px solid #e5e7eb", borderRadius: 12,
    fontSize: "0.95rem", fontWeight: 500, color: "#1f2937",
    background: "#f9fafb",
    appearance: "none",
    cursor: "pointer",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "inherit",
  },
  chevron: {
    position: "absolute", right: 14, bottom: 14,
    pointerEvents: "none", color: "#9ca3af",
  },

  // table
  tableWrap: {
    background: "rgba(255,255,255,.97)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,.13)",
  },
  thead: {
    background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  },
  th: {
    padding: "15px 18px", textAlign: "left",
    fontSize: "0.78rem", fontWeight: 700, color: "white",
    textTransform: "uppercase", letterSpacing: "0.6px",
    whiteSpace: "nowrap",
  },
  tr: (i) => ({
    background: i % 2 === 0 ? "white" : "#fafafa",
    borderBottom: "1px solid #f3f4f6",
    transition: "background .15s",
  }),
  td: {
    padding: "16px 18px", color: "#374151", fontSize: "0.9rem",
  },
  tdNum: {
    fontWeight: 700, color: "#667eea",
    fontFamily: "'DM Mono', 'Courier New', monospace",
  },
  tdBold: { fontWeight: 600, color: "#1f2937" },

  // gender badge
  badge: (g) => ({
    display: "inline-flex", alignItems: "center",
    padding: "3px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
    background: g === "MALE" ? "#eff6ff" : g === "FEMALE" ? "#fdf2f8" : "#f3f4f6",
    color: g === "MALE" ? "#3b82f6" : g === "FEMALE" ? "#ec4899" : "#6b7280",
    border: `1px solid ${g === "MALE" ? "#bfdbfe" : g === "FEMALE" ? "#fbcfe8" : "#e5e7eb"}`,
  }),

  // range pill
  agePill: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#f0fdf4", color: "#16a34a",
    border: "1px solid #bbf7d0",
    padding: "3px 10px", borderRadius: 20,
    fontSize: "0.82rem", fontWeight: 600,
  },
  valPill: {
    display: "inline-block",
    background: "#faf5ff", color: "#7c3aed",
    border: "1px solid #e9d5ff",
    padding: "3px 10px", borderRadius: 20,
    fontSize: "0.82rem", fontWeight: 600,
  },

  // action buttons (table row)
  btnEdit: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8, border: "none",
    background: "#eff6ff", color: "#3b82f6",
    fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
    transition: "background .15s",
    fontFamily: "inherit",
  },
  btnDel: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8, border: "none",
    background: "#fef2f2", color: "#ef4444",
    fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
    transition: "background .15s",
    fontFamily: "inherit",
  },

  // primary button (header)
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 22px", borderRadius: 12, border: "none",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "white", fontSize: "0.9rem", fontWeight: 700,
    cursor: "pointer", boxShadow: "0 4px 12px rgba(102,126,234,.4)",
    transition: "transform .15s, box-shadow .15s",
    fontFamily: "inherit",
  },
  btnBack: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 22px", borderRadius: 12, border: "2px solid #e5e7eb",
    background: "white", color: "#374151",
    fontSize: "0.9rem", fontWeight: 600,
    cursor: "pointer", transition: "background .15s",
    fontFamily: "inherit",
  },

  // form
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "20px 24px",
  },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: "0.78rem", fontWeight: 700, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.6px",
  },
  input: {
    padding: "12px 16px", border: "2px solid #e5e7eb",
    borderRadius: 12, fontSize: "0.95rem", fontWeight: 500,
    color: "#1f2937", background: "#f9fafb",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "inherit",
  },
  formTitle: {
    margin: "0 0 24px", fontSize: "1.15rem", fontWeight: 800,
    color: "#1f2937", display: "flex", alignItems: "center", gap: 8,
  },
  formDivider: {
    height: 2, background: "linear-gradient(90deg,#667eea,#764ba2)",
    borderRadius: 2, marginBottom: 28, border: "none",
  },
  btnSubmit: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 30px", borderRadius: 12, border: "none",
    background: "linear-gradient(135deg,#10b981,#059669)",
    color: "white", fontSize: "0.95rem", fontWeight: 700,
    cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,.35)",
    transition: "transform .15s, box-shadow .15s",
    fontFamily: "inherit",
    gridColumn: "span 2", justifySelf: "end", marginTop: 8,
  },

  // empty state
  empty: {
    textAlign: "center", padding: "48px 24px",
    color: "#9ca3af", fontSize: "0.95rem", fontWeight: 500,
  },
  emptyIcon: {
    width: 56, height: 56, borderRadius: "50%",
    background: "#f3f4f6",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 14px",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
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
  const [loading, setLoading] = useState(false);

  // ── fetch helpers ──────────────────────────────────────────────────────────
  const fetchParameters = async () => {
    try {
      const res = await apiRequest("get", "/api/parameter/");
      setParameters(res?.data?.data || res?.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchSubParameters = async (id) => {
    try {
      const res = await apiRequest("get", `/api/parameter/subCategory/${id}`);
      const data = res?.data?.data || res?.data || [];
      setSubParameters(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchRanges = async (paramId, subId) => {
    if (!paramId || !subId) return;
    setLoading(true);
    try {
      const res = await apiRequest(
        "get",
        `/api/parameter/defaultParameter/${paramId}/subcategory/${subId}`
      );
      let data = [];
      if (Array.isArray(res?.data)) data = res.data;
      else if (Array.isArray(res?.data?.data)) data = res.data.data;
      else if (Array.isArray(res?.data?.data?.data)) data = res.data.data.data;
      setRanges(data);
    } catch (err) {
      if (err?.response?.status === 404) setRanges([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchParameters(); }, []);
  useEffect(() => {
    if (parameterId && subParameterId) fetchRanges(parameterId, subParameterId);
  }, [parameterId, subParameterId]);

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleParameterChange = (e) => {
    const id = e.target.value;
    setParameterId(id); setSubParameterId(""); setRanges([]);
    if (id) fetchSubParameters(id); else setSubParameters([]);
  };

  const handleEdit = async (r) => {
  setIsEditing(true);
  setEditId(r._id);
  setView("add");

  // ✅ Set basic fields
  setParameterId(r.parameterId || "");

  // 🔥 Load sub parameters first
  if (r.parameterId) {
    const res = await apiRequest(
      "get",
      `/api/parameter/subCategory/${r.parameterId}`
    );

    const data = res?.data?.data || res?.data || [];
    setSubParameters(Array.isArray(data) ? data : []);

    // ✅ Set after loading
    setSubParameterId(r.subCategoryId || "");
  }

  // ✅ VERY IMPORTANT (this was missing)
  setGender(r.gender || "ANY");
  setAgeFrom(r.ageFrom ?? "");
  setAgeTo(r.ageTo ?? "");
  setMinValue(r.minValue ?? "");
  setMaxValue(r.maxValue ?? "");
  setAgeType(r.ageType || "year");
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this range?")) return;
    try {
      await apiRequest("delete", `/api/parameter/defaultParameter/${id}`);
      fetchRanges(parameterId, subParameterId);
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setIsEditing(false); setEditId(null);
    setGender("ANY"); setAgeFrom(""); setAgeTo("");
    setMinValue(""); setMaxValue(""); setAgeType("year");
  };

  const handleBack = () => { setView("list"); resetForm(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parameterId || !subParameterId) {
      alert("Select parameter & sub parameter"); return;
    }
    const payload = {
      parameterId, subCategoryId: subParameterId,
      gender,
      ageFrom: Number(ageFrom),
      ageTo: ageTo ? Number(ageTo) : null,
      minValue: Number(minValue),
      maxValue: Number(maxValue),
      ageType,
    };
    try {
      if (isEditing) {
        await apiRequest("put", `/api/parameter/defaultParameter/${editId}`, payload);
      } else {
        await apiRequest("post", "/api/parameter/defaultParameter/add", payload);
      }
      setView("list"); resetForm();
      fetchRanges(parameterId, subParameterId);
    } catch (err) { console.error(err); }
  };

  const getLabel = (item) =>
    `${item?.name || item?.subParameterName} (${item?.code || item?.subParameterCode})`;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={css.wrapper}>
      <div style={css.blob1} /><div style={css.blob2} />
      <div style={css.container}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={css.header}>
          <div style={css.headerLeft}>
            <div style={css.iconBox}>
              <Sliders size={20} color="white" />
            </div>
            <div>
              <h2 style={css.h2}>Parameter Range Manager</h2>
              <p style={css.h2Sub}>Define normal reference ranges per demographic</p>
            </div>
          </div>

          {view === "list" ? (
            <button
              style={css.btnPrimary}
              onClick={() => { resetForm(); setView("add"); }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(102,126,234,.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 12px rgba(102,126,234,.4)"; }}
            >
              <Plus size={16} /> Add Range
            </button>
          ) : (
            <button
              style={css.btnBack}
              onClick={handleBack}
              onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* ── List view ───────────────────────────────────────────────────── */}
        {view === "list" && (
          <>
            {/* Filter bar */}
            <div style={css.card}>
              <div style={css.filterRow}>
                <div style={css.selectWrap}>
                  <span style={css.selectLabel}>Parameter</span>
                  <select
                    value={parameterId}
                    onChange={handleParameterChange}
                    style={css.select}
                    onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; }}
                    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; }}
                  >
                    <option value="">Select Parameter…</option>
                    {parameters.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={css.chevron} />
                </div>

                <div style={css.selectWrap}>
                  <span style={css.selectLabel}>Sub Parameter</span>
                  <select
                    value={subParameterId}
                    onChange={e => setSubParameterId(e.target.value)}
                    disabled={!parameterId}
                    style={{ ...css.select, ...(parameterId ? {} : { opacity: 0.5, cursor: "not-allowed" }) }}
                    onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; }}
                    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; }}
                  >
                    <option value="">Select Sub Parameter…</option>
                    {subParameters.map((sp) => (
                      <option key={sp._id} value={sp._id}>{getLabel(sp)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={css.chevron} />
                </div>
              </div>
            </div>

            {/* Table or empty state */}
            {subParameterId && (
              <div style={css.tableWrap}>
                {loading ? (
                  <div style={css.empty}>Loading ranges…</div>
                ) : Array.isArray(ranges) && ranges.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={css.thead}>
                      <tr>
                        {["#", "Gender", "Age Range", "Min Value", "Max Value", "Actions"].map(h => (
                          <th key={h} style={css.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ranges.map((r, i) => (
                        <tr key={r._id} style={css.tr(i)}>
                          <td style={{ ...css.td, ...css.tdNum }}>{String(i + 1).padStart(2, "0")}</td>
                          <td style={css.td}>
                            <span style={css.badge(r.gender)}>{r.gender || "ANY"}</span>
                          </td>
                          <td style={css.td}>
                            <span style={css.agePill}>
                              {r.ageFrom} – {r.ageTo ?? "∞"} {r.ageType || "yrs"}
                            </span>
                          </td>
                          <td style={css.td}><span style={css.valPill}>{r.minValue}</span></td>
                          <td style={css.td}><span style={css.valPill}>{r.maxValue}</span></td>
                          <td style={{ ...css.td, display: "flex", gap: 8 }}>
                            <button
                              style={css.btnEdit}
                              onClick={() => handleEdit(r)}
                              onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
                              onMouseLeave={e => e.currentTarget.style.background = "#eff6ff"}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              style={css.btnDel}
                              onClick={() => handleDelete(r._id)}
                              onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                              onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={css.empty}>
                    <div style={css.emptyIcon}>
                      <Sliders size={24} color="#d1d5db" />
                    </div>
                    No ranges found for this selection
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Add / Edit form ─────────────────────────────────────────────── */}
        {view === "add" && (
          <div style={css.card}>
            <h3 style={css.formTitle}>
              <span style={{ ...css.iconBox, width: 34, height: 34, borderRadius: 9 }}>
                {isEditing ? <Pencil size={16} color="white" /> : <Plus size={16} color="white" />}
              </span>
              {isEditing ? "Edit Range" : "Add New Range"}
            </h3>
            <hr style={css.formDivider} />

            <form onSubmit={handleSubmit}>
              <div style={css.formGrid}>

                {/* Parameter */}
                <div style={css.fieldWrap}>
                  <label style={css.label}>Parameter *</label>
                  <div style={css.selectWrap}>
                    <select value={parameterId} onChange={handleParameterChange} required
                      style={css.select}
                      onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; }}
                    >
                      <option value="">Select Parameter…</option>
                      {parameters.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <ChevronDown size={16} style={css.chevron} />
                  </div>
                </div>

                {/* Sub Parameter */}
                <div style={css.fieldWrap}>
                  <label style={css.label}>Sub Parameter *</label>
                  <div style={css.selectWrap}>
                    <select value={subParameterId} onChange={e => setSubParameterId(e.target.value)} required
                      style={css.select}
                      onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; }}
                    >
                      <option value="">Select Sub Parameter…</option>
                      {subParameters.map(sp => <option key={sp._id} value={sp._id}>{getLabel(sp)}</option>)}
                    </select>
                    <ChevronDown size={16} style={css.chevron} />
                  </div>
                </div>

                {/* Gender */}
                <div style={css.fieldWrap}>
                  <label style={css.label}>Gender</label>
                  <div style={css.selectWrap}>
                    <select value={gender} onChange={e => setGender(e.target.value)}
                      style={css.select}
                      onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; }}
                    >
                      <option value="ANY">Any</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                    <ChevronDown size={16} style={css.chevron} />
                  </div>
                </div>

                {/* Age type */}
                <div style={css.fieldWrap}>
                  <label style={css.label}>Age Unit</label>
                  <div style={css.selectWrap}>
                    <select value={ageType} onChange={e => setAgeType(e.target.value)}
                      style={css.select}
                      onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; }}
                    >
                      <option value="year">Year</option>
                      <option value="month">Month</option>
                      <option value="day">Day</option>
                    </select>
                    <ChevronDown size={16} style={css.chevron} />
                  </div>
                </div>

                {[
                  { label: "Age From *", val: ageFrom, set: setAgeFrom, req: true },
                  { label: "Age To", val: ageTo, set: setAgeTo, req: false },
                  { label: "Min Value *", val: minValue, set: setMinValue, req: true },
                  { label: "Max Value *", val: maxValue, set: setMaxValue, req: true },
                ].map(({ label, val, set, req }) => (
                  <div key={label} style={css.fieldWrap}>
                    <label style={css.label}>{label}</label>
                    <input
                      type="number"
                      placeholder={`Enter ${label.replace(" *", "").toLowerCase()}`}
                      value={val}
                      onChange={e => set(e.target.value)}
                      required={req}
                      style={css.input}
                      onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; }}
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  style={css.btnSubmit}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(16,185,129,.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,.35)"; }}
                >
                  {isEditing ? <><Pencil size={16} /> Update Range</> : <><Plus size={16} /> Save Range</>}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}