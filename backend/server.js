// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/generated_ordersheet", express.static(path.join(__dirname, "generated_ordersheet")));
app.use("/generated_notices", express.static(path.join(__dirname, "generated_notices")));


// ------------------ Create new case ------------------
app.post("/api/cases", async (req, res) => {
  try {
    const data = req.body;
    if (!data.CaseNo || !data.SROName || !data.CaseType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO Cases
      (SROName, District, Collector, CaseNo, CaseYear, CaseRegistredDate, CaseType, DocumentNumber, DocumentDate, Property,
       FirstParty, FirstPartyAddress, FirstParty1, FirstParty1Address, SecondParty, SecondPartyAddress, SecondParty1, SecondParty1Address)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const values = [
      data.SROName,
      data.District,
      data.Collector,
      data.CaseNo,
      data.CaseYear,
      data.CaseRegistredDate,
      data.CaseType,
      data.DocumentNumber,
      data.DocumentDate,
      data.Property,
      data.FirstParty,
      data.FirstPartyAddress,
      data.FirstParty1,
      data.FirstParty1Address,
      data.SecondParty,
      data.SecondPartyAddress,
      data.SecondParty1,
      data.SecondParty1Address,
    ];

    const [result] = await db.query(sql, values);
    res.json({ message: "Case created", id: result.insertId });
  } catch (err) {
    console.error("Error creating case:", err);
    res.status(500).json({ message: "DB error creating case" });
  }
});

// ------------------ List all cases ------------------
app.get("/api/cases", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, CaseNo, CaseYear, FirstParty1, SecondParty1 FROM Cases ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching cases:", err);
    res.status(500).json({ message: "Error fetching cases" });
  }
});

// ------------------ Get case by ID ------------------
app.get("/api/case/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [caseRows] = await db.query("SELECT * FROM Cases WHERE id = ?", [id]);
    if (!caseRows.length) return res.status(404).json({ message: "Case not found" });

    const [valRows] = await db.query("SELECT * FROM case_valuation WHERE CaseId = ?", [id]);
    res.json({ case: caseRows[0], valuation: valRows[0] || {} });
  } catch (err) {
    console.error("Error fetching case:", err);
    res.status(500).json({ message: "DB error" });
  }
});

// ------------------ Save case details + valuation ------------------
app.post("/api/case-details", async (req, res) => {
  try {
    const { caseId, caseInfo, parties, valuation } = req.body;
    if (!caseId) return res.status(400).json({ message: "Missing caseId" });

    // ✅ Check if locked
    const [lockedRows] = await db.query(
      "SELECT Locked FROM case_valuation WHERE CaseId = ?",
      [caseId]
    );
    if (lockedRows.length && lockedRows[0].Locked === 1) {
      return res.status(403).json({ message: "Data is locked. Editing not allowed." });
    }

    // ✅ Update case info
    const updateCaseSql = `
      UPDATE Cases SET
        SROName = ?, CaseNo = ?, CaseYear = ?, CaseRegistredDate = ?, CaseType = ?, DocumentNumber = ?, DocumentDate = ?, Property = ?,
        FirstParty = ?, FirstPartyAddress = ?, FirstParty1 = ?, FirstParty1Address = ?,
        SecondParty = ?, SecondPartyAddress = ?, SecondParty1 = ?, SecondParty1Address = ?
      WHERE id = ?
    `;
    const updateCaseValues = [
      caseInfo?.SROName || null,
      caseInfo?.CaseNo || null,
      caseInfo?.CaseYear || null,
      caseInfo?.CaseRegistredDate || null,
      caseInfo?.CaseType || null,
      caseInfo?.DocumentNumber || null,
      caseInfo?.DocumentDate || null,
      caseInfo?.Property || null,
      parties?.FirstParty || null,
      parties?.FirstPartyAddress || null,
      parties?.FirstParty1 || null,
      parties?.FirstParty1Address || null,
      parties?.SecondParty || null,
      parties?.SecondPartyAddress || null,
      parties?.SecondParty1 || null,
      parties?.SecondParty1Address || null,
      caseId,
    ];
    await db.query(updateCaseSql, updateCaseValues);

    // ✅ Compute totals
    const v = valuation || {};
    const num = (x) => (x === "" || x == null || isNaN(x) ? 0 : parseFloat(x));
    const preTotal = num(v.PreSD) + num(v.PreSur1) + num(v.PreSur2) + num(v.PreSur3) + num(v.PreRF);
    const afterTotal = num(v.AfterSD) + num(v.AfterSur1) + num(v.AfterSur2) + num(v.AfterSur3) + num(v.AfterRF);
    const balances = {
      SD: num(v.AfterSD) - num(v.PreSD),
      Sur1: num(v.AfterSur1) - num(v.PreSur1),
      Sur2: num(v.AfterSur2) - num(v.PreSur2),
      Sur3: num(v.AfterSur3) - num(v.PreSur3),
      RF: num(v.AfterRF) - num(v.PreRF),
      Total: afterTotal - preTotal,
    };

    // ✅ Upsert valuation data
    const insSql = `
      INSERT INTO case_valuation (
        CaseId, PreAmt, AfterAmt,
        PreSD, PreSur1, PreSur2, PreSur3, PreRF, PreTotal,
        AfterSD, AfterSur1, AfterSur2, AfterSur3, AfterRF, AfterTotal,
        BalanceSD, BalanceSur1, BalanceSur2, BalanceSur3, BalanceRF, BalanceTotal, Locked
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)
      ON DUPLICATE KEY UPDATE
        PreSD=VALUES(PreSD), PreSur1=VALUES(PreSur1), PreSur2=VALUES(PreSur2),
        PreSur3=VALUES(PreSur3), PreRF=VALUES(PreRF), PreTotal=VALUES(PreTotal),
        AfterSD=VALUES(AfterSD), AfterSur1=VALUES(AfterSur1), AfterSur2=VALUES(AfterSur2),
        AfterSur3=VALUES(AfterSur3), AfterRF=VALUES(AfterRF), AfterTotal=VALUES(AfterTotal),
        BalanceSD=VALUES(BalanceSD), BalanceSur1=VALUES(BalanceSur1), BalanceSur2=VALUES(BalanceSur2),
        BalanceSur3=VALUES(BalanceSur3), BalanceRF=VALUES(BalanceRF), BalanceTotal=VALUES(BalanceTotal)
    `;
    const insValues = [
      caseId,
      v.PreAmt || null, v.AfterAmt || null,
      v.PreSD || null, v.PreSur1 || null, v.PreSur2 || null, v.PreSur3 || null, v.PreRF || null, preTotal,
      v.AfterSD || null, v.AfterSur1 || null, v.AfterSur2 || null, v.AfterSur3 || null, v.AfterRF || null, afterTotal,
      balances.SD, balances.Sur1, balances.Sur2, balances.Sur3, balances.RF, balances.Total,
    ];
    await db.query(insSql, insValues);

    res.json({ message: "Case and valuation saved successfully" });
  } catch (err) {
    console.error("❌ Error saving case details:", err);
    res.status(500).json({ message: "Error saving details", error: err.message });
  }
});

