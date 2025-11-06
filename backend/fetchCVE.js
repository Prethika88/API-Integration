import fetch from "node-fetch";
import dotenv from "dotenv";
import mysql from "mysql2/promise.js";
dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function fetchAndStoreCVEData() {
  let startIndex = 0;
  const resultsPerPage = 100;
  const maxBatches = 10; // ✅ Stop after 10 batches (1000 CVEs)

  for (let batch = 0; batch < maxBatches; batch++) {
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=${startIndex}&resultsPerPage=${resultsPerPage}`;
    console.log(`Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    const cveItems = data.vulnerabilities || [];

    if (cveItems.length === 0) {
      console.log("No more data found — stopping.");
      break;
    }

    for (const item of cveItems) {
      const cveId = item.cve.id;
      const description = item.cve.descriptions?.[0]?.value || "No description";
      const published = item.cve.published || null;
      const severity =
        item.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ||
        item.cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity ||
        "N/A";

      await db.execute(
        "INSERT INTO cves (cve_id, description, published_date, severity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE description=VALUES(description), severity=VALUES(severity)",
        [cveId, description, published, severity]
      );
    }

    console.log(`✅ Inserted ${cveItems.length} records`);
    startIndex += resultsPerPage;
  }

  console.log("✅ Finished fetching limited CVE data.");
  await db.end();
}

fetchAndStoreCVEData().catch((err) => console.error("❌ Error:", err));
