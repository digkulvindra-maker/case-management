// src/views/CaseForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/HindiFont.css";

export default function CaseForm() {
  const [formData, setFormData] = useState({
    SROName: "",
    District: "",
    Collector: "",
    CaseNo: "",
    CaseYear: "",
    CaseRegistredDate: "",
    CaseType: "",
    DocumentNumber: "",
    DocumentDate: "",
    Property: "",
    FirstParty: "",
    FirstPartyAddress: "",
    FirstParty1: "",
    FirstParty1Address: "",
    SecondParty: "",
    SecondPartyAddress: "",
    SecondParty1: "",
    SecondParty1Address: ""
  });

  const [sroList, setSroList] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [msg, setMsg] = useState("");

  const caseTypes = [
    "egkys[kkdkj tkap ny t;iqj",
    "vkUrfjd ys[kk tkap ny] vtesj",
    "ekSdk fujh{k.k",
    "vU;",
    "lqvkseksVks",
  ];
  const collectorOptions = ["guqekux<+"];


  useEffect(() => {
    const fetchSROsAndDistricts = async () => {
      try {
        const [sroRes, distRes] = await Promise.all([
          axios.get("http://192.168.1.102:5000/api/sros"),
          axios.get("http://192.168.1.102:5000/api/districts"),
        ]);
        setSroList(sroRes.data || []);
        setDistricts(distRes.data?.map(d => d.District) || []);
      } catch (err) {
        setMsg("Error loading SROs or Districts");
      }
    };
    fetchSROsAndDistricts();
  }, []);


  const handleSROChange = (e) => {
    const selectedSRO = e.target.value;
    const found = sroList.find((s) => s.SROffice === selectedSRO);
    setFormData(prev => ({
      ...prev,
      SROName: selectedSRO,
      District: found ? found.District : prev.District,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://192.168.1.102:5000/api/cases", formData);
      await Swal.fire({
        icon: "success",
        title: "Case Saved",
        text: res.data?.message || "Case saved successfully!",
      });

      setFormData({
        SROName: "",
        District: "",
        Collector: "",
        CaseNo: "",
        CaseYear: "",
        CaseRegistredDate: "",
        CaseType: "",
        DocumentNumber: "",
        DocumentDate: "",
        Property: "",
        FirstParty: "",
        FirstPartyAddress: "",
        FirstParty1: "",
        FirstParty1Address: "",
        SecondParty: "",
        SecondPartyAddress: "",
        SecondParty1: "",
        SecondParty1Address: ""
      });

    } catch {
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Error saving data",
      });
    }
  };


  return (
    <div className="container p-2">
      <div className="card shadow-lg border-0">

        {/* -------------------- HEADER -------------------- */}
        <div className="card-header bg-warning">
          <h4 className="card-title fw-bold text-dark">📁 Case Entry</h4>
        </div>

        <div className="card-body">

          {msg && <div className="alert alert-warning">{msg}</div>}

          <form onSubmit={handleSubmit}>

            {/* -------------------- SECTION 1 -------------------- */}
            <h6 className="mt-2 text-dark fw-bold bg-light p-2">Court / SRO Details</h6>
            <div className="row g-3 mt-1">
              
              <div className="col-md-4">
                <label className="form-label">Court Collector (Stamps)</label>
                <select
                  name="Collector"
                  className="form-select hindi-k010-textbox"
                  value={formData.Collector}
                  onChange={handleChange}
                  required
                >
                  <option value="">dyDVj pqus</option>
                  {collectorOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">District</label>
                <select
                  name="District"
                  className="form-select hindi-k010-textbox"
                  value={formData.District}
                  onChange={handleChange}
                  disabled
                >
                  <option>ftyk pqus</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">SRO Name</label>
                <select
                  name="SROName"
                  className="form-select hindi-k010-textbox"
                  value={formData.SROName}
                  onChange={handleSROChange}
                  required
                >
                  <option value="">,l vkj vks pqus</option>
                  {sroList.map(s => (
                    <option key={s.id} value={s.SROffice}>{s.SROffice}</option>
                  ))}
                </select>
              </div>

            </div>


            {/* -------------------- SECTION 2 -------------------- */}
            <h6 className="mt-4 text-dark fw-bold bg-light p-2">Case Details</h6>
            <div className="row g-3 mt-1">

              <div className="col-md-4">
                <label className="form-label">Case No</label>
                <input type="text" name="CaseNo" className="form-control hindi-k010-textbox"
                  value={formData.CaseNo} onChange={handleChange} required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Case Year</label>
                <input type="number" name="CaseYear" className="form-control hindi-k010-textbox"
                  value={formData.CaseYear} onChange={handleChange} required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Case Registered Date</label>
                <input type="date" name="CaseRegistredDate" className="form-control"
                  value={formData.CaseRegistredDate} onChange={handleChange} />
              </div>

              <div className="col-md-4">
                <label className="form-label">Case Type</label>
                <select name="CaseType" className="form-select hindi-k010-textbox"
                  value={formData.CaseType} onChange={handleChange} required>
                  <option value="">dsl izdkj pqus</option>
                  {caseTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

            </div>


            {/* -------------------- SECTION 3 -------------------- */}
            <h6 className="mt-4 text-dark fw-bold bg-light p-2">Document Details</h6>
            <div className="row g-3 mt-1">

              <div className="col-md-4">
                <label className="form-label">Document Number</label>
                <input type="text" name="DocumentNumber" className="form-control hindi-k010-textbox"
                  value={formData.DocumentNumber} onChange={handleChange} />
              </div>

              <div className="col-md-4">
                <label className="form-label">Document Date</label>
                <input type="date" name="DocumentDate" className="form-control"
                  value={formData.DocumentDate} onChange={handleChange} />
              </div>

            </div>


            {/* -------------------- SECTION 4 -------------------- */}
            <h6 className="mt-4 text-dark fw-bold bg-light p-2">Party Details</h6>
            <div className="row g-3 mt-1">

              <div className="col-md-6">
                <label className="form-label">First Party</label>
                <input type="text" name="FirstParty"
                  className="form-control hindi-k010-textbox"
                  value={formData.FirstParty} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Second Party</label>
                <input type="text" name="SecondParty"
                  className="form-control hindi-k010-textbox"
                  value={formData.SecondParty} onChange={handleChange} />
              </div>
            </div>


            {/* -------------------- SUBMIT BUTTON -------------------- */}
            <div className="mt-4 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary px-4">Save Case</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