// ------------------ Lock case route ------------------
app.post("/api/lock-case/:id", async (req, res) => {
  try {
    const caseId = req.params.id;
    await db.query("UPDATE case_valuation SET Locked = 1 WHERE CaseId = ?", [caseId]);
    res.json({ message: "Case data locked successfully." });
  } catch (err) {
    console.error("❌ Error locking case:", err);
    res.status(500).json({ message: "Error locking case" });
  }
});

// ------------------ Fetch SRO & District Info ------------------
app.get("/api/sros", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, District, SROffice FROM SRO ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching SRO list:", err);
    res.status(500).json({ message: "Error fetching SRO list" });
  }
});

app.get("/api/districts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT District FROM SRO ORDER BY District");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching districts:", err);
    res.status(500).json({ message: "Error fetching districts" });
  }
});


// ------------------ Generate Order Sheet from Template ------------------
app.post("/api/generate-notice", async (req, res) => {
  const { caseId, format } = req.body;
  if (!caseId) return res.status(400).json({ error: "Missing caseId" });

  try {
    const [caseRows] = await db.query("SELECT * FROM Cases WHERE id = ?", [caseId]);
    const [valRows] = await db.query("SELECT * FROM case_valuation WHERE CaseId = ?", [caseId]);
    const caseData = caseRows[0];
    const valData = valRows[0] || {};
    if (!caseData) return res.status(404).json({ error: "Case not found" });

    const data = {
      CaseNo: caseData.CaseNo,
      SROName: caseData.SROName,
      CaseYear: caseData.CaseYear,
      CaseType: caseData.CaseType || "",
      FirstParty: caseData.FirstParty || "",
      SecondParty: caseData.SecondParty || "",
      CaseRegistredDate: caseData.CaseRegistredDate
        ? new Date(caseData.CaseRegistredDate).toLocaleDateString("en-GB").replace(/\//g, "/")
        : "",
      DocumentNumber: caseData.DocumentNumber,
      DocumentDate: caseData.DocumentDate
        ? new Date(caseData.DocumentDate).toLocaleDateString("en-GB").replace(/\//g, "/")
        : "",
      District: caseData.District,
      Collector: caseData.Collector,
      PreAmt: valData.PreAmt || 0,
      AfterAmt: valData.AfterAmt || 0,
      PreTotal: valData.PreTotal || 0,
      AfterTotal: valData.AfterTotal || 0,
      BalanceTotal: (valData.AfterTotal || 0) - (valData.PreTotal || 0),
      CurrentDate: new Date().toLocaleDateString("hi-IN"),
    };

    const templatePath = path.join(__dirname, "templates", "OrderSheet.docx");
    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true,delimiters: { start: '^^', end: '^^' }}); // safer custom delimiters});
   
    doc.setData(data);
    doc.render();

    

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    const outputDir = path.join(__dirname, "generated_ordersheet");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const fileName = `OrderSheet_${data.CaseNo}_${data.CaseYear}.${format === "pdf" ? "pdf" : "docx"}`;
    const outputFilePath = path.join(outputDir, fileName);

    fs.writeFileSync(outputFilePath, buffer);
    const publicPath = `generated_ordersheet/${fileName}`;
    res.json({ success: true, filePath: publicPath });
  } catch (err) {
    console.error("Error generating notice:", err);
    res.status(500).json({ error: "Error generating notice" });
  }
});

