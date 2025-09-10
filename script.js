// ==========================
// CONFIG
// ==========================

// Replace with your Google Sheet JSON export URL
// (publish the sheet → File > Share > Publish to web → get the CSV/TSV link or use API)
const SHEET_URL = "https://script.google.com/macros/s/AKfycby168962IDGI-fRyX7ml2eenU5gJHPk4P2S4rLbUwTE-k53eWehzGXA616utmNrA6t_Tw/exec";

// Will store fetched users/grades
window.users = [];


// ==========================
// FETCH DATA FROM GOOGLE SHEETS
// ==========================
async function loadData() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.json();

    // Example: adapt this depending on your Sheet’s structure
    // Assuming sheet columns: Username | Password | Role | Subject | Grade
    window.users = data.map(row => ({
      username: row.Username,
      password: row.Password,
      role: row.Role,
      subject: row.Subject,
      grade: row.Grade
    }));

    console.log("Data loaded:", window.users);
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Failed to load data from Google Sheets.");
  }
}


// ==========================
// LOGIN HANDLER
// ==========================
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let matchedUser = window.users.find(
    user => user.username === username && user.password === password
  );

  if (matchedUser) {
    // Save session in localStorage
    localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));

    if (matchedUser.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "student.html";
    }
  } else {
    alert("Invalid username or password!");
  }
}


// ==========================
// STUDENT DASHBOARD
// ==========================
function loadStudentPage() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || user.role !== "student") {
    alert("Access denied. Please log in as a student.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("studentName").textContent = user.username;

  // Show this student's grades
  const grades = window.users.filter(u => u.username === user.username);

  const table = document.getElementById("gradesTable");
  table.innerHTML = `
    <tr>
      <th>Subject</th>
      <th>Grade</th>
    </tr>
  `;

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
function loadAdminPage() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || user.role !== "admin") {
    alert("Access denied. Please log in as an admin.");
    window.location.href = "index.html";
    return;
  }

  const table = document.getElementById("adminTable");
  table.innerHTML = `
    <tr>
      <th>Username</th>
      <th>Subject</th>
      <th>Grade</th>
    </tr>
  `;

  window.users.forEach(u => {
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

  // Detect which page we’re on
  if (document.body.classList.contains("login-page")) {
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
  }

  if (document.body.classList.contains("student-page")) {
    loadStudentPage();
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  }

  if (document.body.classList.contains("admin-page")) {
    loadAdminPage();
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  }
});
