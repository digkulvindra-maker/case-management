// src/views/ValuationReport.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/HindiFont.css";

export default function ValuationReport() {
  const baseURL = "http://192.168.1.102:5000";

  const [casesList, setCasesList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  // Load OTHER cases (vU; only)
  useEffect(() => {
    async function loadCases() {
      try {
        const res = await axios.get(`${baseURL}/api/cases/other`);
        setCasesList(res.data || []);
      } catch (err) {
        console.error("Error loading cases:", err);
        Swal.fire("Error", "Failed to load cases", "error");
      }
    }
    loadCases();
  }, []);

  // Load selected case details
  useEffect(() => {
    if (!selectedCaseId) {
      setCaseData(null);
      setDownloadUrl("");
      return;
    }

    async function loadCase() {
      try {
        const res = await axios.get(`${baseURL}/api/case/${selectedCaseId}`);
        setCaseData(res.data.case || null);
      } catch (err) {
        console.error("Error loading case details:", err);
      }
    }

    loadCase();
  }, [selectedCaseId]);

  // Generate Valuation Report
  const handleGenerate = async () => {
    if (!selectedCaseId) {
      Swal.fire("Select Case", "Please select a case first.", "warning");
      return;
    }

    setLoading(true);
    setDownloadUrl("");

    try {
      // DO NOT use responseType: "blob" here
      const res = await axios.post(
        `${baseURL}/api/generate-valuation-report`,
        { caseId: selectedCaseId }
      );

      if (!res.data.filePath) {
        Swal.fire("Error", "Invalid response from server.", "error");
        return;
      }

      // Create full file download URL
      // const fileURL = `${baseURL}/${res.data.filePath}`;
      const fileURL = `${baseURL}/${res.data.filePath.replace(/\\/g, "/")}`;

      setDownloadUrl(fileURL);

      Swal.fire("Success", "Valuation Report generated!", "success");

    } catch (err) {
      console.error("Error generating report:", err);
      Swal.fire("Error", "Failed to generate report.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-3 bg-light rounded">
      <div className="card shadow-lg border-0">

        <div className="card-header bg-info text-dark fw-bold">
          📄 Valuation Report Generator
        </div>

        <div className="card-body">

          {/* Case Selection */}
          <div className="mb-4">
            <h6 className="fw-bold border-bottom pb-1">Select Case</h6>
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

          {/* Case Details */}
          {caseData && (
            <div className="mb-4">
              <h6 className="fw-bold border-bottom pb-1">Case Details</h6>
              <div className="p-3 bg-light border rounded hindi-k010-textbox">
                <p><strong>Case No:</strong> <sapn className="hindi-k010-textbox">{caseData.CaseNo}@{caseData.CaseYear}</sapn></p>
                <p><strong>SRO:</strong> <sapn className="hindi-k010-textbox">{caseData.SROName}</sapn></p>
                <p><strong>First Party:</strong> <sapn className="hindi-k010-textbox">{caseData.FirstParty}</sapn></p>
                <p><strong>Second Party:</strong> <sapn className="hindi-k010-textbox">{caseData.SecondParty}</sapn></p>
                <p><strong>Document Date:</strong> {new Date(caseData.DocumentDate).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="d-flex align-items-center gap-3 mt-3">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Valuation Report"}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="ValuationReport.docx"
                className="btn btn-success"
              >
                ⬇️ Download Report (DOCX)
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
