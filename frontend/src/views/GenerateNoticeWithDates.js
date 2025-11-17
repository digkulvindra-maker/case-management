// src/views/GenerateNoticeWithDates.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/HindiFont.css";

export default function GenerateNoticeWithDates() {
  const [casesList, setCasesList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [valuation, setValuation] = useState(null);
  const [format, setFormat] = useState("docx");
  const [loading, setLoading] = useState(false);
  const [generatedList, setGeneratedList] = useState([]);

  // compute date strings
  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isoTomorrow = tomorrow.toISOString().split("T")[0];

  // date fields in state
  const [noticeDate, setNoticeDate] = useState(isoToday);
  const [hiringDate, setHiringDate] = useState(isoTomorrow);

  const baseURL = "http://192.168.1.102:5000";

  // 🧠 Load all cases
  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await axios.get(`${baseURL}/api/cases`);
        setCasesList(res.data || []);
      } catch (err) {
        console.error("Error fetching cases:", err);
        Swal.fire("Error", "Failed to load cases list", "error");
      }
    }
    fetchCases();
  }, []);

  // 📦 Load selected case details
  useEffect(() => {
    if (!selectedCaseId) {
      setCaseData(null);
      setValuation(null);
      setGeneratedList([]);
      return;
    }
    async function fetchCaseDetails() {
      try {
        const [caseRes, noticesRes] = await Promise.all([
          axios.get(`${baseURL}/api/case/${selectedCaseId}`),
          axios.get(`${baseURL}/api/generated-notices/${selectedCaseId}`),
        ]);
        setCaseData(caseRes.data.case || null);
        setValuation(caseRes.data.valuation || null);
        setGeneratedList(noticesRes.data || []);
      } catch (err) {
        console.error("Error loading case details or notices:", err);
        Swal.fire("Error", "Failed to load case details or notices", "error");
      }
    }
    fetchCaseDetails();
  }, [selectedCaseId]);

  // 🧩 Validation
  const isNoticeDateValid = (d) => new Date(d) <= new Date(isoToday + "T23:59:59");
  const isHiringDateValid = (d) => new Date(d) > new Date(isoToday + "T23:59:59");

  const canGenerate = () =>
    selectedCaseId && isNoticeDateValid(noticeDate) && isHiringDateValid(hiringDate) && !loading;

  // ⚙️ Generate Notice
  const handleGenerate = async () => {
    if (!selectedCaseId) {
      Swal.fire("Select Case", "Please select a case before generating.", "warning");
      return;
    }
    if (!isNoticeDateValid(noticeDate)) {
      Swal.fire("Invalid Notice Date", "Notice Generation Date cannot be in the future.", "warning");
      return;
    }
    if (!isHiringDateValid(hiringDate)) {
      Swal.fire("Invalid Hearing Date", "Hearing Date must be after today.", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = { caseId: selectedCaseId, format, noticeDate, hiringDate };
      const res = await axios.post(`${baseURL}/api/generate-notice-with-dates`, payload, {
        timeout: 120000,
      });

      if (res.data?.filePath) {
        Swal.fire("Generated", "Notice generated successfully.", "success");
        const updated = await axios.get(`${baseURL}/api/generated-notices/${selectedCaseId}`);
        setGeneratedList(updated.data || []);
      } else {
        Swal.fire("Error", "Server did not return a file path.", "error");
      }
    } catch (err) {
      console.error("Error generating notice:", err);
      Swal.fire("Error", "Failed to generate notice. Check server logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Remove generated row
  const handleRemoveRow = (id) => {
    setGeneratedList((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        {/* 🟨 Header */}
        <div className="card-header bg-warning text-dark fw-bold">
          📄 Generate Notice
        </div>

        {/* 🧾 Body */}
        <div className="card-body">

          {/* 🔹 Section 1: Case Selection + File Format */}
          <div className="mb-4">
            <h6 className="fw-bold border-bottom pb-1">Select Case & Format</h6>
            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Select Case</label>
                <select
                  className="form-select hindi-k010-textbox"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                >
                  <option value="">-- dsl pqus --</option>
                  {casesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.CaseNo}@{c.CaseYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">File Format</label>
                <select
                  className="form-select"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="docx">Word (DOCX)</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleGenerate}
                  disabled={!canGenerate()}
                >
                  {loading ? "Generating..." : "Generate Notice"}
                </button>
              </div>
            </div>
          </div>

          {/* 🔹 Section 2: Dates */}
          <div className="mb-4">
            <h6 className="fw-bold border-bottom pb-1">Dates</h6>
            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label">Notice Generation Date</label>
                <input
                  type="date"
                  className={`form-control ${!isNoticeDateValid(noticeDate) ? "is-invalid" : ""}`}
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                  max={isoToday}
                />
                {!isNoticeDateValid(noticeDate) && (
                  <div className="invalid-feedback">Notice date cannot be in the future.</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Hearing Date</label>
                <input
                  type="date"
                  className={`form-control ${!isHiringDateValid(hiringDate) ? "is-invalid" : ""}`}
                  value={hiringDate}
                  onChange={(e) => setHiringDate(e.target.value)}
                  min={isoTomorrow}
                />
                {!isHiringDateValid(hiringDate) && (
                  <div className="invalid-feedback">Hearing date must be after today.</div>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 Section 3: Case Details */}
          {caseData && (
            <div className="mb-4">
              <h6 className="fw-bold border-bottom pb-1">Case Details</h6>
              <div className="border p-3 bg-light rounded">
                <div className="row">
                  <div className="col-md-4">
                    <strong>Case No:</strong>{" "}
                   <span className="hindi-k010-textbox"> {caseData.CaseNo}@{caseData.CaseYear}</span>
                  </div>
                  <div className="col-md-4">
                    <strong>SRO:</strong> <span className="hindi-k010-textbox">{caseData.SROName}</span>
                  </div>
                  <div className="col-md-4">
                    <strong>District:</strong> <span className="hindi-k010-textbox">{caseData.District}</span>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-4">
                    <strong>First Party:</strong> <span className="hindi-k010-textbox">{caseData.FirstParty}</span>
                  </div>
                  <div className="col-md-4">
                    <strong>Second Party:</strong> <span className="hindi-k010-textbox">{caseData.SecondParty}</span>
                  </div>
                  <div className="col-md-4">
                    <strong>Case Type:</strong> <span className="hindi-k010-textbox">{caseData.CaseType}</span>
                  </div>
                </div>

                {valuation && (
                  <>
                    <hr />
                    <h6>Valuation Summary</h6>
                    <div className="row">
                      <div className="col-md-2"><strong>Pre Amt:</strong> {valuation.PreAmt ?? 0}</div>
                      <div className="col-md-2"><strong>After Amt:</strong> {valuation.AfterAmt ?? 0}</div>
                      <div className="col-md-2"><strong>Pre Total:</strong> {valuation.PreTotal ?? 0}</div>
                      <div className="col-md-2"><strong>After Total:</strong> {valuation.AfterTotal ?? 0}</div>
                      <div className="col-md-2">
                        <strong>Balance Total:</strong>{" "}
                        {(valuation.AfterTotal ?? 0) - (valuation.PreTotal ?? 0)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 🔹 Section 4: Generated Notices */}
          <div className="mb-2">
            <h6 className="fw-bold border-bottom pb-1">Generated Notices</h6>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-warning text-dark">
                  <tr>
                    <th>Notice Date</th>
                    <th>Hearing Date</th>
                    <th>Format</th>
                    <th>Actions / Download</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedList.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No generated notices yet.
                      </td>
                    </tr>
                  )}
                  {generatedList.map((row) => (
                    <tr key={row.id}>
                      <td>{row.NoticeDate}</td>
                      <td>{row.HiringDate}</td>
                      <td>{row.Format}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <a
                            href={`${baseURL}/${row.FilePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm"
                          >
                            ⬇️ Download
                          </a>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemoveRow(row.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
