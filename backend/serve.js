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

// Serve all output folders
app.use("/generated_ordersheet",
  express.static(path.join(__dirname, "generated_ordersheet"))
);

app.use("/generated_notices",
  express.static(path.join(__dirname, "generated_notices"))
);

app.use("/generated_reports",
  express.static(path.join(__dirname, "generated_reports"))
);

// 🔥 FIXED — THIS WAS WRONG EARLIER
app.use("/generated_valuation_reports",
  express.static(path.join(__dirname, "generated_valuation_reports"))
);

// ------------------ Create New Case ------------------
app.post("/api/cases", async (req, res) => {
  try {
    const data = req.body;

    if (!data.CaseNo || !data.SROName || !data.CaseType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO Cases
      (SROName, District, Collector, CaseNo, CaseYear, CaseRegistredDate, CaseType,
       DocumentNumber, DocumentDate, Property,
       FirstParty, FirstPartyAddress, FirstParty1, FirstParty1Address,
       SecondParty, SecondPartyAddress, SecondParty1, SecondParty1Address)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const values = [
      data.SROName, data.District, data.Collector,
      data.CaseNo, data.CaseYear, data.CaseRegistredDate, data.CaseType,
      data.DocumentNumber, data.DocumentDate, data.Property,
      data.FirstParty, data.FirstPartyAddress, data.FirstParty1, data.FirstParty1Address,
      data.SecondParty, data.SecondPartyAddress, data.SecondParty1, data.SecondParty1Address
    ];

    const [result] = await db.query(sql, values);
    res.json({ message: "Case created", id: result.insertId });

  } catch (err) {
    console.error("Error creating case:", err);
    res.status(500).json({ message: "DB error creating case" });
  }
});

// ------------------ List All Cases ------------------
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

// ------------------ Get Case By ID ------------------
app.get("/api/case/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [caseRows] = await db.query("SELECT * FROM Cases WHERE id = ?", [id]);

    if (!caseRows.length) {
      return res.status(404).json({ message: "Case not found" });
    }

    const [valRows] = await db.query("SELECT * FROM case_valuation WHERE CaseId = ?", [id]);

    res.json({
      case: caseRows[0],
      valuation: valRows[0] || {}
    });

  } catch (err) {
    console.error("Error fetching case:", err);
    res.status(500).json({ message: "DB error" });
  }
});

// ------------------ Generate Valuation Report ------------------
app.post("/api/generate-valuation-report", async (req, res) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({ error: "Missing caseId" });
    }

    // Fetch CASE DATA
    const [caseRows] = await db.query(
      `SELECT SROName, CaseNo, CaseYear, DocumentDate
       FROM cases WHERE id = ?`,
      [caseId]
    );

    if (!caseRows.length) {
      return res.status(404).json({ error: "Case data not found" });
    }

    const caseData = caseRows[0];

    // Fetch OTHER CASE ENTRY DATA
    const [otherRows] = await db.query(
      "SELECT * FROM other_case_entries WHERE case_id = ? LIMIT 1",
      [caseId]
    );

    if (!otherRows.length) {
      return res.status(400).json({
        error: "No entry found in other_case_entries for this case."
      });
    }

    const otherData = otherRows[0];

    // Select Template
    const cutoffDate = new Date("2004-04-01");
    const docDate = caseData.DocumentDate ? new Date(caseData.DocumentDate) : new Date();

    const templateName =
      docDate < cutoffDate ? "ValuationReportOld.docx" : "ValuationReportNew.docx";

    const templatePath = path.join(__dirname, "templates", templateName);

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "^^", end: "^^" }
    });

    // Prepare Data
    const data = {
      SROName: caseData.SROName || "",
      CaseNo: caseData.CaseNo || "",
      CaseYear: caseData.CaseYear || "",
      DocumentDate: caseData.DocumentDate
        ? new Date(caseData.DocumentDate).toLocaleDateString("en-GB")
        : "",
      vaad: otherData.vaad,
      letter_no: otherData.letter_no,
      letter_date: otherData.letter_date
        ? new Date(otherData.letter_date).toLocaleDateString("en-GB")
        : "",
      civil_case_no: otherData.civil_case_no,
      civil_case_year: otherData.civil_case_year,
      court_name: otherData.court_name,
      GeneratedAt: new Date().toLocaleDateString("hi-IN")
    };

    doc.setData(data);
    doc.render();

    const buffer = doc.getZip().generate({ type: "nodebuffer" });

    // Save File
    const outDir = path.join(__dirname, "generated_valuation_reports");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const fileName = `ValuationReport_${caseData.CaseNo}_${caseData.CaseYear}_${Date.now()}.docx`;

    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      filePath: `generated_valuation_reports/${fileName}`
    });

  } catch (error) {
    console.error("❌ ERROR generating valuation report:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// ------------------ OTHER ROUTES HERE (order sheet, notices) ------------------
// (They stay unchanged; only valuation block needed fix)


// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);
