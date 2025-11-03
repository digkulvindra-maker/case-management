//CaseForm.jsx
import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const CaseForm = () => {
    const [formData, setFormData] = useState({
        SROName: "",
        CaseNo: "",
        CaseYear: "",
        CaseRegistredDate: "",
        CaseType: "",
        DocumentNumber: "",
        DocumentRegistredDate: "",
        FirstParty1: "",
        FirstParty2: "",
        SecondPary1: "",
        SecondPary2: "",
        Property: "",
        PreValucation: "",
        AfterValucation: "",
        AlreadyDepositSD: "",
        AlreadyDepositSur1: "",
        AlreadyDepositSur2: "",
        AlreadyDepositSur3: "",
        AlreadyDepositRF: "",
        EtimatedSD: "",
        EtimatedSur1: "",
        EtimatedSur2: "",
        EtimatedSur3: "",
        EtimatedRF: "",
    });

    const [validated, setValidated] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);

        // basic validation
        if (!formData.CaseNo || !formData.SROName || !formData.CaseType) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/cases", formData);
            alert(res.data.message);
            setFormData({ ...formData, CaseNo: "", CaseYear: "", Property: "" }); // reset partial
            setValidated(false);
        } catch (err) {
            console.error(err);
            alert("Error saving case!");
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="text-center mb-4">📄 Case Entry Form</h3>

            <form className={`needs-validation ${validated ? "was-validated" : ""}`} noValidate onSubmit={handleSubmit}>
                {/* SRO Name Dropdown */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label className="form-label">SRO Name *</label>
                        <select
                            className="form-select"
                            name="SROName"
                            value={formData.SROName}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select SRO</option>
                            <option value="HANUMANGARH">HANUMANGARH</option>
                            <option value="SURATGARH">SURATGARH</option>
                            <option value="SANGARIA">SANGARIA</option>
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Case No *</label>
                        <input
                            type="text"
                            className="form-control"
                            name="CaseNo"
                            value={formData.CaseNo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Case Year</label>
                        <input
                            type="number"
                            className="form-control"
                            name="CaseYear"
                            value={formData.CaseYear}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Dates */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label className="form-label">Case Registered Date</label>
                        <input
                            type="date"
                            className="form-control"
                            name="CaseRegistredDate"
                            value={formData.CaseRegistredDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Case Type *</label>
                        <select
                            className="form-select"
                            name="CaseType"
                            value={formData.CaseType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="AG">AG</option>
                            <option value="ICP">ICP</option>
                            <option value="Random">Random</option>
                            <option value="Other">Other</option>
                            <option value="SuoMoto">Suo Moto</option>
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Document Number</label>
                        <input
                            type="text"
                            className="form-control"
                            name="DocumentNumber"
                            value={formData.DocumentNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Parties */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">First Party 1</label>
                        <input
                            type="text"
                            className="form-control"
                            name="FirstParty1"
                            value={formData.FirstParty1}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Second Party 1</label>
                        <input
                            type="text"
                            className="form-control"
                            name="SecondPary1"
                            value={formData.SecondPary1}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Property and Values */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Property</label>
                        <textarea
                            className="form-control"
                            name="Property"
                            value={formData.Property}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Pre Valuation</label>
                        <input
                            type="number"
                            className="form-control"
                            name="PreValucation"
                            value={formData.PreValucation}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">After Valuation</label>
                        <input
                            type="number"
                            className="form-control"
                            name="AfterValucation"
                            value={formData.AfterValucation}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="text-center">
                    <button type="submit" className="btn btn-primary px-4">
                        Save Case
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CaseForm;
