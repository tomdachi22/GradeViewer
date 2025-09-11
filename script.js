// ==========================
// CONFIG
// ==========================

// Replace with your Google Sheet CSV export URL
// (File → Share → Publish to web → choose sheet → copy "CSV" link)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRJIoMgbQHkHWzdbQ91gfpk8jiqO5NTurkdKxeE_S4sdgkXSBoIq3vM3vwSesBz2pMNU2kS7YjZVnnM/pub?output=csv";

let users = []; // cache loaded users


// ==========================
// LOAD DATA FROM SHEET (CSV)
// ==========================
async function loadData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();

    // Convert CSV into array of rows
    const rows = text.trim().split("\n").map(r => r.split(","));

    // Skip the header row
    users = rows.slice(1).map(r => ({
      username: r[0]?.trim() || "",
      password: r[1]?.trim() || "",
      role: r[2]?.trim() || "",
      subject: r[3]?.trim() || "",
      grade: r[4]?.trim() || ""
    }));

    console.log("✅ Data loaded:", users);
  } catch (error) {
    console.error("❌ Error loading data:", error);
    alert("Failed to load data from Google Sheets.");
  }
}


// ==========================
// LOGIN HANDLER
// ==========================
async function handleLogin(event) {
  event.preventDefault();

  if (!users.length) {
    await loadData();
  }

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const matchedUser = users.find(
    u => u.username === username && u.password === password
  );

  if (matchedUser) {
    localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));

    if (matchedUser.role.toLowerCase() === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "student.html";
    }
  } else {
    alert("❌ Invalid username or password!");
  }
}


// ==========================
// STUDENT DASHBOARD
// ==========================
async function loadStudentPage() {
  if (!users.length) {
    await loadData();
  }

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || user.role.toLowerCase() !== "student") {
    alert("Access denied. Please log in as a student.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("studentName").textContent = user.username;

  const grades = users.filter(u => u.username === user.username);

  const table = document.getElementById("gradesTable");
  table.innerHTML = `<tr><th>Subject</th><th>Grade</th></tr>`;

  grades.forEach(g => {
    table.innerHTML += `
      <tr>
        <td>${g.subject}</td>
        <td>${g.grade}</td>
      </tr>
    `;
  });
}


// ==========================
// ADMIN DASHBOARD
// ==========================
async function loadAdminPage() {
  if (!users.length) {
    await loadData();
  }

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || user.role.toLowerCase() !== "admin") {
    alert("Access denied. Please log in as an admin.");
    window.location.href = "index.html";
    return;
  }

  const table = document.getElementById("adminTable");
  table.innerHTML = `<tr><th>Username</th><th>Subject</th><th>Grade</th></tr>`;

  users.forEach(u => {
    table.innerHTML += `
      <tr>
        <td>${u.username}</td>
        <td>${u.subject}</td>
        <td>${u.grade}</td>
      </tr>
    `;
  });
}


// ==========================
// LOGOUT
// ==========================
function handleLogout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}


// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();

  if (document.body.classList.contains("login-page")) {
    document.getElementById("loginForm")
      .addEventListener("submit", handleLogin);
  }

  if (document.body.classList.contains("student-page")) {
    await loadStudentPage();
    document.getElementById("logoutBtn")
      .addEventListener("click", handleLogout);
  }

  if (document.body.classList.contains("admin-page")) {
    await loadAdminPage();
    document.getElementById("logoutBtn")
      .addEventListener("click", handleLogout);
  }
});
