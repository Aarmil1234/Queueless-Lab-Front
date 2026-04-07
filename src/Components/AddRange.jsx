import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import {
  Plus,
  ArrowLeft,
  Settings,
  Pencil,
  Trash2
} from "lucide-react";
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

  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ================= FETCH =================
  const fetchParameters = async () => {
    const res = await apiRequest("get", "/api/parameter/");
    setParameters(res?.data?.data || res?.data || []);
  };

  const fetchSubParameters = async (id) => {
    const res = await apiRequest(
      "get",
      `/api/parameter/subCategory/${id}`
    );

    const data = res?.data?.data || res?.data || [];
    setSubParameters(Array.isArray(data) ? data : []);
  };

  const fetchRanges = async (subId) => {
    const res = await apiRequest(
      "get",
      `/api/parameter/defaultParameter/${subId}`
    );

    setRanges(res?.data?.data || res?.data || []);
  };

  useEffect(() => {
    fetchParameters();
  }, []);

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
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this range?")) return;

    await apiRequest("delete", `/api/parameter/defaultParameter/${id}`);
    fetchRanges(subParameterId);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!parameterId || !subParameterId) {
      alert("Select parameter & sub parameter");
      return;
    }

    const payload = {
      parameterId: parameterId,
      subCategoryId: subParameterId,
      gender,
      ageFrom: Number(ageFrom),
      ageTo: ageTo ? Number(ageTo) : null,
      minValue: Number(minValue),
      maxValue: Number(maxValue),
      ageType
    };

    if (isEditing) {
      await apiRequest(
        "put",
        `/api/parameter/defaultParameter/${editId}`,
        payload
      );
    } else {
      await apiRequest(
        "post",
        "/api/parameter/defaultParameter/add",
        payload
      );
    }

    setView("list");
    setIsEditing(false);
    setEditId(null);

    fetchRanges(subParameterId);

    // reset
    setGender("ANY");
    setAgeFrom("");
    setAgeTo("");
    setMinValue("");
    setMaxValue("");
    setAgeType("year");
  };

  // ================= LABEL =================
  const getLabel = (item) =>
    `${item.name || item.subParameterName} (${item.code || item.subParameterCode})`;

  return (
    <div className="reports-wrapper">
      <div className="reports-container">

        {/* HEADER */}
        <div className="reports-header">
          <h2><Settings size={26} /> Parameter Range Manager</h2>

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
              onClick={() => setView("list")}
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
        </div>

        {/* ================= LIST ================= */}
        {view === "list" && (
          <>
            {/* PARAMETER */}
            <select value={parameterId} onChange={handleParameterChange}>
              <option value="">Select Parameter</option>
              {parameters.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>

            {/* SUB PARAMETER */}
            {parameterId && (
              <select
                value={subParameterId}
                onChange={handleSubParameterChange}
              >
                <option value="">Select Sub Parameter</option>
                {subParameters.map(sp => (
                  <option key={sp._id} value={sp._id}>
                    {getLabel(sp)}
                  </option>
                ))}
              </select>
            )}

            {/* TABLE */}
            {subParameterId && (
              ranges.length > 0 ? (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ranges.map(r => (
                      <tr key={r._id}>
                        <td>{r.gender}</td>
                        <td>{r.ageFrom} - {r.ageTo || "∞"}</td>
                        <td>{r.minValue}</td>
                        <td>{r.maxValue}</td>
                        <td>
                          <button onClick={() => handleEdit(r)}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(r._id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <h3>No ranges found</h3>
              )
            )}
          </>
        )}

        {/* ================= ADD ================= */}
        {view === "add" && (
          <form className="reports-form-card" onSubmit={handleSubmit}>

            <label>Parameter</label>
            <select value={parameterId} onChange={handleParameterChange} required>
              <option value="">Select Parameter</option>
              {parameters.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <label>Sub Parameter</label>
            <select
              value={subParameterId}
              onChange={handleSubParameterChange}
              required
            >
              <option value="">Select Sub Parameter</option>
              {subParameters.map(sp => (
                <option key={sp._id} value={sp._id}>
                  {getLabel(sp)}
                </option>
              ))}
            </select>

            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="ANY">Any</option>
            </select>

            <input placeholder="Age From" value={ageFrom} onChange={e => setAgeFrom(e.target.value)} required />
            <input placeholder="Age To (optional)" value={ageTo} onChange={e => setAgeTo(e.target.value)} />
            <input placeholder="Min Value" value={minValue} onChange={e => setMinValue(e.target.value)} required />
            <input placeholder="Max Value" value={maxValue} onChange={e => setMaxValue(e.target.value)} required />

            <button className="btn-report btn-success">
              {isEditing ? "Update" : "Save"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}