import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Create 100 dummy CVE entries
const allCVEs = [];

for (let i = 1; i <= 100; i++) {
  const year = 1999 + (i % 25);
  const statuses = ["Analysed", "Modified", "Rejected"];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  allCVEs.push({
    cve_id: `CVE-${year}-${1000 + i}`,
    identifier: "cve@mitre.org",
    published_date: `${year}-10-17`,
    last_modified_date: "2022-10-17",
    status: randomStatus,
  });
}

// ✅ GET /api/cves (with pagination)
app.get("/api/cves", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  const pagedData = allCVEs.slice(start, end);

  res.json({
    total: allCVEs.length,
    page,
    limit,
    data: pagedData,
  });
});

// ✅ GET /api/cves/:cveId (details page)
app.get("/api/cves/:cveId", (req, res) => {
  const cveId = req.params.cveId;
  const cve = allCVEs.find((item) => item.cve_id === cveId);
  if (cve) {
    res.json(cve);
  } else {
    res.status(404).json({ message: "CVE not found" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
