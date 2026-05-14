import React, { useEffect, useState } from "react";
import { Beaker, CheckCircle, AlertCircle, Plus, X, Pencil, Trash2, FlaskConical, ChevronDown } from "lucide-react";
import { apiRequest } from "../reusable";
import Swal from "sweetalert2";

// ─── Design tokens (from Reports.scss) ──────────────────────────────────────
const T = {
  grad:    "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  green:   "linear-gradient(135deg,#10b981 0%,#059669 100%)",
  red:     "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)",
  blue:    "linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)",
  shadow:  "0 8px 32px rgba(0,0,0,.13)",
  radius:  20,
  font:    "'DM Sans','Segoe UI',sans-serif",
};

// ─── Reusable style helpers ──────────────────────────────────────────────────
const field = {
  wrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: "0.78rem", fontWeight: 700, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.6px",
  },
  input: {
    padding: "12px 16px", border: "2px solid #e5e7eb",
    borderRadius: 12, fontSize: "0.95rem", fontWeight: 500,
    color: "#1f2937", background: "#f9fafb",
    transition: "border-color .2s,box-shadow .2s",
    fontFamily: T.font, width: "100%", boxSizing: "border-box",
  },
  hint: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 },
};

const focusOn  = e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background = "white"; };
const focusOff = e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = ""; e.target.style.background = "#f9fafb"; };

