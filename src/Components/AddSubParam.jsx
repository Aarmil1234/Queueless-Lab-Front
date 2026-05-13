import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import {
  Plus, ArrowLeft, Trash2, CheckCircle, AlertCircle,
  ToggleLeft, ToggleRight, Layers, ChevronDown, SlidersHorizontal,
} from "lucide-react";

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  grad:   "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  green:  "linear-gradient(135deg,#10b981 0%,#059669 100%)",
  shadow: "0 8px 32px rgba(0,0,0,.13)",
  radius: 20,
  font:   "'DM Sans','Segoe UI',sans-serif",
};

const focusOn  = e => { e.target.style.borderColor="#667eea"; e.target.style.boxShadow="0 0 0 4px rgba(102,126,234,.12)"; e.target.style.background="white"; };
const focusOff = e => { e.target.style.borderColor="#e5e7eb"; e.target.style.boxShadow=""; e.target.style.background="#f9fafb"; };

const fieldBase = {
  padding:"12px 16px", border:"2px solid #e5e7eb", borderRadius:12,
  fontSize:"0.95rem", fontWeight:500, color:"#1f2937", background:"#f9fafb",
  transition:"border-color .2s,box-shadow .2s", fontFamily:T.font,
  width:"100%", boxSizing:"border-box",
};
const labelBase = {
  fontSize:"0.78rem", fontWeight:700, color:"#6b7280",
  textTransform:"uppercase", letterSpacing:"0.6px",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function SubParameterManager() {
  const [view, setView]             = useState("list");
  const [parameters, setParameters] = useState([]);
  const [parameterId, setParameterId] = useState("");
  const [subParams, setSubParams]   = useState([]);

  const [code, setCode]       = useState("");
  const [name, setName]       = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState("");
  const [messageType, setMessageType] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchParameters = async () => {
    try {
      const res = await apiRequest("get", "/api/parameter/");
      setParameters(res?.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchSubParams = async (id) => {
    try {
      const res = await apiRequest("get", `/api/parameter/subCategory/${id}`);
      setSubParams(res?.data || []);
    } catch { setSubParams([]); }
  };

  useEffect(() => { fetchParameters(); }, []);

  const handleParameterChange = (e) => {
    const id = e.target.value;
    setParameterId(id);
    if (id) fetchSubParams(id); else setSubParams([]);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => { setCode(""); setName(""); setIsActive(true); };

  const showMsg = (msg, type) => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => { setMessage(""); setMessageType(""); }, 3500);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parameterId || !code || !name) { showMsg("All fields are required.", "error"); return; }
    try {
      setLoading(true);
      await apiRequest("post", "/api/parameter/subCategory/add", { parameterId, code, name, isActive });
      showMsg("Sub-parameter added successfully.", "success");
      resetForm(); setView("list"); fetchSubParams(parameterId);
    } catch { showMsg("Failed to add sub-parameter.", "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub-parameter?")) return;
    try {
      await apiRequest("delete", `/api/parameter/subCategory/${id}`);
      showMsg("Deleted successfully.", "success");
      fetchSubParams(parameterId);
    } catch { showMsg("Delete failed.", "error"); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh", background:T.grad,
      padding:"90px 20px 40px 310px",
      fontFamily:T.font, position:"relative", overflow:"hidden",
    }}>
      {/* bg blobs */}
      {[{ top:"-20%",right:"-8%",w:560 },{ bottom:"-20%",left:"-8%",w:480 }].map((b,i)=>(
        <div key={i} style={{
          position:"absolute", width:b.w, height:b.w,
          top:b.top,right:b.right,bottom:b.bottom,left:b.left,
          background:"rgba(255,255,255,.09)", borderRadius:"50%",
          filter:"blur(70px)", pointerEvents:"none",
        }}/>
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
              <SlidersHorizontal size={22} color="white"/>
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:"1.45rem", fontWeight:800, color:"#1f2937", letterSpacing:"-0.5px" }}>
                Sub Parameter Manager
              </h2>
              <p style={{ margin:0, fontSize:"0.8rem", color:"#9ca3af", fontWeight:500, marginTop:2 }}>
                Add and manage sub-parameters within lab parameters
              </p>
            </div>
          </div>

          {view === "list" ? (
            <button
              onClick={() => { resetForm(); setView("add"); }}
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"11px 22px", borderRadius:12, border:"none",
                background:T.grad, color:"white", fontSize:"0.9rem", fontWeight:700,
                cursor:"pointer", boxShadow:"0 4px 12px rgba(102,126,234,.4)",
                transition:"transform .15s,box-shadow .15s", fontFamily:T.font,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(102,126,234,.5)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 12px rgba(102,126,234,.4)"; }}
            >
              <Plus size={16}/> Add Sub Parameter
            </button>
          ) : (
            <button
              onClick={() => { resetForm(); setView("list"); }}
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"11px 22px", borderRadius:12, border:"2px solid #e5e7eb",
                background:"white", color:"#374151", fontSize:"0.9rem", fontWeight:600,
                cursor:"pointer", fontFamily:T.font, transition:"background .15s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#f3f4f6"}
              onMouseLeave={e=>e.currentTarget.style.background="white"}
            >
              <ArrowLeft size={16}/> Back
            </button>
          )}
        </div>

        {/* ── Toast ─────────────────────────────────────────────────────── */}
        {message && (
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"13px 20px", borderRadius:14,
            background: messageType==="success"
              ? "linear-gradient(135deg,#10b981,#059669)"
              : "linear-gradient(135deg,#ef4444,#dc2626)",
            color:"white", fontWeight:600, fontSize:"0.9rem",
            boxShadow:T.shadow, animation:"fadeInDown .3s ease",
          }}>
            {messageType==="success" ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
            {message}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LIST VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {view === "list" && (
          <>
            {/* Filter card */}
            <div style={{ background:"rgba(255,255,255,.97)", borderRadius:T.radius, padding:"24px 28px", boxShadow:T.shadow }}>
              <label style={labelBase}>Filter by Parameter</label>
              <div style={{ position:"relative", maxWidth:420, marginTop:8 }}>
                <select
                  value={parameterId}
                  onChange={handleParameterChange}
                  style={{ ...fieldBase, paddingRight:40, appearance:"none", cursor:"pointer" }}
                  onFocus={focusOn} onBlur={focusOff}
                >
                  <option value="">Select Parameter…</option>
                  {parameters.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", pointerEvents:"none" }}/>
              </div>
            </div>

            {/* Table or empty states */}
            {!parameterId ? (
              <div style={{
                background:"rgba(255,255,255,.97)", borderRadius:T.radius,
                padding:"60px 24px", textAlign:"center", boxShadow:T.shadow,
              }}>
                <div style={{
                  width:64, height:64, borderRadius:"50%", background:"#f3f4f6",
                  display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px",
                }}>
                  <Layers size={28} color="#d1d5db"/>
                </div>
                <p style={{ margin:0, color:"#9ca3af", fontWeight:500, fontSize:"0.95rem" }}>
                  Select a parameter above to view its sub-parameters.
                </p>
              </div>
            ) : subParams.length === 0 ? (
              <div style={{
                background:"rgba(255,255,255,.97)", borderRadius:T.radius,
                padding:"60px 24px", textAlign:"center", boxShadow:T.shadow,
                border:"2px dashed #e5e7eb",
              }}>
                <div style={{
                  width:64, height:64, borderRadius:"50%", background:"#f3f4f6",
                  display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px",
                }}>
                  <SlidersHorizontal size={28} color="#d1d5db"/>
                </div>
                <h3 style={{ margin:"0 0 6px", fontWeight:700, color:"#6b7280", fontSize:"1.05rem" }}>
                  No sub-parameters found
                </h3>
                <p style={{ margin:"0 0 20px", fontSize:"0.88rem", color:"#9ca3af" }}>
                  None have been added for this parameter yet.
                </p>
                <button
                  onClick={() => { resetForm(); setView("add"); }}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"10px 22px", borderRadius:12, border:"none",
                    background:T.grad, color:"white", fontSize:"0.88rem", fontWeight:700,
                    cursor:"pointer", boxShadow:"0 4px 12px rgba(102,126,234,.35)",
                    fontFamily:T.font,
                  }}
                >
                  <Plus size={15}/> Add First Sub Parameter
                </button>
              </div>
            ) : (
              <div style={{ background:"rgba(255,255,255,.97)", borderRadius:T.radius, overflow:"hidden", boxShadow:T.shadow }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:T.grad }}>
                      {["#","Code","Name","Status","Actions"].map(h=>(
                        <th key={h} style={{
                          padding:"15px 18px", textAlign:"left",
                          fontSize:"0.78rem", fontWeight:700, color:"white",
                          textTransform:"uppercase", letterSpacing:"0.6px", whiteSpace:"nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subParams.map((s, i) => (
                      <tr key={s._id}
                        style={{ background: i%2===0?"white":"#fafafa", borderBottom:"1px solid #f3f4f6", transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f5f3ff"}
                        onMouseLeave={e=>e.currentTarget.style.background= i%2===0?"white":"#fafafa"}
                      >
                        <td style={{ padding:"16px 18px", fontFamily:"'DM Mono','Courier New',monospace", fontWeight:700, color:"#667eea", fontSize:"0.85rem" }}>
                          {String(i+1).padStart(2,"0")}
                        </td>
                        <td style={{ padding:"16px 18px" }}>
                          <span style={{
                            fontFamily:"'DM Mono','Courier New',monospace",
                            background:"#f0edff", color:"#667eea",
                            padding:"4px 10px", borderRadius:8,
                            fontSize:"0.85rem", fontWeight:700,
                            border:"1px solid #e0d9ff",
                          }}>
                            {s.code}
                          </span>
                        </td>
                        <td style={{ padding:"16px 18px", fontWeight:600, color:"#1f2937", fontSize:"0.92rem" }}>{s.name}</td>
                        <td style={{ padding:"16px 18px" }}>
                          <span style={{
                            display:"inline-flex", alignItems:"center", gap:5,
                            padding:"3px 12px", borderRadius:20, fontSize:"0.78rem", fontWeight:700,
                            background: s.isActive?"#f0fdf4":"#fef2f2",
                            color: s.isActive?"#16a34a":"#ef4444",
                            border: `1px solid ${s.isActive?"#bbf7d0":"#fecaca"}`,
                          }}>
                            <span style={{
                              width:6, height:6, borderRadius:"50%",
                              background: s.isActive?"#16a34a":"#ef4444",
                              display:"inline-block",
                            }}/>
                            {s.isActive?"Active":"Inactive"}
                          </span>
                        </td>
                        <td style={{ padding:"16px 18px" }}>
                          <button
                            onClick={() => handleDelete(s._id)}
                            style={{
                              display:"inline-flex", alignItems:"center", gap:6,
                              padding:"7px 14px", borderRadius:8, border:"none",
                              background:"#fef2f2", color:"#ef4444",
                              fontSize:"0.82rem", fontWeight:600, cursor:"pointer",
                              fontFamily:T.font, transition:"background .15s",
                            }}
                            onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
                            onMouseLeave={e=>e.currentTarget.style.background="#fef2f2"}
                          >
                            <Trash2 size={13}/> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ADD VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {view === "add" && (
          <div style={{ background:"rgba(255,255,255,.97)", borderRadius:T.radius, boxShadow:T.shadow, overflow:"hidden" }}>

            {/* Form header stripe */}
            <div style={{
              background:T.grad, padding:"22px 32px",
              display:"flex", alignItems:"center", gap:14,
            }}>
              <div style={{
                width:40, height:40, borderRadius:11,
                background:"rgba(255,255,255,.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <Plus size={20} color="white"/>
              </div>
              <div>
                <h3 style={{ margin:0, color:"white", fontSize:"1.1rem", fontWeight:800 }}>Add Sub Parameter</h3>
                <p style={{ margin:0, color:"rgba(255,255,255,.7)", fontSize:"0.78rem" }}>Fill in the details below to create a new sub-parameter</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding:"32px" }}>

              {/* Section: Parent Parameter */}
              <div style={{ marginBottom:28 }}>
                <p style={{ ...labelBase, margin:"0 0 14px" }}>Parent Parameter</p>
                <div style={{ position:"relative", maxWidth:420 }}>
                  <select
                    value={parameterId}
                    onChange={e => setParameterId(e.target.value)}
                    required
                    style={{ ...fieldBase, appearance:"none", paddingRight:40, cursor:"pointer" }}
                    onFocus={focusOn} onBlur={focusOff}
                  >
                    <option value="">Select Parameter…</option>
                    {parameters.map(p=>(
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", pointerEvents:"none" }}/>
                </div>
              </div>

              <hr style={{ border:"none", height:2, background:"linear-gradient(90deg,#667eea,#764ba2)", borderRadius:2, margin:"0 0 28px" }}/>

              {/* Section: Details */}
              <div style={{ marginBottom:28 }}>
                <p style={{ ...labelBase, margin:"0 0 18px" }}>Sub-Parameter Details</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px 24px" }}>

                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={labelBase}>Code *</label>
                    <input
                      type="text" value={code} required
                      onChange={e=>setCode(e.target.value)}
                      placeholder="e.g. RBC_1"
                      style={{ ...fieldBase, fontFamily:"'DM Mono','Courier New',monospace" }}
                      onFocus={focusOn} onBlur={focusOff}
                    />
                    <span style={{ fontSize:"0.73rem", color:"#9ca3af" }}>Short unique identifier</span>
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={labelBase}>Name *</label>
                    <input
                      type="text" value={name} required
                      onChange={e=>setName(e.target.value)}
                      placeholder="e.g. RBC Morphology"
                      style={fieldBase}
                      onFocus={focusOn} onBlur={focusOff}
                    />
                  </div>
                </div>
              </div>

              <hr style={{ border:"none", height:2, background:"#f3f4f6", borderRadius:2, margin:"0 0 28px" }}/>

              {/* Section: Status toggle */}
              <div style={{ marginBottom:32 }}>
                <p style={{ ...labelBase, margin:"0 0 14px" }}>Status</p>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:12,
                    padding:"12px 22px", borderRadius:12,
                    border:`2px solid ${isActive?"#10b981":"#e5e7eb"}`,
                    background: isActive?"#f0fdf4":"#f9fafb",
                    color: isActive?"#065f46":"#6b7280",
                    fontWeight:700, fontSize:"0.92rem",
                    cursor:"pointer", fontFamily:T.font,
                    transition:"all .2s ease",
                    boxShadow: isActive?"0 2px 8px rgba(16,185,129,.2)":"none",
                  }}
                >
                  {isActive
                    ? <ToggleRight size={22} style={{ color:"#10b981" }}/>
                    : <ToggleLeft size={22} style={{ color:"#9ca3af" }}/>
                  }
                  {isActive ? "Active" : "Inactive"}
                </button>
                <span style={{ display:"block", marginTop:8, fontSize:"0.78rem", color:"#9ca3af" }}>
                  Click to toggle the active status
                </span>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:12, justifyContent:"flex-end", paddingTop:20, borderTop:"2px solid #f3f4f6" }}>
                <button
                  type="button"
                  onClick={() => { resetForm(); setView("list"); }}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"12px 24px", borderRadius:12, border:"2px solid #e5e7eb",
                    background:"white", color:"#374151", fontSize:"0.92rem", fontWeight:600,
                    cursor:"pointer", fontFamily:T.font, transition:"background .15s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                  onMouseLeave={e=>e.currentTarget.style.background="white"}
                >
                  <ArrowLeft size={15}/> Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"12px 28px", borderRadius:12, border:"none",
                    background: loading?"#d1d5db":T.green,
                    color:"white", fontSize:"0.92rem", fontWeight:700,
                    cursor: loading?"not-allowed":"pointer",
                    fontFamily:T.font,
                    boxShadow:"0 4px 12px rgba(16,185,129,.35)",
                    transition:"transform .15s,box-shadow .15s",
                  }}
                  onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(16,185,129,.45)"; }}}
                  onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 12px rgba(16,185,129,.35)"; }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width:16, height:16, border:"2px solid white",
                        borderTopColor:"transparent", borderRadius:"50%",
                        animation:"spin .6s linear infinite",
                      }}/>
                      Saving…
                    </>
                  ) : (
                    <><Plus size={15}/> Save Sub Parameter</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes fadeInDown  { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}