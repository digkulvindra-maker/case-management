

// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db"); // MySQL promise pool connection

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

        // ---------- 2️⃣ Upsert into case_valuation ----------
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

        const v = valuation || {};
        const insValues = [
            caseId,
            v.PreAmt || null,
            v.AfterAmt || null,
            v.PreSD || null,
            v.PreSur1 || null,
            v.PreSur2 || null,
            v.PreSur3 || null,
            v.PreRF || null,
            v.PreTotal || null,
            v.AfterSD || null,
            v.AfterSur1 || null,
            v.AfterSur2 || null,
            v.AfterSur3 || null,
            v.AfterRF || null,
            v.AfterTotal || null,
            v.BalanceSD || null,
            v.BalanceSur1 || null,
            v.BalanceSur2 || null,
            v.BalanceSur3 || null,
            v.BalanceRF || null,
            v.BalanceTotal || null,
            v.DecisionSD || null,
            v.DecisionSur1 || null,
            v.DecisionSur2 || null,
            v.DecisionSur3 || null,
            v.DecisionRF || null,
            v.DecisionTotal || null,
            v.DecisionPen || null,
        ];

        await db.query(insSql, insValues);

        res.json({ message: "Case and valuation saved successfully" });
    } catch (err) {
        console.error("❌ Error saving case details:", err);
        res.status(500).json({ message: "Error saving details", error: err.message });
    }
});

// ------------------ Start server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