// ─── Component ───────────────────────────────────────────────────────────────
export default function AddParameterPage() {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [message, setMessage]       = useState("");
  const [messageType, setMessageType] = useState("");

  const [code, setCode]       = useState("");
  const [name, setName]       = useState("");
  const [category, setCategory] = useState("BIOCHEMISTRY");
  const [unit, setUnit]       = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId]   = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchParameters = async () => {
    try {
      const res = await apiRequest("get", "/api/parameter");
      setParameters(res?.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchParameters(); }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleEdit = (p) => {
    setEditId(p._id); setCode(p.code); setName(p.name);
    setCategory(p.category); setUnit(p.unit);
    setIsEditing(true); setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Parameter?", text: "This action cannot be undone",
      icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      await apiRequest("delete", `api/parameter/${id}`);
      Swal.fire("Deleted!", "Parameter removed.", "success");
      fetchParameters();
    } catch { Swal.fire("Error", "Failed to delete", "error"); }
  };

  const resetForm = () => {
    setCode(""); setName(""); setCategory("BIOCHEMISTRY");
    setUnit(""); setIsEditing(false); setEditId(null);
  };

  const closeModal = () => { setShowModal(false); resetForm(); setMessage(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setMessageType("");
    const payload = { code, name, category, type: "NUMERIC", unit };
    try {
      if (isEditing) {
        await apiRequest("put", `api/parameter/${editId}`, payload);
        setMessage("Parameter updated successfully!");
      } else {
        await apiRequest("post", "api/parameter/add", payload);
        setMessage("Parameter added successfully!");
      }
      setMessageType("success");
      closeModal();
      fetchParameters();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage(isEditing ? "Failed to update parameter" : "Failed to add parameter");
      setMessageType("error");
    } finally { setLoading(false); }
  };

  // ── Category badge colors ──────────────────────────────────────────────────
  const catColor = {
    BIOCHEMISTRY: ["#eff6ff","#3b82f6","#dbeafe"],
    HEMATOLOGY:   ["#fdf2f8","#ec4899","#fbcfe8"],
    IMMUNOLOGY:   ["#f0fdf4","#16a34a","#bbf7d0"],
    MICROBIOLOGY: ["#fff7ed","#ea580c","#fed7aa"],
    SEROLOGY:     ["#faf5ff","#7c3aed","#e9d5ff"],
  };
  const catStyle = (cat) => {
    const [bg, color, border] = catColor[cat] || ["#f3f4f6","#6b7280","#e5e7eb"];
    return { background: bg, color, border: `1px solid ${border}`,
      padding: "3px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
      display: "inline-block" };
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: T.grad,
      padding: "90px 20px 40px 310px",
      fontFamily: T.font,
      position: "relative", overflow: "hidden",
    }}>
      {/* bg blobs */}
      {[{ top:"-20%", right:"-8%", w:560 }, { bottom:"-20%", left:"-8%", w:480 }].map((b,i) => (
        <div key={i} style={{
          position:"absolute", width:b.w, height:b.w,
          top:b.top, right:b.right, bottom:b.bottom, left:b.left,
          background:"rgba(255,255,255,.09)", borderRadius:"50%",
          filter:"blur(70px)", pointerEvents:"none",
        }} />
      ))}

      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{
          background:"rgba(255,255,255,.97)", backdropFilter:"blur(12px)",
          borderRadius:T.radius, padding:"22px 32px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          boxShadow:T.shadow, gap:16, flexWrap:"wrap",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:46, height:46, borderRadius:13, background:T.grad,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 14px rgba(102,126,234,.4)",
            }}>
              <FlaskConical size={22} color="white" />
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:"1.45rem", fontWeight:800, color:"#1f2937", letterSpacing:"-0.5px" }}>
                Lab Parameters
              </h2>
              <p style={{ margin:0, fontSize:"0.8rem", color:"#9ca3af", fontWeight:500, marginTop:2 }}>
                Manage laboratory test parameters and reference ranges
              </p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"11px 22px", borderRadius:12, border:"none",
              background:T.grad, color:"white", fontSize:"0.9rem", fontWeight:700,
              cursor:"pointer", boxShadow:"0 4px 12px rgba(102,126,234,.4)",
              transition:"transform .15s,box-shadow .15s", fontFamily:T.font,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(102,126,234,.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 12px rgba(102,126,234,.4)"; }}
          >
            <Plus size={16} /> Add Parameter
          </button>
        </div>

        {/* ── Toast message ─────────────────────────────────────────────── */}
        {message && !showModal && (
          <div style={{
            padding:"14px 20px", borderRadius:14,
            display:"flex", alignItems:"center", gap:12,
            background: messageType === "success" ? T.green : T.red,
            color:"white", fontWeight:600, boxShadow:T.shadow,
            animation:"fadeInDown .3s ease",
          }}>
            {messageType === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
            {message}
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div style={{ background:"rgba(255,255,255,.97)", borderRadius:T.radius, overflow:"hidden", boxShadow:T.shadow }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:T.grad }}>
                {["Code","Parameter Name","Unit","Actions"].map(h => (
                  <th key={h} style={{
                    padding:"15px 18px", textAlign:"left",
                    fontSize:"0.78rem", fontWeight:700, color:"white",
                    textTransform:"uppercase", letterSpacing:"0.6px", whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parameters.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding:"56px 24px", textAlign:"center" }}>
                    <div style={{
                      width:56, height:56, borderRadius:"50%", background:"#f3f4f6",
                      display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px",
                    }}>
                      <FlaskConical size={26} color="#d1d5db" />
                    </div>
                    <p style={{ margin:0, color:"#9ca3af", fontWeight:500 }}>
                      No parameters yet — click <strong>Add Parameter</strong> to get started.
                    </p>
                  </td>
                </tr>
              ) : parameters.map((p, i) => (
                <tr key={p._id || i} style={{
                  background: i % 2 === 0 ? "white" : "#fafafa",
                  borderBottom:"1px solid #f3f4f6", transition:"background .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background="#f5f3ff"}
                  onMouseLeave={e => e.currentTarget.style.background= i % 2 === 0 ? "white" : "#fafafa"}
                >
                  <td style={{ padding:"16px 18px" }}>
                    <span style={{
                      fontWeight:800, color:"#667eea",
                      fontFamily:"'DM Mono','Courier New',monospace", fontSize:"0.9rem",
                      background:"#f0edff", padding:"4px 10px", borderRadius:8,
                      border:"1px solid #e0d9ff",
                    }}>{p.code}</span>
                  </td>
                  <td style={{ padding:"16px 18px", fontWeight:600, color:"#1f2937", fontSize:"0.92rem" }}>{p.name}</td>
                  
                  <td style={{ padding:"16px 18px" }}>
                    <span style={{
                      background:"#f0fdf4", color:"#16a34a",
                      border:"1px solid #bbf7d0",
                      padding:"3px 10px", borderRadius:20,
                      fontSize:"0.82rem", fontWeight:600, display:"inline-block",
                    }}>{p.unit}</span>
                  </td>
                  <td style={{ padding:"16px 18px" }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:6,
                          padding:"7px 14px", borderRadius:8, border:"none",
                          background:"#eff6ff", color:"#3b82f6",
                          fontSize:"0.82rem", fontWeight:600, cursor:"pointer",
                          fontFamily:T.font, transition:"background .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background="#dbeafe"}
                        onMouseLeave={e => e.currentTarget.style.background="#eff6ff"}
                      >
                        <Pencil size={13}/> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:6,
                          padding:"7px 14px", borderRadius:8, border:"none",
                          background:"#fef2f2", color:"#ef4444",
                          fontSize:"0.82rem", fontWeight:600, cursor:"pointer",
                          fontFamily:T.font, transition:"background .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
                        onMouseLeave={e => e.currentTarget.style.background="#fef2f2"}
                      >
                        <Trash2 size={13}/> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position:"fixed", inset:0,
          background:"rgba(15,10,30,.55)", backdropFilter:"blur(6px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:1000, padding:20,
        }}>
          <div style={{
            background:"white", borderRadius:24,
            width:"100%", maxWidth:520,
            boxShadow:"0 30px 80px rgba(0,0,0,.3)",
            overflow:"hidden", fontFamily:T.font,
            animation:"fadeInUp .25s ease",
          }}>
            {/* Modal header stripe */}
            <div style={{
              background:T.grad, padding:"22px 28px",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:38, height:38, borderRadius:10,
                  background:"rgba(255,255,255,.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {isEditing ? <Pencil size={18} color="white"/> : <Plus size={18} color="white"/>}
                </div>
                <div>
                  <h3 style={{ margin:0, color:"white", fontSize:"1.1rem", fontWeight:800 }}>
                    {isEditing ? "Edit Parameter" : "Add New Parameter"}
                  </h3>
                  <p style={{ margin:0, color:"rgba(255,255,255,.7)", fontSize:"0.78rem" }}>
                    {isEditing ? "Update the parameter details below" : "Fill in the details to create a parameter"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background:"rgba(255,255,255,.2)", border:"none",
                  width:34, height:34, borderRadius:8,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.35)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.2)"}
              >
                <X size={18} color="white"/>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} style={{ padding:"28px 28px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px 20px" }}>

                {/* Code */}
                <div style={{ ...field.wrap, gridColumn: isEditing ? "span 1" : "span 1" }}>
                  <label style={field.label}>Parameter Code *</label>
                  <input
                    type="text" value={code} disabled={isEditing}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g., GLU, HGB"
                    style={{ ...field.input, ...(isEditing ? { opacity:.6, cursor:"not-allowed" } : {}) }}
                    onFocus={focusOn} onBlur={focusOff}
                  />
                  <span style={field.hint}>Short unique identifier (max 10 chars)</span>
                </div>

                {/* Name */}
                <div style={field.wrap}>
                  <label style={field.label}>Parameter Name *</label>
                  <input
                    type="text" value={name} required
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Glucose, Hemoglobin"
                    style={field.input}
                    onFocus={focusOn} onBlur={focusOff}
                  />
                </div>

                {/* Category */}
                <div style={{ ...field.wrap, position:"relative", display: "none" }}>
                  <label style={field.label}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    style={{ ...field.input, appearance:"none", paddingRight:40, cursor:"pointer" }}
                    onFocus={focusOn} onBlur={focusOff}
                  >
                    {["BIOCHEMISTRY","HEMATOLOGY","IMMUNOLOGY","MICROBIOLOGY","SEROLOGY"].map(c => (
                      <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position:"absolute", right:14, bottom:14, color:"#9ca3af", pointerEvents:"none" }}/>
                </div>

                {/* Type (fixed) */}
                <div style={{ ...field.wrap, display: "none" }}>
                  <label style={field.label}>Type</label>
                  <div style={{ position:"relative" }}>
                    <input type="text" value="NUMERIC" disabled
                      style={{ ...field.input, opacity:.6, cursor:"not-allowed" }}
                    />
                    <span style={{
                      position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                      background:"#e0e7ff", color:"#4f46e5",
                      padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700,
                      border:"1px solid #c7d2fe",
                    }}>Fixed</span>
                  </div>
                </div>

                {/* Unit */}
                <div style={{ ...field.wrap }}>
                  <label style={field.label}>Unit of Measurement *</label>
                  <input
                    type="text" value={unit} required
                    onChange={e => setUnit(e.target.value)}
                    placeholder="e.g., mg/dL, g/dL, cells/µL"
                    style={field.input}
                    onFocus={focusOn} onBlur={focusOff}
                  />
                  <span style={field.hint}>Standard unit used for reporting results</span>
                </div>
              </div>

              {/* Modal message */}
              {message && showModal && (
                <div style={{
                  marginTop:16, padding:"12px 18px", borderRadius:12,
                  display:"flex", alignItems:"center", gap:10,
                  background: messageType === "success" ? T.green : T.red,
                  color:"white", fontWeight:600, fontSize:"0.88rem",
                }}>
                  {messageType === "success" ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                  {message}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display:"flex", gap:12, marginTop:22 }}>
                <button type="button" onClick={closeModal}
                  style={{
                    flex:1, padding:"12px", borderRadius:12, border:"2px solid #e5e7eb",
                    background:"white", color:"#374151", fontSize:"0.92rem", fontWeight:600,
                    cursor:"pointer", fontFamily:T.font, transition:"background .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background="white"}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  style={{
                    flex:1, padding:"12px", borderRadius:12, border:"none",
                    background: loading ? "#d1d5db" : T.green,
                    color:"white", fontSize:"0.92rem", fontWeight:700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    fontFamily:T.font, boxShadow:"0 4px 12px rgba(16,185,129,.35)",
                    transition:"transform .15s,box-shadow .15s",
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(16,185,129,.45)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 12px rgba(16,185,129,.35)"; }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width:17, height:17, border:"2px solid white",
                        borderTopColor:"transparent", borderRadius:"50%",
                        animation:"spin .6s linear infinite",
                      }}/>
                      Saving…
                    </>
                  ) : (
                    <><CheckCircle size={17}/> {isEditing ? "Update Parameter" : "Add Parameter"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInUp   { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}