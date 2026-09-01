import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Plus, X, Pencil, Trash2, FlaskConical, ChevronDown, ClipboardCheck } from "lucide-react";
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
  const [testReports, setTestReports] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null); // full test report object (page-level filter)

  const [parameters, setParameters] = useState([]);
  const [loadingParams, setLoadingParams] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [message, setMessage]       = useState("");
  const [messageType, setMessageType] = useState("");

  const [modalTestId, setModalTestId] = useState(""); // test report chosen inside the modal
  const [name, setName]       = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId]   = useState(null);

  // ── Fetch: all test reports for the dropdowns ───────────────────────────────
  const fetchTestReports = async () => {
    setLoadingTests(true);
    try {
      const res = await apiRequest("get", "/api/testreport");
      const list = res?.data?.data;
      setTestReports(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setTestReports([]);
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => { fetchTestReports(); }, []);

  // ── Fetch: parameters for the selected test report ──────────────────────────
  const fetchParameters = async (testReportId) => {
    if (!testReportId) { setParameters([]); return; }
    setLoadingParams(true);
    try {
      const res = await apiRequest("get", `/api/testreport/${testReportId}/parameters`);
      const list = res?.data?.data?.parameters;
      setParameters(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setParameters([]);
    } finally {
      setLoadingParams(false);
    }
  };

  useEffect(() => {
    fetchParameters(selectedTest?._id);
  }, [selectedTest]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectTest = (e) => {
    const test = testReports.find(t => t._id === e.target.value) || null;
    setSelectedTest(test);
  };

  const handleEdit = (p) => {
    setEditId(p._id); setName(p.name);
    setModalTestId(p.testReportId || selectedTest?._id || "");
    setIsEditing(true); setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Parameter?", text: "This action cannot be undone",
      icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      await apiRequest("delete", `/api/parameter/${id}`);
      Swal.fire("Deleted!", "Parameter removed.", "success");
      fetchParameters(selectedTest?._id);
    } catch { Swal.fire("Error", "Failed to delete", "error"); }
  };

  const resetForm = () => {
    setName("");
    setIsEditing(false); setEditId(null);
    setModalTestId(selectedTest?._id || "");
  };

  const closeModal = () => { setShowModal(false); resetForm(); setMessage(""); };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!modalTestId) return;
    setLoading(true); setMessage(""); setMessageType("");
    const payload = {
      name, type: "NUMERIC",
      testReportId: modalTestId,
    };
    try {
      if (isEditing) {
        await apiRequest("put", `/api/parameter/${editId}`, payload);
        setMessage("Parameter updated successfully!");
      } else {
        await apiRequest("post", "/api/parameter/add", payload);
        setMessage("Parameter added successfully!");
      }
      setMessageType("success");
      closeModal();

      // Show the result under whichever test the parameter was saved to.
      const savedTest = testReports.find(t => t._id === modalTestId) || null;
      setSelectedTest(savedTest);
      fetchParameters(modalTestId);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage(isEditing ? "Failed to update parameter" : "Failed to add parameter");
      setMessageType("error");
    } finally { setLoading(false); }
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
            onClick={openAddModal}
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

        {/* ── Select test report (for viewing the table) ──────────────────── */}
        <div style={{
          background:"rgba(255,255,255,.97)", backdropFilter:"blur(12px)",
          borderRadius:T.radius, padding:"22px 32px",
          boxShadow:T.shadow,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{
              width:34, height:34, borderRadius:10, background:"#eff6ff",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <ClipboardCheck size={17} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:"1rem", fontWeight:800, color:"#1f2937" }}>Select a Test Report</h3>
              <p style={{ margin:0, fontSize:"0.78rem", color:"#9ca3af" }}>
                Choose which test's parameters to view below
              </p>
            </div>
          </div>

          <div style={{ position:"relative", maxWidth:420 }}>
            <select
              value={selectedTest?._id || ""}
              onChange={handleSelectTest}
              disabled={loadingTests}
              style={{ ...field.input, appearance:"none", paddingRight:40, cursor: loadingTests ? "wait" : "pointer" }}
              onFocus={focusOn} onBlur={focusOff}
            >
              <option value="">
                {loadingTests ? "Loading tests…" : testReports.length === 0 ? "No test reports found" : "— Select a test —"}
              </option>
              {testReports.map(t => (
                <option key={t._id} value={t._id}>
                  {t.code ? `${t.code} — ${t.testName}` : t.testName}
                </option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", pointerEvents:"none" }}/>
          </div>
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
                {["Parameter Name","Actions"].map(h => (
                  <th key={h} style={{
                    padding:"15px 18px", textAlign:"left",
                    fontSize:"0.78rem", fontWeight:700, color:"white",
                    textTransform:"uppercase", letterSpacing:"0.6px", whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!selectedTest ? (
                <tr>
                  <td colSpan={2} style={{ padding:"56px 24px", textAlign:"center" }}>
                    <div style={{
                      width:56, height:56, borderRadius:"50%", background:"#f3f4f6",
                      display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px",
                    }}>
                      <ClipboardCheck size={26} color="#d1d5db" />
                    </div>
                    <p style={{ margin:0, color:"#9ca3af", fontWeight:500 }}>
                      Select a test report above to view its parameters.
                    </p>
                  </td>
                </tr>
              ) : loadingParams ? (
                <tr>
                  <td colSpan={2} style={{ padding:"56px 24px", textAlign:"center", color:"#9ca3af", fontWeight:500 }}>
                    Loading parameters…
                  </td>
                </tr>
              ) : parameters.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding:"56px 24px", textAlign:"center" }}>
                    <div style={{
                      width:56, height:56, borderRadius:"50%", background:"#f3f4f6",
                      display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px",
                    }}>
                      <FlaskConical size={26} color="#d1d5db" />
                    </div>
                    <p style={{ margin:0, color:"#9ca3af", fontWeight:500 }}>
                      No parameters for <strong>{selectedTest.testName}</strong> yet — click <strong>Add Parameter</strong> to get started.
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
                  <td style={{ padding:"16px 18px", fontWeight:600, color:"#1f2937", fontSize:"0.92rem" }}>{p.name}</td>

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

                {/* Test Report */}
                <div style={{ ...field.wrap, position:"relative", gridColumn:"span 2" }}>
                  <label style={field.label}>Test Report *</label>
                  <select
                    value={modalTestId} required disabled={isEditing}
                    onChange={e => setModalTestId(e.target.value)}
                    style={{ ...field.input, appearance:"none", paddingRight:40, cursor: isEditing ? "not-allowed" : "pointer", ...(isEditing ? { opacity:.6 } : {}) }}
                    onFocus={focusOn} onBlur={focusOff}
                  >
                    <option value="" disabled>— Select a test —</option>
                    {testReports.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.code ? `${t.code} — ${t.testName}` : t.testName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position:"absolute", right:14, bottom:14, color:"#9ca3af", pointerEvents:"none" }}/>
                  <span style={field.hint}>Which test this parameter belongs to</span>
                </div>

                {/* Name */}
                <div style={{ ...field.wrap, gridColumn:"span 2" }}>
                  <label style={field.label}>Parameter Name *</label>
                  <input
                    type="text" value={name} required
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Glucose, Hemoglobin"
                    style={field.input}
                    onFocus={focusOn} onBlur={focusOff}
                  />
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