import React, { useState } from "react";
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
    SecondParty: ""
});
    const [msg, setMsg] = useState("");
    const sroOptions = ["guqekux<+", "uksgj", "Hkknjk", "NkuhcM+h", "McyhjkBku", "iYyw", "ihyhcaxk", "jkorlj", "laxfj;k", "fVCch", "jkex<+", "<+kck", "ryokM+k >hy", "[kwbZa;k", "xksywokyk", "vuwix<+", "Jhxaxkuxj", "Jhfot;uxj", "lwjrx<+","ch>ck;yk", "pwuko<+", "xtflagiqj", "?kM+lkuk", "fgUnweydksV", "dsljhflagiqj", "eqdykok", "ineiqj", "jk;flaguxj", "lknwy'kgj", "Jhdj.kiqj", "jkft;klj", "tSrlj", "fetsZokyk", "jkoyk", "365gSM+","lestkdksBh", "ykyx<+ tkVku", "QsQkuk", "Mwaxjkuk", "uksjaxnslj", "fjMeylj"];
    const caseTypes = ["egkys[kkdkj tkap ny t;iqj", "vkUrfjd ys[kk tkap ny] vtesj", "ekSdk fujh{k.k", "vU;", "lqvkseksVks"];
    const districtOptions = ["guqekux<+", "xaxkuxj"];
    const collectorOptions = ["guqekux<+", "vtesj"];
    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/cases", formData);
            setMsg(res.data.message || "Saved successfully!");

            // Reset form after successful save
            setFormData({
                SROName: "",
                CaseNo: "",
                CaseYear: "",
                CaseRegistredDate: "",
                CaseType: "",
                DocumentNumber: "",
                DocumentDate: "",
                FirstParty: "",
                SecondParty: ""
            });

            
        } catch (err) {
            console.error(err);
            setMsg(err?.response?.data?.message || "Error saving data");
        }
    };

    const handleGen = async () => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/generate-report",
                formData,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "CaseReport.docx";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error(e);
            alert("Report generation failed");
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
                                <label htmlFor="Collector" className="form-label">Court Collector(Stamps)</label>
                                <select
                                    id="Collector"
                                    name="Collector"
                                    className="form-select hindi-k010-textbox"
                                    value={formData.Collector}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">dksVZ dysDVj pqus</option>
                                    {collectorOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                             {/* ✅ District Selection */}
                            <div className="col-md-4">
                                <label htmlFor="District" className="form-label">District</label>
                                <select
                                    id="District"
                                    name="District"
                                    className="form-select hindi-k010-textbox"
                                    value={formData.District}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">ftyk pquko djsa</option>
                                    {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* SRO Name */}
                            <div className="col-md-4">
                                <label htmlFor="SROName" className="form-label">SRO Name</label>
                                <select
                                    id="SROName"
                                    name="SROName"
                                    className="form-select hindi-k010-textbox"
                                    value={formData.SROName}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">pquko djsa</option>
                                    {sroOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Case No */}
                            <div className="col-md-4">
                                <label htmlFor="CaseNo" className="form-label">Case No</label>
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
                                <label htmlFor="CaseYear" className="form-label">Case Year</label>
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
                                <label htmlFor="CaseRegistredDate" className="form-label">Case Registered Date</label>
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
                                <label htmlFor="CaseType" className="form-label">Case Type</label>
                                <select
                                    id="CaseType"
                                    name="CaseType"
                                    className="form-select hindi-k010-textbox"
                                    value={formData.CaseType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">dsl izdkj</option>
                                    {caseTypes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Document Number */}
                            <div className="col-md-4">
                                <label htmlFor="DocumentNumber" className="form-label">Document Number</label>
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
                                <label htmlFor="DocumentDate" className="form-label">Document Date</label>
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
                                <label htmlFor="FirstParty" className="form-label">First Party</label>
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
                                <label htmlFor="SecondParty" className="form-label">Second Party</label>
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
                            {/*<button type="button" className="btn btn-success" onClick={handleGen}>Generate Word</button>*/}
                            <button type="submit" className="btn btn-primary">Save Case</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// import React, { useState } from "react";
// import axios from "axios";
// import "../styles/HindiFont.css";
// export default function CaseForm() {
//     const [formData, setFormData] = useState({
//         SROName: "",
//         CaseNo: "",
//         CaseYear: "",
//         CaseRegistredDate: "",
//         CaseType: "",
//         DocumentNumber: "",
//         DocumentDate: "",
//         FirstParty: "",
//         SecondParty: ""
//     });

//     const [msg, setMsg] = useState("");
//     const [useHindiFont, setUseHindiFont] = useState(true); // ✅ Default Hindi font ON

//     const sroOptions = ["Hanumangarh", "Bhadra", "Nohar", "Sangaria", "Pilibanga", "Rawatsar"];
//     const caseTypes = ["AG", "ICP", "Random", "Other", "SuoMoto"];

//     const handleChange = (e) =>
//         setFormData({ ...formData, [e.target.name]: e.target.value });

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post("http://localhost:5000/api/cases", formData);
//             setMsg(res.data.message || "Saved successfully!");

//             // Reset form after successful save
//             setFormData({
//                 SROName: "",
//                 CaseNo: "",
//                 CaseYear: "",
//                 CaseRegistredDate: "",
//                 CaseType: "",
//                 DocumentNumber: "",
//                 DocumentDate: "",
//                 FirstParty: "",
//                 SecondParty: ""
//             });
//         } catch (err) {
//             console.error(err);
//             setMsg(err?.response?.data?.message || "Error saving data");
//         }
//     };

//     const handleGen = async () => {
//         try {
//             const res = await axios.post(
//                 "http://localhost:5000/api/generate-report",
//                 formData,
//                 { responseType: "blob" }
//             );
//             const url = window.URL.createObjectURL(new Blob([res.data]));
//             const a = document.createElement("a");
//             a.href = url;
//             a.download = "CaseReport.docx";
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//         } catch (e) {
//             console.error(e);
//             alert("Report generation failed");
//         }
//     };

//     // ✅ Helper to assign font class
//     const getInputClass = (type = "text") => {
//         if (type === "date") return "form-control";
//         return `form-control ${useHindiFont ? "kruti-input" : ""}`;
//     };

//     return (
//         <div className="container my-4">
//             <div className="card shadow-sm">
//                 <div className="card-header bg-primary text-white">
//                     <h4 className="card-title mb-0">Case Entry</h4>
//                 </div>
//                 <div className="card-body">
//                     {msg && <div className="alert alert-info">{msg}</div>}

//                     {/* ✅ Font Toggle */}
//                     <div className="mb-3">
//                         <label>
//                             <input 
//                                 type="checkbox"
//                                 checked={useHindiFont}
//                                 onChange={(e) => setUseHindiFont(e.target.checked)}
//                             />{" "}
//                             Use Kruti Dev / DevLys Font
//                         </label>
//                     </div>

//                     <form onSubmit={handleSubmit}>
//                         <div className="row g-3">
//                             {/* SRO Name */}
//                             <div className="col-md-4">
//                                 <label htmlFor="SROName" className="form-label">
//                                     SRO Name
//                                 </label>
//                                 <select
//                                     id="SROName"
//                                     name="SROName"
//                                     className={getInputClass()}
//                                     value={formData.SROName}
//                                     onChange={handleChange}
//                                     required
//                                 >
//                                     <option value="">Select</option>
//                                     {sroOptions.map((s) => (
//                                         <option key={s} value={s}>
//                                             {s}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Case No */}
//                             <div className="col-md-4">
//                                 <label htmlFor="CaseNo" className="form-label">Case No</label>
//                                 <input
//                                     id="CaseNo"
//                                     name="CaseNo"
//                                     type="text"
//                                     className={getInputClass()}
//                                     value={formData.CaseNo}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             {/* Case Year */}
//                             <div className="col-md-4">
//                                 <label htmlFor="CaseYear" className="form-label">Case Year</label>
//                                 <input
//                                     id="CaseYear"
//                                     name="CaseYear"
//                                     type="number"
//                                     className={getInputClass("number")}
//                                     value={formData.CaseYear}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div className="row g-3 mt-2">
//                             {/* Case Registered Date */}
//                             <div className="col-md-4">
//                                 <label htmlFor="CaseRegistredDate" className="form-label">
//                                     Case Registered Date
//                                 </label>
//                                 <input
//                                     id="CaseRegistredDate"
//                                     name="CaseRegistredDate"
//                                     type="date"
//                                     className={getInputClass("date")}
//                                     value={formData.CaseRegistredDate}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Case Type */}
//                             <div className="col-md-4">
//                                 <label htmlFor="CaseType" className="form-label">Case Type</label>
//                                 <select
//                                     id="CaseType"
//                                     name="CaseType"
//                                     className={getInputClass()}
//                                     value={formData.CaseType}
//                                     onChange={handleChange}
//                                     required
//                                 >
//                                     <option value="">Select</option>
//                                     {caseTypes.map((c) => (
//                                         <option key={c} value={c}>{c}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Document Number */}
//                             <div className="col-md-4">
//                                 <label htmlFor="DocumentNumber" className="form-label">
//                                     Document Number
//                                 </label>
//                                 <input
//                                     id="DocumentNumber"
//                                     name="DocumentNumber"
//                                     type="text"
//                                     className={getInputClass()}
//                                     value={formData.DocumentNumber}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                         </div>

//                         <div className="row g-3 mt-2">
//                             {/* Document Date */}
//                             <div className="col-md-4">
//                                 <label htmlFor="DocumentDate" className="form-label">Document Date</label>
//                                 <input
//                                     id="DocumentDate"
//                                     name="DocumentDate"
//                                     type="date"
//                                     className={getInputClass("date")}
//                                     value={formData.DocumentDate}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* First Party */}
//                             <div className="col-md-4">
//                                 <label htmlFor="FirstParty" className="form-label">First Party</label>
//                                 <input
//                                     id="FirstParty"
//                                     name="FirstParty"
//                                     type="text"
//                                     className={getInputClass()}
//                                     value={formData.FirstParty}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Second Party */}
//                             <div className="col-md-4">
//                                 <label htmlFor="SecondParty" className="form-label">Second Party</label>
//                                 <input
//                                     id="SecondParty"
//                                     name="SecondParty"
//                                     type="text"
//                                     className={getInputClass()}
//                                     value={formData.SecondParty}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                         </div>

//                         {/* Buttons */}
//                         <div className="mt-4 d-flex justify-content-end gap-2">
//                             {/*<button type="button" className="btn btn-success" onClick={handleGen}>Generate Word</button>*/}
//                             <button type="submit" className="btn btn-primary">Save Case</button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }
