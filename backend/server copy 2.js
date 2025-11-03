// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db"); // MySQL promise pool connection

const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
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
      (SROName, CaseNo, CaseYear, CaseRegistredDate, CaseType, DocumentNumber, DocumentDate, Property,
       FirstParty, FirstPartyAddress, FirstParty1, FirstParty1Address,
       SecondParty, SecondPartyAddress, SecondParty1, SecondParty1Address)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
        const values = [
            data.SROName,
            data.CaseNo,
            data.CaseYear || null,
            data.CaseRegistredDate || null,
            data.CaseType,
            data.DocumentNumber || null,
            data.DocumentDate || null,
            data.Property || null,
            data.FirstParty || null,
            data.FirstPartyAddress || null,
            data.FirstParty1 || null,
            data.FirstParty1Address || null,
            data.SecondParty || null,
            data.SecondPartyAddress || null,
            data.SecondParty1 || null,
            data.SecondParty1Address || null,
        ];

        const [result] = await db.query(sql, values);
        res.json({ message: "Case created", id: result.insertId });
    } catch (err) {
        console.error("Error creating case:", err);
        res.status(500).json({ message: "DB error creating case" });
    }
});

// ------------------ List all cases ------------------
app.get("/api/cases/list", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, CaseNo, CaseYear FROM Cases ORDER BY CaseYear DESC, id DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error listing cases:", err);
        res.status(500).json({ message: "Error fetching cases" });
    }
});

// ------------------ Get case + valuation ------------------
app.get("/api/cases/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const [caseRows] = await db.query("SELECT * FROM Cases WHERE id = ?", [id]);
        if (!caseRows.length)
            return res.status(404).json({ message: "Case not found" });

        const caseRow = caseRows[0];
        const [valRows] = await db.query(
            "SELECT * FROM case_valuation WHERE CaseId = ?",
            [id]
        );
        const valuationRow = valRows.length ? valRows[0] : null;

        res.json({ case: caseRow, valuation: valuationRow });
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

        // ---------- 1️⃣ Update Cases table ----------
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

        // ---------- 2️⃣ Prepare valuation values ----------
        const v = valuation || {};
        const num = (x) => (x === "" || x == null || isNaN(x) ? 0 : parseFloat(x));

        // ---- Compute PreTotal and AfterTotal ----
        const preTotal =
            num(v.PreSD) + num(v.PreSur1) + num(v.PreSur2) + num(v.PreSur3) + num(v.PreRF);
        const afterTotal =
            num(v.AfterSD) + num(v.AfterSur1) + num(v.AfterSur2) + num(v.AfterSur3) + num(v.AfterRF);

        // ---- Compute Balance fields ----
        const balances = {
            SD: num(v.AfterSD) - num(v.PreSD),
            Sur1: num(v.AfterSur1) - num(v.PreSur1),
            Sur2: num(v.AfterSur2) - num(v.PreSur2),
            Sur3: num(v.AfterSur3) - num(v.PreSur3),
            RF: num(v.AfterRF) - num(v.PreRF),
            Total: afterTotal - preTotal,
        };

        // ---------- 3️⃣ Insert or Update Valuation ----------
        const insSql = `
            INSERT INTO case_valuation (
                CaseId,
                PreAmt, AfterAmt,
                PreSD, PreSur1, PreSur2, PreSur3, PreRF, PreTotal,
                AfterSD, AfterSur1, AfterSur2, AfterSur3, AfterRF, AfterTotal,
                BalanceSD, BalanceSur1, BalanceSur2, BalanceSur3, BalanceRF, BalanceTotal,
                DecisionSD, DecisionSur1, DecisionSur2, DecisionSur3, DecisionRF, DecisionTotal,
                DecisionPen
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE
                PreAmt = VALUES(PreAmt),
                AfterAmt = VALUES(AfterAmt),
                PreSD = VALUES(PreSD), PreSur1 = VALUES(PreSur1), PreSur2 = VALUES(PreSur2), PreSur3 = VALUES(PreSur3),
                PreRF = VALUES(PreRF), PreTotal = VALUES(PreTotal),
                AfterSD = VALUES(AfterSD), AfterSur1 = VALUES(AfterSur1), AfterSur2 = VALUES(AfterSur2), AfterSur3 = VALUES(AfterSur3),
                AfterRF = VALUES(AfterRF), AfterTotal = VALUES(AfterTotal),
                BalanceSD = VALUES(BalanceSD), BalanceSur1 = VALUES(BalanceSur1), BalanceSur2 = VALUES(BalanceSur2),
                BalanceSur3 = VALUES(BalanceSur3), BalanceRF = VALUES(BalanceRF), BalanceTotal = VALUES(BalanceTotal),
                DecisionSD = VALUES(DecisionSD), DecisionSur1 = VALUES(DecisionSur1), DecisionSur2 = VALUES(DecisionSur2),
                DecisionSur3 = VALUES(DecisionSur3), DecisionRF = VALUES(DecisionRF), DecisionTotal = VALUES(DecisionTotal),
                DecisionPen = VALUES(DecisionPen)
        `;

        const insValues = [
            caseId,
            v.PreAmt || null,
            v.AfterAmt || null,
            v.PreSD || null,
            v.PreSur1 || null,
            v.PreSur2 || null,
            v.PreSur3 || null,
            v.PreRF || null,
            preTotal || null,
            v.AfterSD || null,
            v.AfterSur1 || null,
            v.AfterSur2 || null,
            v.AfterSur3 || null,
            v.AfterRF || null,
            afterTotal || null,
            balances.SD || null,
            balances.Sur1 || null,
            balances.Sur2 || null,
            balances.Sur3 || null,
            balances.RF || null,
            balances.Total || null,
            v.DecisionSD || null,
            v.DecisionSur1 || null,
            v.DecisionSur2 || null,
            v.DecisionSur3 || null,
            v.DecisionRF || null,
            v.DecisionTotal || null,
            v.DecisionPen || null,
        ];

        await db.query(insSql, insValues);
        res.json({ message: "Case and valuation saved successfully (with auto totals & balances)" });
    } catch (err) {
        console.error("❌ Error saving case details:", err);
        res.status(500).json({ message: "Error saving details", error: err.message });
    }
});

