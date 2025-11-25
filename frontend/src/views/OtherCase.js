// src/views/OtherCase.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/HindiFont.css";

export default function OtherCase() {
  
  const API = "http://192.168.1.102:5000";

  const [casesList, setCasesList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [caseNo, setCaseNo] = useState("");
  const [caseYear, setCaseYear] = useState("");

  const [vaad, setVaad] = useState("");
  const [letterNo, setLetterNo] = useState("");
  const [date, setDate] = useState("");
  const [civilCaseNo, setCivilCaseNo] = useState("");
  const [civilCaseYear, setCivilCaseYear] = useState("");

  const handleSubmit = () => {
  if (!selectedCaseId) {
    Swal.fire("Required", "Please select a Civil Case!", "warning");
    return;
  }
  if (!selectedDistrict) {
    Swal.fire("Required", "Please select a District Court!", "warning");
    return;
  }
  if (!vaad.trim()) {
    Swal.fire("Required", "Please enter Civil Case (okn)!", "warning");
    return;
  }
  if (!letterNo.trim()) {
    Swal.fire("Required", "Please enter Letter No.!", "warning");
    return;
  }
  if (!date) {
    Swal.fire("Required", "Please select Letter Date!", "warning");
    return;
  }

  // ✅ payload created correctly HERE
      const payload = {
          case_id: selectedCaseId,
          district_court_id: selectedDistrict,
          vaad,
          letter_no: letterNo,
          letter_date: date,

          civil_case_no: civilCaseNo,      // NEW
          civil_case_year: civilCaseYear,  // NEW

      };


      // console.log("Sending Payload:", payload); // debug

      axios
          .post(`${API}/api/other-case-entry`, payload)
          .then((res) => {
              console.log("Success Response:", res.data);

              if (res.data.success) {
                  Swal.fire("Success", res.data.message, "success");
              } else {
                  Swal.fire("Warning", res.data.message || "Could not save!", "warning");
                  return;
              }

              // Reset Form
              setSelectedCaseId("");
              setSelectedDistrict("");
              setVaad("");
              setLetterNo("");
              setDate("");
          })
          .catch((err) => {
              console.error("Save Error:", err);
              Swal.fire(
                  "Error",
                  err.response?.data?.message || "Unable to save data!",
                  "error"
              );
          });

  };


  // ======================================
  // Load only CaseType = OTHER cases
  // ======================================
  useEffect(() => {
    axios
      .get(`${API}/api/cases/other`)
      .then((res) => {
        setCasesList(res.data);
      })
      .catch((err) => {
        console.error("Error loading Other cases:", err);
        Swal.fire("Error", "Unable to load case list!", "error");
      });
  }, []);

  // ======================================
  // Load case details when user selects a case
  // ======================================
  const handleCaseSelect = (id) => {
    setSelectedCaseId(id);

    if (!id) return;

    axios
      .get(`${API}/api/case/${id}`)
      .then((res) => {
        const c = res.data.case;

        setCaseNo(c.CaseNo || "");
        setCaseYear(c.CaseYear || "");
        setVaad(c.Property || "");
      })
      .catch((err) => {
        console.error("Error loading case details:", err);
        Swal.fire("Error", "Unable to load case details!", "error");
      });
  };

  // ======================================
  // Load district courts
  // ======================================
  useEffect(() => {
    axios
      .get(`${API}/api/district-courts`)
      .then((res) => {
        setDistricts(res.data);
      })
      .catch((err) => {
        console.error("Error loading district courts:", err);
        Swal.fire("Error", "Unable to load district court list!", "error");
      });
  }, []);

return (
  <div className="container mt-4 p-2">

    <div className="card shadow-lg border-0">
      <div className="card-header bg-info fw-bold text-dark ">
        Other Case Entry Form
      </div>

      <div className="card-body">

        <div className="row">

          {/* Select Case */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Select DIG Case Number
            </label>
            <select
              className="form-select hindi-k010-textbox"
              value={selectedCaseId}
              onChange={(e) => handleCaseSelect(e.target.value)}
            >
              <option value="">-- dsl pqus --</option>
              {casesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.CaseNo} @ {c.CaseYear}
                </option>
              ))}
            </select>
          </div>

          {/* District Court */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">District Court</label>
            <select
              className="form-select hindi-k010-textbox"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">-- ftyk U;k;y; pqus --</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.court_name}
                </option>
              ))}
            </select>
          </div>
            {/* Civil Case No */}
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Civil Case No</label> (<span className="hindi-k010-textbox">uEcjh nhokuh</span>)
                <input
                    type="text"
                    className="form-control hindi-k010-textbox"
                    value={civilCaseNo}
                    onChange={(e) => setCivilCaseNo(e.target.value)}
                    placeholder="-- flfoy dsl fy[ksa --"
                />
            </div>

            {/* Civil Case Year */}
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Civil Case Year</label>
                <select
                    className="form-select hindi-k010-textbox"
                    value={civilCaseYear}
                    onChange={(e) => setCivilCaseYear(e.target.value)}
                >
                    <option value="">-- flfoy dsl lky pqus --</option>
                    {Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Vaad */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Civil Case 
            </label> (<span className="hindi-k010-textbox">okn</span>)
            <input
              type="text"
              className="form-control hindi-k010-textbox"
              value={vaad}
              onChange={(e) => setVaad(e.target.value)}
              placeholder="okn ntZ djsa"
            />
          </div>

          {/* Letter No */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Civil Case Letter No.</label>
            <input
              type="text"
              className="form-control"
              value={letterNo}
              onChange={(e) => setLetterNo(e.target.value)}
              placeholder="Enter Letter Number"
            />
          </div>

          {/* Date */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Civil Case Letter Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

        </div>

        {/* Submit */}
        <div className="text-end">
          <button className="btn btn-primary px-4" onClick={handleSubmit}>
            Submit
          </button>
        </div>

      </div>
    </div>

  </div>
);

}
