// src/views/NoticeLetterGenerator.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/HindiFont.css";

export default function NoticeLetterGenerator() {
  const [casesList, setCasesList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [format, setFormat] = useState("docx");
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  // 🧠 Load all cases
  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await axios.get("http://192.168.1.102:5000/api/cases");
        setCasesList(res.data);
      } catch (err) {
        console.error("Error fetching cases:", err);
      }
    }
    fetchCases();
  }, []);

  // 📦 Load selected case details
  useEffect(() => {
    async function fetchCaseDetails() {
      if (!selectedCaseId) return;
      try {
        const res = await axios.get(`http://192.168.1.102:5000/api/case/${selectedCaseId}`);
        setCaseData(res.data.case);
      } catch (err) {
        console.error("Error loading case data:", err);
      }
    }
    fetchCaseDetails();
  }, [selectedCaseId]);

  // ⚙️ Generate Notice Letter
  const handleGenerate = async () => {
    if (!selectedCaseId) {
      alert("Please select a case first!");
      return;
    }

    setLoading(true);
    setDownloadLink("");
    try {
      const res = await axios.post("http://192.168.1.102:5000/api/generate-notice", {
        caseId: selectedCaseId,
        format,
      });
      if (res.data?.filePath) {
        setDownloadLink(`http://192.168.1.102:5000/${res.data.filePath}`);
      }
    } catch (err) {
      console.error("Error generating notice:", err);
      alert("Error generating notice letter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-3 bg-light rounded">
      <div className="card shadow-lg border-0">
        {/* 🟨 Card Header */}
        <div className="card-header bg-warning text-dark fw-bold">
          📄 Order Sheet
        </div>

        {/* 🧾 Card Body */}
        <div className="card-body">

          {/* 🔹 Section 1: Select Case */}
          <div className="mb-4">
            <h6 className="text-dark fw-bold border-bottom pb-1">Select Case</h6>
            <select
              className="form-select w-50 hindi-k010-textbox"
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

          {/* 🔹 Section 2: Case Details */}
          {caseData && (
            <div className="mb-4">
              <h6 className="text-dark fw-bold border-bottom pb-1">Case Details</h6>
              <div className="p-3 bg-light border rounded hindi-k010-textbox">
                <p><strong>Case No:</strong> <span className="hindi-k010-textbox">{caseData.CaseNo}@{caseData.CaseYear}</span></p>
                <p><strong>First Party:</strong> <span className="hindi-k010-textbox">{caseData.FirstParty}</span></p>
                <p><strong>Second Party:</strong> <span className="hindi-k010-textbox">{caseData.SecondParty}</span></p>
                <p><strong>Type:</strong> <span className="hindi-k010-textbox">{caseData.CaseType}</span></p>
              </div>
            </div>
          )}

          {/* 🔹 Section 3: Select File Format */}
          <div className="mb-4">
            <h6 className="text-dark fw-bold border-bottom pb-1">Select File Format</h6>
            <div className="ms-1">
              <label className="me-3">
                <input
                  type="radio"
                  value="docx"
                  checked={format === "docx"}
                  onChange={(e) => setFormat(e.target.value)}
                />{" "}
                Word (DOCX)
              </label>
              <label>
                <input
                  type="radio"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={(e) => setFormat(e.target.value)}
                />{" "}
                PDF
              </label>
            </div>
          </div>

          {/* 🔹 Section 4: Generate Button & Download Link */}
          <div className="d-flex align-items-center gap-3 mt-3">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Notice Letter"}
            </button>

            {downloadLink && (
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                ⬇️ Download Order Sheet ({format.toUpperCase()})
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
