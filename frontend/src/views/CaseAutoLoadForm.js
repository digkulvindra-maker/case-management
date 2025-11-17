// // src/views/CaseAutoLoadForm.js
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import "../styles/HindiFont.css";
// import { useHistory } from "react-router-dom";

// export default function CaseAutoLoadForm() {
//   const [casesList, setCasesList] = useState([]);
//   const [selectedCaseId, setSelectedCaseId] = useState("");
//   const [locked, setLocked] = useState(false);
//   const history = useHistory();
//   const [msg, setMsg] = useState("");

//   const [caseInfo, setCaseInfo] = useState({
//     SROName: "",
//     CaseNo: "",
//     CaseYear: "",
//     CaseRegistredDate: "",
//     CaseType: "",
//     DocumentNumber: "",
//     DocumentDate: "",
//     Property: "",
//   });

//   const [parties, setParties] = useState({
//     FirstParty: "",
//     FirstPartyAddress: "",
//     FirstParty1: "",
//     FirstParty1Address: "",
//     SecondParty: "",
//     SecondPartyAddress: "",
//     SecondParty1: "",
//     SecondParty1Address: "",
//   });

//   const [valuation, setValuation] = useState({
//     PreAmt: "", PreSD: "", PreSur1: "", PreSur2: "", PreSur3: "", PreRF: "", PreTotal: "",
//     AfterAmt: "", AfterSD: "", AfterSur1: "", AfterSur2: "", AfterSur3: "", AfterRF: "", AfterTotal: "",
//     BalanceSD: "", BalanceSur1: "", BalanceSur2: "", BalanceSur3: "", BalanceRF: "", BalanceTotal: "",
//     DecisionSD: "", DecisionSur1: "", DecisionSur2: "", DecisionSur3: "", DecisionRF: "", DecisionTotal: "",
//     DecisionPen: ""
//   });

//   useEffect(() => {
//     axios.get("http://192.168.1.102:5000/api/cases")
//       .then(res => setCasesList(res.data || []))
//       .catch(err => {
//         console.error("Error loading cases list:", err);
//         setMsg("Error loading cases list");
//       });
//   }, []);

//   const handleCaseSelect = (e) => {
//     const caseId = e.target.value;
//     setSelectedCaseId(caseId);
//     setMsg("");
//     if (!caseId) {
//       setLocked(false);
//       return;
//     }

//     axios.get(`http://192.168.1.102:5000/api/case/${caseId}`)
//       .then(res => {
//         const data = res.data || {};
//         const c = data.case || {};
//         const v = data.valuation || {};
//         setCaseInfo({
//           SROName: c.SROName || "",
//           CaseNo: c.CaseNo || "",
//           CaseYear: c.CaseYear || "",
//           CaseRegistredDate: c.CaseRegistredDate ? c.CaseRegistredDate.split("T")[0] : "",
//           CaseType: c.CaseType || "",
//           DocumentNumber: c.DocumentNumber || "",
//           DocumentDate: c.DocumentDate ? c.DocumentDate.split("T")[0] : "",
//           Property: c.Property || ""
//         });
//         setParties({
//           FirstParty: c.FirstParty || "",
//           FirstPartyAddress: c.FirstPartyAddress || "",
//           FirstParty1: c.FirstParty1 || "",
//           FirstParty1Address: c.FirstParty1Address || "",
//           SecondParty: c.SecondParty || "",
//           SecondPartyAddress: c.SecondPartyAddress || "",
//           SecondParty1: c.SecondParty1 || "",
//           SecondParty1Address: c.SecondParty1Address || ""
//         });
//         setValuation({
//           PreAmt: v.PreAmt ?? "",
//           PreSD: v.PreSD ?? "",
//           PreSur1: v.PreSur1 ?? "",
//           PreSur2: v.PreSur2 ?? "",
//           PreSur3: v.PreSur3 ?? "",
//           PreRF: v.PreRF ?? "",
//           PreTotal: v.PreTotal ?? "",
//           AfterAmt: v.AfterAmt ?? "",
//           AfterSD: v.AfterSD ?? "",
//           AfterSur1: v.AfterSur1 ?? "",
//           AfterSur2: v.AfterSur2 ?? "",
//           AfterSur3: v.AfterSur3 ?? "",
//           AfterRF: v.AfterRF ?? "",
//           AfterTotal: v.AfterTotal ?? "",
//           BalanceSD: v.BalanceSD ?? "",
//           BalanceSur1: v.BalanceSur1 ?? "",
//           BalanceSur2: v.BalanceSur2 ?? "",
//           BalanceSur3: v.BalanceSur3 ?? "",
//           BalanceRF: v.BalanceRF ?? "",
//           BalanceTotal: v.BalanceTotal ?? "",
//           DecisionSD: v.DecisionSD ?? "",
//           DecisionSur1: v.DecisionSur1 ?? "",
//           DecisionSur2: v.DecisionSur2 ?? "",
//           DecisionSur3: v.DecisionSur3 ?? "",
//           DecisionRF: v.DecisionRF ?? "",
//           DecisionTotal: v.DecisionTotal ?? "",
//           DecisionPen: v.DecisionPen ?? ""
//         });
//         setLocked(!!v.Locked);
//       })
//       .catch(err => {
//         console.error("Error loading case details:", err);
//         Swal.fire({ icon: "error", title: "Load Failed", text: "Failed to load case details." });
//       });
//   };

