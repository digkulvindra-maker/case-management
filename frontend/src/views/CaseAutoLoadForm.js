// src/views/CaseAutoLoadForm.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/HindiFont.css";
import { useHistory } from "react-router-dom";
export default function CaseAutoLoadForm() {
    const [casesList, setCasesList] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState("");
    const history = useHistory();
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

    // Parties stored/updated in Cases table
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

    // Valuation grouped fields
    const [valuation, setValuation] = useState({
        // Pre
        PreSD: "", PreSur1: "", PreSur2: "", PreSur3: "", PreRF: "", PreTotal: "",
        // After
        AfterSD: "", AfterSur1: "", AfterSur2: "", AfterSur3: "", AfterRF: "", AfterTotal: "",
        // Balance
        BalanceSD: "", BalanceSur1: "", BalanceSur2: "", BalanceSur3: "", BalanceRF: "", BalanceTotal: "",
        // Decision
        DecisionSD: "", DecisionSur1: "", DecisionSur2: "", DecisionSur3: "", DecisionRF: "", DecisionTotal: "",
        // extra
        DecisionPen: ""
    });

    const [msg, setMsg] = useState("");

    // load cases list for dropdown
    useEffect(() => {
        axios.get("http://localhost:5000/api/cases")
            .then(res => setCasesList(res.data || []))
            .catch(err => {
                console.error("Error loading cases list:", err);
                setMsg("Error loading cases list");
            });
    }, []);

    // when a case is selected, load case row + its valuation
    const handleCaseSelect = (e) => {
        const caseId = e.target.value;
        setSelectedCaseId(caseId);
        setMsg("");
        if (!caseId) {
            // reset forms
            setCaseInfo({
                SROName: "", CaseNo: "", CaseYear: "", CaseRegistredDate: "", CaseType: "", DocumentNumber: "", DocumentDate: "", Property: ""
            });
            setParties({
                FirstParty: "", FirstPartyAddress: "", FirstParty1: "", FirstParty1Address: "",
                SecondParty: "", SecondPartyAddress: "", SecondParty1: "", SecondParty1Address: ""
            });
            setValuation({
                PreSD: "", PreSur1: "", PreSur2: "", PreSur3: "", PreRF: "", PreTotal: "",
                AfterSD: "", AfterSur1: "", AfterSur2: "", AfterSur3: "", AfterRF: "", AfterTotal: "",
                BalanceSD: "", BalanceSur1: "", BalanceSur2: "", BalanceSur3: "", BalanceRF: "", BalanceTotal: "",
                DecisionSD: "", DecisionSur1: "", DecisionSur2: "", DecisionSur3: "", DecisionRF: "", DecisionTotal: "",
                DecisionPen: ""
            });
            return;
        }

        axios.get(`http://localhost:5000/api/case/${caseId}`)
            .then(res => {
                // Expecting { case: { ... }, valuation: { ... } } from backend
                const data = res.data || {};
                const c = data.case || data; // keep backward-compatible if backend returns row directly
                const v = data.valuation || {};

                // Map case info (fields saved from CaseForm.jsx)
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

                // Map parties (these are stored in Cases table)
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

                // Map valuation fields (may be null)
                setValuation({
                    PreAmt: v.PreAmt || "",
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
            })
            .catch(err => {
                console.error("Error loading case details:", err);
                setMsg("Failed to load case details");
            });
    };

    // handlers for inputs
    const handleCaseInfoChange = (e) => {
        const { name, value } = e.target;
        setCaseInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePartyChange = (e) => {
        const { name, value } = e.target;
        setParties(prev => ({ ...prev, [name]: value }));
    };

    // 🔢 Auto-calculate PreTotal, AfterTotal, and Balance fields
    const handleValuationChange = (e) => {
        const { name, value } = e.target;
        const val = value === "" ? "" : parseFloat(value);

        setValuation((prev) => {
            const updated = { ...prev, [name]: val };

            const num = (x) => (x === "" || x == null || isNaN(x) ? 0 : parseFloat(x));

            // ----- Calculate PreTotal -----
            const pre = {
                SD: num(updated.PreSD),
                Sur1: num(updated.PreSur1),
                Sur2: num(updated.PreSur2),
                Sur3: num(updated.PreSur3),
                RF: num(updated.PreRF),
            };
            updated.PreTotal = pre.SD + pre.Sur1 + pre.Sur2 + pre.Sur3 + pre.RF;

            // ----- Calculate AfterTotal -----
            const after = {
                SD: num(updated.AfterSD),
                Sur1: num(updated.AfterSur1),
                Sur2: num(updated.AfterSur2),
                Sur3: num(updated.AfterSur3),
                RF: num(updated.AfterRF),
            };
            updated.AfterTotal = after.SD + after.Sur1 + after.Sur2 + after.Sur3 + after.RF;

            // ----- Calculate Balance = After - Pre -----
            updated.BalanceSD = after.SD - pre.SD;
            updated.BalanceSur1 = after.Sur1 - pre.Sur1;
            updated.BalanceSur2 = after.Sur2 - pre.Sur2;
            updated.BalanceSur3 = after.Sur3 - pre.Sur3;
            updated.BalanceRF = after.RF - pre.RF;
            updated.BalanceTotal = updated.AfterTotal - updated.PreTotal;

            return updated;
        });
    };


    // save both (cases part + valuation)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        if (!selectedCaseId) {
            setMsg("Please select a case first.");
            return;
        }

        try {
            const payload = {
                caseId: selectedCaseId,
                caseInfo,
                parties,
                valuation
            };
            const res = await axios.post("http://localhost:5000/api/case-details", payload);
            setMsg(res.data.message || "Saved successfully!");
        } catch (err) {
            console.error("Error saving details:", err);
            setMsg(err?.response?.data?.message || "Error saving data");
        }
    };


    // small helper to render numeric input
    // const numInput = (name, value, onChange, placeholder = "", readOnly = false) => (
    //     <input
    //         name={name}
    //         value={value ?? ""}
    //         onChange={onChange}
    //         type="number"
    //         step="1"
    //         className="form-control"
    //         placeholder={placeholder}
    //         readOnly={readOnly}
    //     />
    // );

    // small helper to render numeric input with optional warning
    const numInput = (name, value, onChange, placeholder = "", readOnly = false, warning = false) => (
        <div className="d-flex flex-column">
            {warning && (
                <small className="text-danger fw-bold mb-1">Invalid Value</small>
            )}
            <input
                name={name}
                value={value ?? ""}
                onChange={onChange}
                type="number"
                step="1"
                className={`form-control ${warning ? "bg-danger-subtle border-danger text-dark" : ""}`}
                placeholder={placeholder}
                readOnly={readOnly}
            />
        </div>
    );


    return (
        <div className="container my-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h4 className="card-title mb-0">Case Auto-Load Form</h4>
                </div>
                <div className="card-body">
                    {msg && <div className="alert alert-info">{msg}</div>}

                    {/* case select */}
                    <div className="mb-3">
                        <label className="form-label">Select Case</label>
                        <select className="form-select hindi-k010-textbox" value={selectedCaseId} onChange={handleCaseSelect}>
                            <option value="">-- dsl la[;k @ lky pqus --</option>
                            {casesList.map(c => (
                                <option key={c.id} value={c.id}>{c.CaseNo} @ {c.CaseYear}</option>
                            ))}
                        </select>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <h5>Case Info</h5>
                        <div className="row g-3 mb-3">
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
                                <input name="CaseRegistredDate" type="date" className="form-control hindi-k010-textbox" value={caseInfo.CaseRegistredDate} onChange={handleCaseInfoChange} readOnly />
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
                                <input name="DocumentDate" type="date" className="form-control hindi-k010-textbox" value={caseInfo.DocumentDate} onChange={handleCaseInfoChange} readOnly />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Property</label>
                                <input name="Property" className="form-control hindi-k010-textbox" value={caseInfo.Property} onChange={handleCaseInfoChange} readOnly />
                            </div>
                        </div>

                        <h5>Parties (saved into Cases table)</h5>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3">
                                <label>First Party Name</label>
                                <input name="FirstParty" className="form-control hindi-k010-textbox" value={parties.FirstParty} onChange={handlePartyChange} readOnly />
                            </div>
                            <div className="col-md-3">
                                <label>First Party Address</label>
                                <input name="FirstPartyAddress" className="form-control hindi-k010-textbox" value={parties.FirstPartyAddress} onChange={handlePartyChange} />
                            </div>
                            <div className="col-md-3">
                                <label>First Party1 Name</label>
                                <input name="FirstParty1" className="form-control hindi-k010-textbox" value={parties.FirstParty1} onChange={handlePartyChange} />
                            </div>
                            <div className="col-md-3">
                                <label>First Party1 Address</label>
                                <input name="FirstParty1Address" className="form-control hindi-k010-textbox" value={parties.FirstParty1Address} onChange={handlePartyChange} />
                            </div>

                            <div className="col-md-3">
                                <label>Second Party Name</label>
                                <input name="SecondParty" className="form-control hindi-k010-textbox" value={parties.SecondParty} onChange={handlePartyChange} readOnly />
                            </div>
                            <div className="col-md-3">
                                <label>Second Party Address</label>
                                <input name="SecondPartyAddress" className="form-control hindi-k010-textbox" value={parties.SecondPartyAddress} onChange={handlePartyChange} />
                            </div>
                            <div className="col-md-3">
                                <label>Second Party1 Name</label>
                                <input name="SecondParty1" className="form-control hindi-k010-textbox" value={parties.SecondParty1} onChange={handlePartyChange} />
                            </div>
                            <div className="col-md-3">
                                <label>Second Party1 Address</label>
                                <input name="SecondParty1Address" className="form-control hindi-k010-textbox" value={parties.SecondParty1Address} onChange={handlePartyChange} />
                            </div>
                        </div>

                        <h5>Charges / Stamp Duty</h5>

                        {/* Pre Valuation */}
                        <div className="mb-2"><strong>1) Pre Valuation</strong></div>
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

                        {/* After Valuation */}
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


                        {/* Balance Valuation */}
                        <div className="mb-2"><strong>3) Balance Valuation</strong></div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-2">
                                <label>Balance SD</label>
                                {numInput("BalanceSD", valuation.BalanceSD, handleValuationChange, "", true, valuation.BalanceSD < 0)}
                            </div>
                            <div className="col-md-2">
                                <label>Balance Sur1</label>
                                {numInput("BalanceSur1", valuation.BalanceSur1, handleValuationChange, "", true, valuation.BalanceSur1 < 0)}
                            </div>
                            <div className="col-md-2">
                                <label>Balance Sur2</label>
                                {numInput("BalanceSur2", valuation.BalanceSur2, handleValuationChange, "", true, valuation.BalanceSur2 < 0)}
                            </div>
                            <div className="col-md-2">
                                <label>Balance Sur3</label>
                                {numInput("BalanceSur3", valuation.BalanceSur3, handleValuationChange, "", true, valuation.BalanceSur3 < 0)}
                            </div>
                            <div className="col-md-2">
                                <label>Balance RF</label>
                                {numInput("BalanceRF", valuation.BalanceRF, handleValuationChange, "", true, valuation.BalanceRF < 0)}
                            </div>
                            <div className="col-md-2">
                                <label>Balance Total</label>
                                {numInput("BalanceTotal", valuation.BalanceTotal, handleValuationChange, "", true, valuation.BalanceTotal < 0)}
                            </div>
                        </div>



                        {/* Decision Valuation */}
                        {/*<div className="mb-2"><strong>4) Decision Valuation</strong></div>*/}
                        {/* <div className="row g-3 mb-3">
                            <div className="col-md-2"><label>Decision SD</label>{numInput("DecisionSD", valuation.DecisionSD, handleValuationChange)}</div>
                            <div className="col-md-2"><label>Decision Sur1</label>{numInput("DecisionSur1", valuation.DecisionSur1, handleValuationChange)}</div>
                            <div className="col-md-2"><label>Decision Sur2</label>{numInput("DecisionSur2", valuation.DecisionSur2, handleValuationChange)}</div>
                            <div className="col-md-2"><label>Decision Sur3</label>{numInput("DecisionSur3", valuation.DecisionSur3, handleValuationChange)}</div>
                            <div className="col-md-2"><label>Decision RF</label>{numInput("DecisionRF", valuation.DecisionRF, handleValuationChange)}</div>
                            <div className="col-md-2"><label>Decision Total</label>{numInput("DecisionTotal", valuation.DecisionTotal, handleValuationChange)}</div>

                            <div className="col-md-4 mt-2">
                                <label>Decision Pen (optional)</label>
                                {numInput("DecisionPen", valuation.DecisionPen, handleValuationChange)}
                            </div>
                        </div>*/}

                        <div className="mt-3 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">Save Details</button>
                        </div>


                    </form>
                    <button className="btn btn-warning mt-3" onClick={() => history.push(`/notice-generator/${selectedCaseId}`)} > Generate Notice Letter  </button>
                </div>
            </div>
        </div>
    );
}
