// src/views/NoticeLetterGenerator.js
import React, { useEffect, useState } from "react";
import axios from "axios";

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
        const res = await axios.get("http://localhost:5000/api/cases");
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
        const res = await axios.get(`http://localhost:5000/api/case/${selectedCaseId}`);
        setCaseData(res.data);
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
      const res = await axios.post("http://localhost:5000/api/generate-notice", {
        caseId: selectedCaseId,
        format,
      });
      if (res.data?.filePath) {
        setDownloadLink(`http://localhost:5000/${res.data.filePath}`);
      }
    } catch (err) {
      console.error("Error generating notice:", err);
      alert("Error generating notice letter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 p-4 shadow bg-white rounded">
      <h4 className="mb-3 text-primary fw-bold">📄 Notice Letter Generator</h4>

      {/* Select Case */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Select Case:</label>
        <select
          className="form-select"
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
        >
          <option value="">-- Choose a Case --</option>
          {casesList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.CaseNo}\{c.CaseYear} — {c.FirstParty} vs {c.SecondParty}
            </option>
          ))}
        </select>
      </div>

      {/* Case Summary */}
      {caseData && (
        <div className="border p-3 mb-3 rounded bg-light">
          <h6>Case Details</h6>
          <p><strong>Case No:</strong> {caseData.CaseNo}\{caseData.CaseYear}</p>
          <p><strong>First Party:</strong> {caseData.FirstParty}</p>
          <p><strong>Second Party:</strong> {caseData.SecondParty}</p>
          <p><strong>Type:</strong> {caseData.CaseType}</p>
        </div>
      )}

      {/* Select Format */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Select File Format:</label>
        <div>
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

      {/* Generate Button */}
      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Notice Letter"}
      </button>

      {/* Download Link */}
      {downloadLink && (
        <div className="mt-4">
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success"
          >
            ⬇️ Download Notice ({format.toUpperCase()})
          </a>
        </div>
      )}
    </div>
  );
}