//   const handleCaseInfoChange = (e) => {
//     if (locked) return;
//     const { name, value } = e.target;
//     setCaseInfo(prev => ({ ...prev, [name]: value }));
//   };

//   const handlePartyChange = (e) => {
//     if (locked) return;
//     const { name, value } = e.target;
//     setParties(prev => ({ ...prev, [name]: value }));
//   };

//   const handleValuationChange = (e) => {
//     if (locked) return;
//     const { name, value } = e.target;
//     const val = value === "" ? "" : parseFloat(value);
//     setValuation(prev => {
//       const updated = { ...prev, [name]: val };
//       const num = (x) => (x === "" || x == null || isNaN(x) ? 0 : parseFloat(x));
//       const pre = { SD: num(updated.PreSD), Sur1: num(updated.PreSur1), Sur2: num(updated.PreSur2), Sur3: num(updated.PreSur3), RF: num(updated.PreRF) };
//       const after = { SD: num(updated.AfterSD), Sur1: num(updated.AfterSur1), Sur2: num(updated.AfterSur2), Sur3: num(updated.AfterSur3), RF: num(updated.AfterRF) };
//       updated.PreTotal = pre.SD + pre.Sur1 + pre.Sur2 + pre.Sur3 + pre.RF;
//       updated.AfterTotal = after.SD + after.Sur1 + after.Sur2 + after.Sur3 + after.RF;
//       updated.BalanceSD = after.SD - pre.SD;
//       updated.BalanceSur1 = after.Sur1 - pre.Sur1;
//       updated.BalanceSur2 = after.Sur2 - pre.Sur2;
//       updated.BalanceSur3 = after.Sur3 - pre.Sur3;
//       updated.BalanceRF = after.RF - pre.RF;
//       updated.BalanceTotal = updated.AfterTotal - updated.PreTotal;
//       return updated;
//     });
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!selectedCaseId) {
//       Swal.fire({ icon: "warning", title: "No Case Selected", text: "Please select a case first." });
//       return;
//     }

//     try {
//       const payload = { caseId: selectedCaseId, caseInfo, parties, valuation };
//       const res = await axios.post("http://192.168.1.102:5000/api/case-details", payload);
//       Swal.fire({ icon: "success", title: "Saved", text: res?.data?.message || "Case details saved successfully!" });
//     } catch (err) {
//       console.error("Error saving details:", err);
//       Swal.fire({ icon: "error", title: "Save Failed", text: err?.response?.data?.message || "Error saving case details." });
//     }
//   };

//   const handleLock = async () => {
//     if (!selectedCaseId) {
//       Swal.fire("Error", "Please select a case first.", "warning");
//       return;
//     }

//     const confirm = await Swal.fire({
//       title: "Lock this case?",
//       text: "Once locked, you won’t be able to edit it again.",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, lock it",
//       cancelButtonText: "Cancel",
//     });

//     if (!confirm.isConfirmed) return;

//     try {
//       await axios.post(`http://192.168.1.102:5000/api/lock-case/${selectedCaseId}`);
//       setLocked(true);
//       Swal.fire("Locked!", "This case is now locked and cannot be edited.", "success");
//     } catch (err) {
//       Swal.fire("Error", "Failed to lock case.", "error");
//     }
//   };

//   const numInput = (name, value, onChange, placeholder = "", readOnly = false, warning = false) => (
//     <div className="d-flex flex-column">
//       {warning && <small className="text-danger fw-bold mb-1">Invalid Value</small>}
//       <input
//         name={name}
//         value={value ?? ""}
//         onChange={onChange}
//         type="number"
//         step="1"
//         className={`form-control ${warning ? "bg-danger-subtle border-danger text-dark" : ""}`}
//         placeholder={placeholder}
//         readOnly={locked || readOnly}
//       />
//     </div>
//   );

//   return (
//     <div className="container my-4">
//       <div className="card shadow-sm">
//         <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
//           <h4 className="card-title mb-0">Case Auto-Load Form</h4>
//           {locked && <span className="badge bg-success">Locked</span>}
//         </div>
//         <div className="card-body">
//           {msg && <div className="alert alert-info">{msg}</div>}

//           <div className="mb-3">
//             <label className="form-label">Select Case</label>
//             <select className="form-select hindi-k010-textbox" value={selectedCaseId} onChange={handleCaseSelect}>
//               <option value="">-- dsl pqus --</option>
//               {casesList.map(c => (
//                 <option key={c.id} value={c.id}>{c.CaseNo} @ {c.CaseYear}</option>
//               ))}
//             </select>
//           </div>

//           {/* === ALL YOUR INPUT SECTIONS BELOW REMAIN SAME === */}
//           {/* Case Info, Parties, Valuation, etc. untouched */}

//           <form onSubmit={handleSave}>
//             <h5>Case Info</h5>
//             <div className="row g-3 mb-3">
//               <div className="col-md-3">
//                 <label className="form-label">SRO Name</label>
//                 <input name="SROName" className="form-control hindi-k010-textbox" value={caseInfo.SROName} onChange={handleCaseInfoChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label className="form-label">Case No</label>
//                 <input name="CaseNo" className="form-control hindi-k010-textbox" value={caseInfo.CaseNo} onChange={handleCaseInfoChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label className="form-label">Case Year</label>
//                 <input name="CaseYear" type="number" className="form-control hindi-k010-textbox" value={caseInfo.CaseYear} onChange={handleCaseInfoChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label className="form-label">Case Registered Date</label>
//                 <input name="CaseRegistredDate" type="date" className="form-control" value={caseInfo.CaseRegistredDate} onChange={handleCaseInfoChange} readOnly />
//               </div>

//               <div className="col-md-3">
//                 <label className="form-label">Case Type</label>
//                 <input name="CaseType" className="form-control hindi-k010-textbox" value={caseInfo.CaseType} onChange={handleCaseInfoChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label className="form-label">Document Number</label>
//                 <input name="DocumentNumber" className="form-control hindi-k010-textbox" value={caseInfo.DocumentNumber} onChange={handleCaseInfoChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label className="form-label">Document Date</label>
//                 <input name="DocumentDate" type="date" className="form-control" value={caseInfo.DocumentDate} onChange={handleCaseInfoChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label className="form-label">Property</label>
//                 <input name="Property" className="form-control hindi-k010-textbox" value={caseInfo.Property} onChange={handleCaseInfoChange} readOnly />
//               </div>
//             </div>

//             <h5>Parties (saved into Cases table)</h5>
//             <div className="row g-3 mb-3">
//               <div className="col-md-3">
//                 <label>First Party Name</label>
//                 <input name="FirstParty" className="form-control hindi-k010-textbox" value={parties.FirstParty} onChange={handlePartyChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label>First Party Address</label>
//                 <input name="FirstPartyAddress" className="form-control hindi-k010-textbox" value={parties.FirstPartyAddress} onChange={handlePartyChange} readOnly={locked} />
//               </div>
//               <div className="col-md-3">
//                 <label>First Party1 Name</label>
//                 <input name="FirstParty1" className="form-control hindi-k010-textbox" value={parties.FirstParty1} onChange={handlePartyChange} readOnly={locked} />
//               </div>
//               <div className="col-md-3">
//                 <label>First Party1 Address</label>
//                 <input name="FirstParty1Address" className="form-control hindi-k010-textbox" value={parties.FirstParty1Address} onChange={handlePartyChange} readOnly={locked} />
//               </div>

//               <div className="col-md-3">
//                 <label>Second Party Name</label>
//                 <input name="SecondParty" className="form-control hindi-k010-textbox" value={parties.SecondParty} onChange={handlePartyChange} readOnly />
//               </div>
//               <div className="col-md-3">
//                 <label>Second Party Address</label>
//                 <input name="SecondPartyAddress" className="form-control hindi-k010-textbox" value={parties.SecondPartyAddress} onChange={handlePartyChange} readOnly={locked} />
//               </div>
//               <div className="col-md-3">
//                 <label>Second Party1 Name</label>
//                 <input name="SecondParty1" className="form-control hindi-k010-textbox" value={parties.SecondParty1} onChange={handlePartyChange} readOnly={locked} />
//               </div>
//               <div className="col-md-3">
//                 <label>Second Party1 Address</label>
//                 <input name="SecondParty1Address" className="form-control hindi-k010-textbox" value={parties.SecondParty1Address} onChange={handlePartyChange} readOnly={locked} />
//               </div>
//             </div>

//             <h5>Charges / Stamp Duty</h5>

//             <div className="mb-2"><strong>1) Pre Valuation</strong></div>
//             <div className="row g-3 mb-3">
//               <div className="col-md-2"><label>Pre Valuation Amount</label>{numInput("PreAmt", valuation.PreAmt, handleValuationChange)}</div>
//             </div>
//             <div className="row g-3 mb-3">
//               <div className="col-md-2"><label>Pre SD</label>{numInput("PreSD", valuation.PreSD, handleValuationChange)}</div>
//               <div className="col-md-2"><label>Pre Sur1</label>{numInput("PreSur1", valuation.PreSur1, handleValuationChange)}</div>
//               <div className="col-md-2"><label>Pre Sur2</label>{numInput("PreSur2", valuation.PreSur2, handleValuationChange)}</div>
//               <div className="col-md-2"><label>Pre Sur3</label>{numInput("PreSur3", valuation.PreSur3, handleValuationChange)}</div>
//               <div className="col-md-2"><label>Pre RF</label>{numInput("PreRF", valuation.PreRF, handleValuationChange)}</div>
//               <div className="col-md-2"><label>Pre Total</label>{numInput("PreTotal", valuation.PreTotal, handleValuationChange, "", true)}</div>
//             </div>

//             <div className="mb-2"><strong>2) After Valuation</strong></div>
//             <div className="row g-3 mb-3">
//               <div className="col-md-2"><label>After Valuation Amount</label>{numInput("AfterAmt", valuation.AfterAmt, handleValuationChange)}</div>
//             </div>
//             <div className="row g-3 mb-3">
//               <div className="col-md-2"><label>After SD</label>{numInput("AfterSD", valuation.AfterSD, handleValuationChange)}</div>
//               <div className="col-md-2"><label>After Sur1</label>{numInput("AfterSur1", valuation.AfterSur1, handleValuationChange)}</div>
//               <div className="col-md-2"><label>After Sur2</label>{numInput("AfterSur2", valuation.AfterSur2, handleValuationChange)}</div>
//               <div className="col-md-2"><label>After Sur3</label>{numInput("AfterSur3", valuation.AfterSur3, handleValuationChange)}</div>
//               <div className="col-md-2"><label>After RF</label>{numInput("AfterRF", valuation.AfterRF, handleValuationChange)}</div>
//               <div className="col-md-2"><label>After Total</label>{numInput("AfterTotal", valuation.AfterTotal, handleValuationChange, "", true)}</div>
//             </div>

//             <div className="mb-2"><strong>3) Balance Valuation</strong></div>
//             <div className="row g-3 mb-3">
//               <div className="col-md-2"><label>Balance SD</label>{numInput("BalanceSD", valuation.BalanceSD, handleValuationChange, "", true, valuation.BalanceSD < 0)}</div>
//               <div className="col-md-2"><label>Balance Sur1</label>{numInput("BalanceSur1", valuation.BalanceSur1, handleValuationChange, "", true, valuation.BalanceSur1 < 0)}</div>
//               <div className="col-md-2"><label>Balance Sur2</label>{numInput("BalanceSur2", valuation.BalanceSur2, handleValuationChange, "", true, valuation.BalanceSur2 < 0)}</div>
//               <div className="col-md-2"><label>Balance Sur3</label>{numInput("BalanceSur3", valuation.BalanceSur3, handleValuationChange, "", true, valuation.BalanceSur3 < 0)}</div>
//               <div className="col-md-2"><label>Balance RF</label>{numInput("BalanceRF", valuation.BalanceRF, handleValuationChange, "", true, valuation.BalanceRF < 0)}</div>
//               <div className="col-md-2"><label>Balance Total</label>{numInput("BalanceTotal", valuation.BalanceTotal, handleValuationChange, "", true, valuation.BalanceTotal < 0)}</div>
//             </div>


//             {!locked && (
//               <div className="mt-3 d-flex justify-content-end gap-2">
//                 <button type="submit" className="btn btn-primary">💾 Save Details</button>
//                 <button type="button" className="btn btn-warning" onClick={handleLock}>🔒 Lock Data</button>
//               </div>
//             )}
//             {locked && <div className="alert alert-success mt-3">✅ This case is locked and cannot be edited.</div>}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/views/CaseAutoLoadForm.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/HindiFont.css";
import { useHistory } from "react-router-dom";

export default function CaseAutoLoadForm() {
  const [casesList, setCasesList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [locked, setLocked] = useState(false);
  const history = useHistory();
  const [msg, setMsg] = useState("");

  const [caseInfo, setCaseInfo] = useState({
    SROName: "",
    CaseNo: "",
    CaseYear: "",
    CaseRegistredDate: "",
    CaseType: "",
    DocumentNumber: "",
    DocumentDate: "",
    Property: "",
  });

  const [parties, setParties] = useState({
    FirstParty: "",
    FirstPartyAddress: "",
    FirstParty1: "",
    FirstParty1Address: "",
    SecondParty: "",
    SecondPartyAddress: "",
    SecondParty1: "",
    SecondParty1Address: "",
  });

  const [valuation, setValuation] = useState({
    PreAmt: "", PreSD: "", PreSur1: "", PreSur2: "", PreSur3: "", PreRF: "", PreTotal: "",
    AfterAmt: "", AfterSD: "", AfterSur1: "", AfterSur2: "", AfterSur3: "", AfterRF: "", AfterTotal: "",
    BalanceSD: "", BalanceSur1: "", BalanceSur2: "", BalanceSur3: "", BalanceRF: "", BalanceTotal: "",
    DecisionSD: "", DecisionSur1: "", DecisionSur2: "", DecisionSur3: "", DecisionRF: "", DecisionTotal: "",
    DecisionPen: ""
  });

  useEffect(() => {
    axios.get("http://192.168.1.102:5000/api/cases")
      .then(res => setCasesList(res.data || []))
      .catch(err => {
        console.error("Error loading cases list:", err);
        setMsg("Error loading cases list");
      });
  }, []);

  const handleCaseSelect = (e) => {
    const caseId = e.target.value;
    setSelectedCaseId(caseId);
    setMsg("");
    if (!caseId) {
      setLocked(false);
      return;
    }

    axios.get(`http://192.168.1.102:5000/api/case/${caseId}`)
      .then(res => {
        const data = res.data || {};
        const c = data.case || {};
        const v = data.valuation || {};
        setCaseInfo({
          SROName: c.SROName || "",
          CaseNo: c.CaseNo || "",
          CaseYear: c.CaseYear || "",
          CaseRegistredDate: c.CaseRegistredDate ? c.CaseRegistredDate.split("T")[0] : "",
          CaseType: c.CaseType || "",
          DocumentNumber: c.DocumentNumber || "",
          DocumentDate: c.DocumentDate ? c.DocumentDate.split("T")[0] : "",
          Property: c.Property || ""
        });
        setParties({
          FirstParty: c.FirstParty || "",
          FirstPartyAddress: c.FirstPartyAddress || "",
          FirstParty1: c.FirstParty1 || "",
          FirstParty1Address: c.FirstParty1Address || "",
          SecondParty: c.SecondParty || "",
          SecondPartyAddress: c.SecondPartyAddress || "",
          SecondParty1: c.SecondParty1 || "",
          SecondParty1Address: c.SecondParty1Address || ""
        });
        setValuation({
          PreAmt: v.PreAmt ?? "",
          PreSD: v.PreSD ?? "",
          PreSur1: v.PreSur1 ?? "",
          PreSur2: v.PreSur2 ?? "",
          PreSur3: v.PreSur3 ?? "",
          PreRF: v.PreRF ?? "",
          PreTotal: v.PreTotal ?? "",
          AfterAmt: v.AfterAmt ?? "",
          AfterSD: v.AfterSD ?? "",
          AfterSur1: v.AfterSur1 ?? "",
          AfterSur2: v.AfterSur2 ?? "",
          AfterSur3: v.AfterSur3 ?? "",
          AfterRF: v.AfterRF ?? "",
          AfterTotal: v.AfterTotal ?? "",
          BalanceSD: v.BalanceSD ?? "",
          BalanceSur1: v.BalanceSur1 ?? "",
          BalanceSur2: v.BalanceSur2 ?? "",
          BalanceSur3: v.BalanceSur3 ?? "",
          BalanceRF: v.BalanceRF ?? "",
          BalanceTotal: v.BalanceTotal ?? "",
          DecisionSD: v.DecisionSD ?? "",
          DecisionSur1: v.DecisionSur1 ?? "",
          DecisionSur2: v.DecisionSur2 ?? "",
          DecisionSur3: v.DecisionSur3 ?? "",
          DecisionRF: v.DecisionRF ?? "",
          DecisionTotal: v.DecisionTotal ?? "",
          DecisionPen: v.DecisionPen ?? ""
        });
        setLocked(!!v.Locked);
      })
      .catch(err => {
        console.error("Error loading case details:", err);
        Swal.fire({ icon: "error", title: "Load Failed", text: "Failed to load case details." });
      });
  };

  const handleCaseInfoChange = (e) => {
    if (locked) return;
    const { name, value } = e.target;
    setCaseInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePartyChange = (e) => {
    if (locked) return;
    const { name, value } = e.target;
    setParties(prev => ({ ...prev, [name]: value }));
  };

  const handleValuationChange = (e) => {
    if (locked) return;
    const { name, value } = e.target;
    const val = value === "" ? "" : parseFloat(value);
    setValuation(prev => {
      const updated = { ...prev, [name]: val };
      const num = (x) => (x === "" || x == null || isNaN(x) ? 0 : parseFloat(x));
      const pre = { SD: num(updated.PreSD), Sur1: num(updated.PreSur1), Sur2: num(updated.PreSur2), Sur3: num(updated.PreSur3), RF: num(updated.PreRF) };
      const after = { SD: num(updated.AfterSD), Sur1: num(updated.AfterSur1), Sur2: num(updated.AfterSur2), Sur3: num(updated.AfterSur3), RF: num(updated.AfterRF) };
      updated.PreTotal = pre.SD + pre.Sur1 + pre.Sur2 + pre.Sur3 + pre.RF;
      updated.AfterTotal = after.SD + after.Sur1 + after.Sur2 + after.Sur3 + after.RF;
      updated.BalanceSD = after.SD - pre.SD;
      updated.BalanceSur1 = after.Sur1 - pre.Sur1;
      updated.BalanceSur2 = after.Sur2 - pre.Sur2;
      updated.BalanceSur3 = after.Sur3 - pre.Sur3;
      updated.BalanceRF = after.RF - pre.RF;
      updated.BalanceTotal = updated.AfterTotal - updated.PreTotal;
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedCaseId) {
      Swal.fire({ icon: "warning", title: "No Case Selected", text: "Please select a case first." });
      return;
    }

    try {
      const payload = { caseId: selectedCaseId, caseInfo, parties, valuation };
      const res = await axios.post("http://192.168.1.102:5000/api/case-details", payload);
      Swal.fire({ icon: "success", title: "Saved", text: res?.data?.message || "Case details saved successfully!" });
    } catch (err) {
      console.error("Error saving details:", err);
      Swal.fire({ icon: "error", title: "Save Failed", text: err?.response?.data?.message || "Error saving case details." });
    }
  };

  const handleLock = async () => {
    if (!selectedCaseId) {
      Swal.fire("Error", "Please select a case first.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Lock this case?",
      text: "Once locked, you won’t be able to edit it again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, lock it",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.post(`http://192.168.1.102:5000/api/lock-case/${selectedCaseId}`);
      setLocked(true);
      Swal.fire("Locked!", "This case is now locked and cannot be edited.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to lock case.", "error");
    }
  };

  const numInput = (name, value, onChange, placeholder = "", readOnly = false, warning = false) => (
    <div className="d-flex flex-column">
      {warning && <small className="text-danger fw-bold mb-1">Invalid Value</small>}
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        type="number"
        step="1"
        className={`form-control ${warning ? "bg-danger-subtle border-danger text-dark" : ""}`}
        placeholder={placeholder}
        readOnly={locked || readOnly}
      />
    </div>
  );

  return (
    <div className="container p-2 my-4">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-warning text-white d-flex justify-content-between align-items-center">
          <h4 className="card-title fw-bold text-dark">📁 Valuation Details</h4>
          {locked && <span className="badge bg-success">Locked</span>}
        </div>
        <div className="card-body">
          {msg && <div className="alert alert-info">{msg}</div>}

          <div className="mb-3">
            <label className="form-label">Select Case</label>
            <select className="form-select hindi-k010-textbox" value={selectedCaseId} onChange={handleCaseSelect}>
              <option value="">-- dsl pqus --</option>
              {casesList.map(c => (
                <option key={c.id} value={c.id}>{c.CaseNo} @ {c.CaseYear}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSave}>
            {/* Applied CaseForm section style */}
            <h6 className="mt-4 text-dark fw-bold bg-light p-2">Case Info</h6>
            <div className="row g-3 mb-3 mt-1">
              <div className="col-md-3">
                <label className="form-label">SRO Name</label>
                <input name="SROName" className="form-control hindi-k010-textbox" value={caseInfo.SROName} onChange={handleCaseInfoChange} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Case No</label>
                <input name="CaseNo" className="form-control hindi-k010-textbox" value={caseInfo.CaseNo} onChange={handleCaseInfoChange} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Case Year</label>
                <input name="CaseYear" type="number" className="form-control hindi-k010-textbox" value={caseInfo.CaseYear} onChange={handleCaseInfoChange} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Case Registered Date</label>
                <input name="CaseRegistredDate" type="date" className="form-control" value={caseInfo.CaseRegistredDate} onChange={handleCaseInfoChange} readOnly />
              </div>

              <div className="col-md-3">
                <label className="form-label">Case Type</label>
                <input name="CaseType" className="form-control hindi-k010-textbox" value={caseInfo.CaseType} onChange={handleCaseInfoChange} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Document Number</label>
                <input name="DocumentNumber" className="form-control hindi-k010-textbox" value={caseInfo.DocumentNumber} onChange={handleCaseInfoChange} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Document Date</label>
                <input name="DocumentDate" type="date" className="form-control" value={caseInfo.DocumentDate} onChange={handleCaseInfoChange} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Property</label>
                <input name="Property" className="form-control hindi-k010-textbox" value={caseInfo.Property} onChange={handleCaseInfoChange} readOnly />
              </div>
            </div>

            {/* Applied CaseForm section style */}
            <h6 className="mt-4 text-dark fw-bold bg-light p-2">Parties (saved into Cases table)</h6>
            <div className="row g-3 mb-3 mt-1">
              <div className="col-md-3">
                <label>First Party Name</label>
                <input name="FirstParty" className="form-control hindi-k010-textbox" value={parties.FirstParty} onChange={handlePartyChange} readOnly />
              </div>
              <div className="col-md-3">
                <label>First Party Address</label>
                <input name="FirstPartyAddress" className="form-control hindi-k010-textbox" value={parties.FirstPartyAddress} onChange={handlePartyChange} readOnly={locked} />
              </div>
              <div className="col-md-3">
                <label>First Party1 Name</label>
                <input name="FirstParty1" className="form-control hindi-k010-textbox" value={parties.FirstParty1} onChange={handlePartyChange} readOnly={locked} />
              </div>
              <div className="col-md-3">
                <label>First Party1 Address</label>
                <input name="FirstParty1Address" className="form-control hindi-k010-textbox" value={parties.FirstParty1Address} onChange={handlePartyChange} readOnly={locked} />
              </div>

              <div className="col-md-3">
                <label>Second Party Name</label>
                <input name="SecondParty" className="form-control hindi-k010-textbox" value={parties.SecondParty} onChange={handlePartyChange} readOnly />
              </div>
              <div className="col-md-3">
                <label>Second Party Address</label>
                <input name="SecondPartyAddress" className="form-control hindi-k010-textbox" value={parties.SecondPartyAddress} onChange={handlePartyChange} readOnly={locked} />
              </div>
              <div className="col-md-3">
                <label>Second Party1 Name</label>
                <input name="SecondParty1" className="form-control hindi-k010-textbox" value={parties.SecondParty1} onChange={handlePartyChange} readOnly={locked} />
              </div>
              <div className="col-md-3">
                <label>Second Party1 Address</label>
                <input name="SecondParty1Address" className="form-control hindi-k010-textbox" value={parties.SecondParty1Address} onChange={handlePartyChange} readOnly={locked} />
              </div>
            </div>

            {/* Applied CaseForm section style */}
            <h6 className="mt-4 text-dark fw-bold bg-light p-2">Charges / Stamp Duty</h6>

            <div className="mb-2 mt-3"><strong>1) Pre Valuation</strong></div>
            <div className="row g-3 mb-3">
              <div className="col-md-2"><label>Pre Valuation Amount</label>{numInput("PreAmt", valuation.PreAmt, handleValuationChange)}</div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-2"><label>Pre SD</label>{numInput("PreSD", valuation.PreSD, handleValuationChange)}</div>
              <div className="col-md-2"><label>Pre Sur1</label>{numInput("PreSur1", valuation.PreSur1, handleValuationChange)}</div>
              <div className="col-md-2"><label>Pre Sur2</label>{numInput("PreSur2", valuation.PreSur2, handleValuationChange)}</div>
              <div className="col-md-2"><label>Pre Sur3</label>{numInput("PreSur3", valuation.PreSur3, handleValuationChange)}</div>
              <div className="col-md-2"><label>Pre RF</label>{numInput("PreRF", valuation.PreRF, handleValuationChange)}</div>
              <div className="col-md-2"><label>Pre Total</label>{numInput("PreTotal", valuation.PreTotal, handleValuationChange, "", true)}</div>
            </div>

            <div className="mb-2"><strong>2) After Valuation</strong></div>
            <div className="row g-3 mb-3">
              <div className="col-md-2"><label>After Valuation Amount</label>{numInput("AfterAmt", valuation.AfterAmt, handleValuationChange)}</div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-2"><label>After SD</label>{numInput("AfterSD", valuation.AfterSD, handleValuationChange)}</div>
              <div className="col-md-2"><label>After Sur1</label>{numInput("AfterSur1", valuation.AfterSur1, handleValuationChange)}</div>
              <div className="col-md-2"><label>After Sur2</label>{numInput("AfterSur2", valuation.AfterSur2, handleValuationChange)}</div>
              <div className="col-md-2"><label>After Sur3</label>{numInput("AfterSur3", valuation.AfterSur3, handleValuationChange)}</div>
              <div className="col-md-2"><label>After RF</label>{numInput("AfterRF", valuation.AfterRF, handleValuationChange)}</div>
              <div className="col-md-2"><label>After Total</label>{numInput("AfterTotal", valuation.AfterTotal, handleValuationChange, "", true)}</div>
            </div>

            <div className="mb-2"><strong>3) Balance Valuation</strong></div>
            <div className="row g-3 mb-3">
              <div className="col-md-2"><label>Balance SD</label>{numInput("BalanceSD", valuation.BalanceSD, handleValuationChange, "", true, valuation.BalanceSD < 0)}</div>
              <div className="col-md-2"><label>Balance Sur1</label>{numInput("BalanceSur1", valuation.BalanceSur1, handleValuationChange, "", true, valuation.BalanceSur1 < 0)}</div>
              <div className="col-md-2"><label>Balance Sur2</label>{numInput("BalanceSur2", valuation.BalanceSur2, handleValuationChange, "", true, valuation.BalanceSur2 < 0)}</div>
              <div className="col-md-2"><label>Balance Sur3</label>{numInput("BalanceSur3", valuation.BalanceSur3, handleValuationChange, "", true, valuation.BalanceSur3 < 0)}</div>
              <div className="col-md-2"><label>Balance RF</label>{numInput("BalanceRF", valuation.BalanceRF, handleValuationChange, "", true, valuation.BalanceRF < 0)}</div>
              <div className="col-md-2"><label>Balance Total</label>{numInput("BalanceTotal", valuation.BalanceTotal, handleValuationChange, "", true, valuation.BalanceTotal < 0)}</div>
            </div>


            {!locked && (
              <div className="mt-4 d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-primary">💾 Save Details</button>
                <button type="button" className="btn btn-warning" onClick={handleLock}>🔒 Lock Data</button>
              </div>
            )}
            {locked && <div className="alert alert-success mt-3">✅ This case is locked and cannot be edited.</div>}
          </form>
        </div>
      </div>
    </div>
  );
}