app.post("/api/generate-notice", async (req, res) => {
  const { caseId, format } = req.body;
  if (!caseId) return res.status(400).json({ error: "Missing caseId" });

  try {
    // 1️⃣ Fetch case + valuation data
    const [caseRows] = await db.promise().query("SELECT * FROM Cases WHERE id = ?", [caseId]);
    const [valRows] = await db.promise().query("SELECT * FROM CaseValuation WHERE CaseId = ?", [caseId]);
    const caseData = caseRows[0];
    const valData = valRows[0] || {};

    if (!caseData) return res.status(404).json({ error: "Case not found" });

    // 2️⃣ Prepare data for placeholders
    const data = {
      CaseNo: caseData.CaseNo,
      CaseYear: caseData.CaseYear,
      CaseType: caseData.CaseType || "",
      FirstParty: caseData.FirstParty1 || "",
      SecondParty: caseData.SecondParty1 || "",
      PreTotal: valData.PreTotal || 0,
      AfterTotal: valData.AfterTotal || 0,
      BalanceTotal: (valData.AfterTotal || 0) - (valData.PreTotal || 0),
      CurrentDate: new Date().toLocaleDateString("hi-IN"),
      SROName: caseData.SROName || "उप पंजीयक",
    };

    // 3️⃣ Load the template
    const templatePath = path.join(__dirname, "templates", "Template.docx");
    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // 4️⃣ Set the template variables
    doc.setData(data);

    try {
      doc.render();
    } catch (error) {
      console.error("Template render error:", error);
      return res.status(500).json({ error: "Template rendering failed" });
    }

    // 5️⃣ Generate final file
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    const outputFilePath = path.join(
      __dirname,
      "generated_notices",
      `Notice_${data.CaseNo}_${data.CaseYear}.docx`
    );
    fs.writeFileSync(outputFilePath, buffer);

    // 6️⃣ Send the generated file path
    const publicPath = `generated_notices/${path.basename(outputFilePath)}`;
    res.json({ success: true, filePath: publicPath });
  } catch (err) {
    console.error("Error generating notice:", err);
    res.status(500).json({ error: "Error generating notice" });
  }
});
// ------------------ Start server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
