const BASE_URL = "http://localhost:5000/api/cves";
let currentPage = 1;
let limit = 10;

const tableBody = document.querySelector("#cveTable tbody");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const resultsSelect = document.getElementById("resultsPerPage");
const totalCountEl = document.getElementById("totalCount");

async function fetchCves(page = 1, limit = 10) {
  try {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    const data = await res.json();

    // ✅ Update total record count
    totalCountEl.textContent = data.total;

    // ✅ Populate table rows
    tableBody.innerHTML = "";
    data.data.forEach((cve) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cve.cve_id}</td>
        <td>${cve.identifier}</td>
        <td>${cve.published_date}</td>
        <td>${cve.last_modified_date}</td>
        <td>${cve.status}</td>
      `;

      // ✅ Navigate to details page
      row.addEventListener("click", () => {
        window.location.href = `detail.html?id=${cve.cve_id}`;
      });

      tableBody.appendChild(row);
    });

    // ✅ Update pagination info
    const totalPages = Math.ceil(data.total / data.limit);
    pageInfo.textContent = `Page ${data.page} of ${totalPages}`;
    prevBtn.disabled = data.page <= 1;
    nextBtn.disabled = data.page >= totalPages;
  } catch (err) {
    console.error("Error fetching CVEs:", err);
  }
}

// ✅ Pagination logic
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchCves(currentPage, limit);
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  fetchCves(currentPage, limit);
});

// ✅ Change results per page
resultsSelect.addEventListener("change", (e) => {
  limit = parseInt(e.target.value);
  currentPage = 1;
  fetchCves(currentPage, limit);
});

// ✅ Initial load
fetchCves(currentPage, limit);
