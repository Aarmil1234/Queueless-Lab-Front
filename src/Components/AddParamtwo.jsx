import React, { useEffect, useState } from "react";
import { Beaker, CheckCircle, AlertCircle, Plus, X } from "lucide-react";
import "../Scss/Reports.scss";
import { apiRequest } from "../reusable";
import Swal from "sweetalert2";

export default function AddParameterPage() {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("BIOCHEMISTRY");
  const [unit, setUnit] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
const [editId, setEditId] = useState(null);


  // Fetch parameters on page load
 const fetchParameters = async () => {
  try {
    const res = await apiRequest("get", "/api/parameter/");
    console.log("API Response:", res);

    // Adjust based on actual response shape
    setParameters(res?.data || []);
  } catch (err) {
    console.error("Failed to fetch parameters", err);
  }
};


  useEffect(() => {
    fetchParameters();
  }, []);

  const handleEdit = (param) => {
  setEditId(param._id);   // must come from backend
  setCode(param.code);
  setName(param.name);
  setCategory(param.category);
  setUnit(param.unit);
  setIsEditing(true);
  setShowModal(true);
};


 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  setMessageType("");

  const payload = {
    code,
    name,
    category,
    type: "NUMERIC",
    unit,
  };

  try {
    if (isEditing) {
      await apiRequest("put", `api/parameter/${editId}`, payload);
      setMessage("Parameter updated successfully!");
    } else {
      await apiRequest("post", "api/parameter/add", payload);
      setMessage("Parameter added successfully!");
    }

    setMessageType("success");
    setShowModal(false);
    resetForm();
    fetchParameters();

    setTimeout(() => setMessage(""), 3000);
  } catch (err) {
    setMessage(isEditing ? "Failed to update parameter" : "Failed to add parameter");
    setMessageType("error");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


const resetForm = () => {
  setCode("");
  setName("");
  setCategory("BIOCHEMISTRY");
  setUnit("");
  setIsEditing(false);
  setEditId(null);
};

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Delete Parameter?",
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!"
  });

  if (!result.isConfirmed) return;

  try {
    await apiRequest("delete", `api/parameter/${id}`);
    Swal.fire("Deleted!", "Parameter removed.", "success");
    fetchParameters();
  } catch (err) {
    Swal.fire("Error", "Failed to delete", "error");
  }
};

  return (
    <div className="reports-wrapper">
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h2>
              <Beaker size={28} />
              Lab Parameters
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#6b7280", marginTop: "8px" }}>
              Manage laboratory test parameters and reference ranges
            </p>
          </div>
          <button 
            className="btn-report btn-primary" 
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={18} />
            Add Parameter
          </button>
        </div>

        {/* Success/Error Message */}
        {message && !showModal && (
          <div style={{
            marginBottom: "20px",
            padding: "15px 20px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: messageType === "success" 
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
              : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "white",
            fontWeight: "600"
          }}>
            {messageType === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Parameters Table */}
        <div className="reports-table-card">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Parameter Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Unit</th>
                <th>Actions</th>

              </tr>
            </thead>
            <tbody>
              {parameters.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                    No parameters found. Click "Add Parameter" to create one.
                  </td>
                </tr>
              ) : (
                parameters.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700", color: "#667eea" }}>{p.code}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>
                      <span style={{
                        padding: "4px 12px",
                        background: "#e0e7ff",
                        color: "#4f46e5",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        borderRadius: "6px"
                      }}>
                        {p.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: "600" }}>{p.unit}</td>
                    <td style={{ display: "flex", gap: "8px" }}>
  <button
    className="btn-report btn-secondary"
    onClick={() => handleEdit(p)}
  >
    Edit
  </button>

  <button
    className="btn-report btn-danger"
    onClick={() => handleDelete(p._id)}
  >
    Delete
  </button>
</td>


                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}>
            <div className="reports-form-card" style={{
              maxWidth: "500px",
              width: "100%",
              margin: 0,
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <Beaker size={24} />
                  {isEditing ? "Edit Parameter" : "Add New Parameter"}

                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <X size={20} color="#6b7280" />
                </button>
              </div>

              <div className="reports-form-grid">
                {/* Code Input */}
                <label>Parameter Code:</label>
                <div>
                  <input
  type="text"
  value={code}
  disabled={isEditing}
  onChange={(e) => setCode(e.target.value.toUpperCase())}
/>

                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>
                    Short unique identifier (max 10 chars)
                  </p>
                </div>

                {/* Name Input */}
                <label>Parameter Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Glucose, Hemoglobin"
                />

                {/* Category Select */}
                <label>Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="BIOCHEMISTRY">Biochemistry</option>
                  <option value="HEMATOLOGY">Hematology</option>
                  <option value="IMMUNOLOGY">Immunology</option>
                  <option value="MICROBIOLOGY">Microbiology</option>
                  <option value="SEROLOGY">Serology</option>
                </select>

                {/* Type (Read-only) */}
                <label>Type:</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value="NUMERIC"
                    disabled
                    style={{ 
                      background: "#f3f4f6", 
                      cursor: "not-allowed",
                      color: "#6b7280"
                    }}
                  />
                  <span style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: "4px 12px",
                    background: "#e0e7ff",
                    color: "#4f46e5",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    borderRadius: "6px"
                  }}>
                    Fixed
                  </span>
                </div>

                {/* Unit Input */}
                <label>Unit of Measurement:</label>
                <div>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    placeholder="e.g., mg/dL, g/dL, cells/µL"
                  />
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>
                    Standard unit for reporting results
                  </p>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="reports-button-group" style={{ 
                display: "flex", 
                gap: "12px",
                marginTop: "24px"
              }}>
                <button
                  className="btn-report btn-secondary"
                  onClick={() => {
  setShowModal(false);
  resetForm();
}}

                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn-report btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>{isEditing ? "Update Parameter" : "Add Parameter"}</span>

                    </>
                  )}
                </button>
              </div>

              {/* Modal Message */}
              {message && showModal && (
                <div style={{
                  marginTop: "20px",
                  padding: "15px 20px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: messageType === "success" 
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  fontWeight: "600"
                }}>
                  {messageType === "success" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}