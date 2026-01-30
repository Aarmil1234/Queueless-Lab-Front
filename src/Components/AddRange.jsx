import React, { useEffect, useState } from "react";
import { apiRequest } from "../reusable";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function AddParameterRange() {
    const [parameters, setParameters] = useState([]);
    const [parameterId, setParameterId] = useState("");

    const [gender, setGender] = useState("ANY");
    const [ageFrom, setAgeFrom] = useState("");
    const [ageTo, setAgeTo] = useState("");
    const [minValue, setMinValue] = useState("");
    const [maxValue, setMaxValue] = useState("");
    const [ageType, setAgeType] = useState("year");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // Fetch Parameters for Dropdown
    const fetchParameters = async () => {
        try {
            const res = await apiRequest("get", "/api/parameter/");
            setParameters(res?.data || []);
        } catch (err) {
            console.error("Failed to fetch parameters", err);
        }
    };

    useEffect(() => {
        fetchParameters();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!parameterId) {
            setMessage("Please select a parameter");
            setMessageType("error");
            return;
        }

        const payload = {
            parameterId,
            gender,
            ageFrom: Number(ageFrom),
            ageTo: Number(ageTo),
            minValue: Number(minValue),
            maxValue: Number(maxValue),
            ageType
        };

        try {
            setLoading(true);
            await apiRequest("post", "api/parameter/defaultParameter/add", payload);

            setMessage("Range added successfully!");
            setMessageType("success");

            // Reset
            setGender("ANY");
            setAgeFrom("");
            setAgeTo("");
            setMinValue("");
            setMaxValue("");
            setAgeType("year");
            setParameterId("");

        } catch (err) {
            console.error(err);
            setMessage("Failed to add range");
            setMessageType("error");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return (
        <div className="reports-wrapper">
            <div className="reports-container">
                <h2>Add Parameter Range</h2>

                {message && (
                    <div style={{
                        marginBottom: "20px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: messageType === "success" ? "#10b981" : "#ef4444",
                        color: "white",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center"
                    }}>
                        {messageType === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message}
                    </div>
                )}

                <form className="reports-form-card" onSubmit={handleSubmit}>
                    <div className="reports-form-grid">

                        {/* Parameter Dropdown */}
                        <label>Select Parameter</label>
                        <select value={parameterId} onChange={(e) => setParameterId(e.target.value)} required>
                            <option value="">-- Select Parameter --</option>
                            {parameters.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name} ({p.code})
                                </option>
                            ))}
                        </select>

                        {/* Gender */}
                        <label>Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="ANY">Any</option>
                        </select>

                        {/* Age Type */}
                        <label>Age Type</label>
                        <select value={ageType} onChange={(e) => setAgeType(e.target.value)}>
                            <option value="year">Year</option>
                            <option value="month">Month</option>
                        </select>

                        {/* Age From */}
                        <label>Age From</label>
                        <input
                            type="number"
                            value={ageFrom}
                            onChange={(e) => setAgeFrom(e.target.value)}
                            placeholder="e.g. 18"
                            required
                        />

                        {/* Age To */}
                        <label>Age To</label>
                        <input
                            type="number"
                            value={ageTo}
                            onChange={(e) => setAgeTo(e.target.value)}
                            placeholder="e.g. 65"
                            required
                        />


                        {/* Min Value */}
                        <label>Min Value</label>
                        <input
                            type="number"
                            value={minValue}
                            onChange={(e) => setMinValue(e.target.value)}
                            placeholder="e.g. 2"
                            required
                        />

                        {/* Max Value */}
                        <label>Max Value</label>
                        <input
                            type="number"
                            value={maxValue}
                            onChange={(e) => setMaxValue(e.target.value)}
                            placeholder="e.g. 12"
                            required
                        />

                        

                    </div>

                    <button
                        type="submit"
                        className="btn-report btn-success"
                        disabled={loading}
                        style={{ marginTop: "20px" }}
                    >
                        {loading ? "Saving..." : "Add Range"}
                    </button>
                </form>
            </div>
        </div>
    );
}
