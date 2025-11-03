import React, { useState, useEffect } from "react";
import axios from "axios";
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
    FirstParty: "",
    SecondParty: "",
  });

  const [msg, setMsg] = useState("");
  const [sroList, setSroList] = useState([]);
  const [districts, setDistricts] = useState([]);

  const caseTypes = [
    "egkys[kkdkj tkap ny t;iqj",
    "vkUrfjd ys[kk tkap ny] vtesj",
    "ekSdk fujh{k.k",
    "vU;",
    "lqvkseksVks",
  ];
  const collectorOptions = ["guqekux<+", "vtesj"];

  // ✅ Fetch SROs and Districts from backend
  useEffect(() => {
    const fetchSROsAndDistricts = async () => {
      try {
        const [sroRes, distRes] = await Promise.all([
          axios.get("http://localhost:5000/api/sros"),
          axios.get("http://localhost:5000/api/districts"),
        ]);
        setSroList(sroRes.data);
        setDistricts(distRes.data.map((d) => d.District));
      } catch (err) {
        console.error("Error loading SRO/Districts:", err);
      }
    };
    fetchSROsAndDistricts();
  }, []);

  // ✅ Auto-set District when SRO is selected
  const handleSROChange = (e) => {
    const selectedSRO = e.target.value;
    const found = sroList.find((s) => s.SROffice === selectedSRO);
    setFormData((prev) => ({
      ...prev,
      SROName: selectedSRO,
      District: found ? found.District : prev.District,
    }));
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/cases", formData);
      setMsg(res.data.message || "Saved successfully!");

      // Reset form
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
        FirstParty: "",
        SecondParty: "",
      });
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "Error saving data");
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="card-title mb-0">Case Entry</h4>
        </div>

        <div className="card-body">
          {msg && <div className="alert alert-info">{msg}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* ✅ Collector Selection */}
              <div className="col-md-4">
                <label htmlFor="Collector" className="form-label">
                  Court Collector(Stamps)
                </label>
                <select
                  id="Collector"
                  name="Collector"
                  className="form-select hindi-k010-textbox"
                  value={formData.Collector}
                  onChange={handleChange}
                  required
                >
                  <option value="">dksVZ dysDVj pqus</option>
                  {collectorOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ District Selection */}
              <div className="col-md-4">
                <label htmlFor="District" className="form-label">
                  District
                </label>
                <select
                  id="District"
                  name="District"
                  className="form-select hindi-k010-textbox"
                  value={formData.District}
                  onChange={handleChange}
                  required disabled
                >
                  <option value="">ftyk pquko djsa</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ SRO Name (Auto-sets District) */}
              <div className="col-md-4">
                <label htmlFor="SROName" className="form-label">
                  SRO Name
                </label>
                <select
                  id="SROName"
                  name="SROName"
                  className="form-select hindi-k010-textbox"
                  value={formData.SROName}
                  onChange={handleSROChange}
                  required
                >
                  <option value="">pquko djsa</option>
                  {sroList.map((s) => (
                    <option key={s.id} value={s.SROffice}>
                      {s.SROffice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Case No */}
              <div className="col-md-4">
                <label htmlFor="CaseNo" className="form-label">
                  Case No
                </label>
                <input
                  id="CaseNo"
                  name="CaseNo"
                  type="text"
                  className="form-control hindi-k010-textbox"
                  value={formData.CaseNo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Case Year */}
              <div className="col-md-4">
                <label htmlFor="CaseYear" className="form-label">
                  Case Year
                </label>
                <input
                  id="CaseYear"
                  name="CaseYear"
                  type="number"
                  className="form-control hindi-k010-textbox"
                  value={formData.CaseYear}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mt-2">
              {/* Case Registered Date */}
              <div className="col-md-4">
                <label htmlFor="CaseRegistredDate" className="form-label">
                  Case Registered Date
                </label>
                <input
                  id="CaseRegistredDate"
                  name="CaseRegistredDate"
                  type="date"
                  className="form-control"
                  value={formData.CaseRegistredDate}
                  onChange={handleChange}
                />
              </div>

              {/* Case Type */}
              <div className="col-md-4">
                <label htmlFor="CaseType" className="form-label">
                  Case Type
                </label>
                <select
                  id="CaseType"
                  name="CaseType"
                  className="form-select hindi-k010-textbox"
                  value={formData.CaseType}
                  onChange={handleChange}
                  required
                >
                  <option value="">dsl izdkj</option>
                  {caseTypes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Number */}
              <div className="col-md-4">
                <label htmlFor="DocumentNumber" className="form-label">
                  Document Number
                </label>
                <input
                  id="DocumentNumber"
                  name="DocumentNumber"
                  type="text"
                  className="form-control hindi-k010-textbox"
                  value={formData.DocumentNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mt-2">
              {/* Document Date */}
              <div className="col-md-4">
                <label htmlFor="DocumentDate" className="form-label">
                  Document Date
                </label>
                <input
                  id="DocumentDate"
                  name="DocumentDate"
                  type="date"
                  className="form-control"
                  value={formData.DocumentDate}
                  onChange={handleChange}
                />
              </div>

              {/* First Party */}
              <div className="col-md-4">
                <label htmlFor="FirstParty" className="form-label">
                  First Party
                </label>
                <input
                  id="FirstParty"
                  name="FirstParty"
                  type="text"
                  className="form-control hindi-k010-textbox"
                  value={formData.FirstParty}
                  onChange={handleChange}
                />
              </div>

              {/* Second Party */}
              <div className="col-md-4">
                <label htmlFor="SecondParty" className="form-label">
                  Second Party
                </label>
                <input
                  id="SecondParty"
                  name="SecondParty"
                  type="text"
                  className="form-control hindi-k010-textbox"
                  value={formData.SecondParty}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                Save Case
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