// ------------------ Generate Notice (with Notice/Hiring Dates) ------------------
app.post("/api/generate-notice-with-dates", async (req, res) => {
  const { caseId, format, noticeDate, hiringDate } = req.body;
  if (!caseId) return res.status(400).json({ error: "Missing caseId" });

  try {
    // Get case + valuation details
    const [caseRows] = await db.query("SELECT * FROM Cases WHERE id = ?", [caseId]);
    const [valRows] = await db.query("SELECT * FROM case_valuation WHERE CaseId = ?", [caseId]);
    const caseData = caseRows[0];
    const valData = valRows[0] || {};
    if (!caseData) return res.status(404).json({ error: "Case not found" });

    // Prepare template data
    const data = {
      CaseNo: caseData.CaseNo,
      CaseYear: caseData.CaseYear,
      CaseType: caseData.CaseType || "",
      DocumentDate: caseData.DocumentDate ? new Date(caseData.DocumentDate).toLocaleDateString("en-GB").replace(/\//g, "/")
        : "",
      DocumentNumber: caseData.DocumentNumber || "",
      SROName: caseData.SROName,
      District: caseData.District,
      Collector: caseData.Collector,
      FirstParty: caseData.FirstParty || "",
      SecondParty: caseData.SecondParty || "",
      SecondParty1: caseData.SecondParty1 || "",
      SecondPartyAddress: caseData.SecondPartyAddress,
      NoticeDate: noticeDate
        ? new Date(noticeDate).toLocaleDateString("en-GB").replace(/\//g, "/")
        : new Date().toLocaleDateString("en-GB").replace(/\//g, "/"),
      HiringDate: hiringDate
        ? new Date(hiringDate).toLocaleDateString("en-GB").replace(/\//g, "/")
        : "",
      PreAmt: valData.PreAmt || 0,
      PreSD: valData.PreSD || 0,
      AfterSD: valData.AfterSD || 0,
      PreRF: valData.PreRF || 0,
      AfterRF: valData.AfterRF || 0,
      PreSur1: valData.PreSur1 || 0,
      PreSur2: valData.PreSur2 || 0,
      PreSur3: valData.PreSur3 || 0,
      AfterSur1: valData.AfterSur1 || 0,
      AfterSur2: valData.AfterSur2 || 0,
      AfterSur3: valData.AfterSur3 || 0,
      AfterAmt: valData.AfterAmt || 0,
      PreTotal: valData.PreTotal || 0,
      AfterTotal: valData.AfterTotal || 0,
      BalanceTotal: (valData.AfterTotal || 0) - (valData.PreTotal || 0),
      GeneratedAt: new Date().toLocaleDateString("hi-IN"),
    };

    // Template path (use a new Notice.docx)
    const templatePath = path.join(__dirname, "templates", "Notice.docx");
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    // const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '^^', end: '^^' }, // safer custom delimiters
    });

    doc.setData(data);
    doc.render();

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    const outputDir = path.join(__dirname, "generated_notices");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const fileName = `Notice_${caseData.CaseNo}_${caseData.CaseYear}_${Date.now()}.${format === "pdf" ? "pdf" : "docx"}`;
    const outputFilePath = path.join(outputDir, fileName);
    fs.writeFileSync(outputFilePath, buffer);

    const publicPath = `generated_notices/${fileName}`;

    // 💾 Save metadata to DB
    await db.query(
      `INSERT INTO generated_notices (CaseId, NoticeDate, HiringDate, Format, FilePath)
       VALUES (?, ?, ?, ?, ?)`,
      [caseId, noticeDate, hiringDate, format, publicPath]
    );

    res.json({ success: true, filePath: publicPath });
  } catch (err) {
    console.error("❌ Error generating notice-with-dates:", err);
    res.status(500).json({ error: "Error generating notice-with-dates" });
  }
});


app.get("/api/generated-notices/:caseId", async (req, res) => {
  const { caseId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM generated_notices WHERE CaseId = ? ORDER BY id DESC",
      [caseId]
    );

    // 🧹 Clean up date formats (remove time)
    const formatted = rows.map(row => ({
      ...row,
      NoticeDate: row.NoticeDate
        ? new Date(row.NoticeDate).toLocaleDateString("en-GB").replace(/\//g, "/")
        : "",
      HiringDate: row.HiringDate
        ? new Date(row.HiringDate).toLocaleDateString("en-GB").replace(/\//g, "/")
        : "",

    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching generated notices:", err);
    res.status(500).json({ message: "DB error fetching generated notices" });
  }
});


// ------------------ Start server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));
