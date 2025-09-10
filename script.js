// =============================
// CONFIG
// =============================
const API_URL = "https://script.google.com/macros/s/AKfycby168962IDGI-fRyX7ml2eenU5gJHPk4P2S4rLbUwTE-k53eWehzGXA616utmNrA6t_Tw/exec"; 
// Replace with your deployed Apps Script Web App link

// =============================
// LOGIN FUNCTION
// =============================
async function login() {
  const username = document.getElementById("username")?.value;
  const password = document.getElementById("password")?.value;

  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "login", username, password })
    });

    const result = await response.json();

    if (result.success) {
      // If admin login, redirect to admin.html
      if (result.role === "admin") {
        localStorage.setItem("adminSession", "true");
        window.location.href = "admin.html";
      } else {
        // Student login → save student data
        localStorage.setItem("studentData", JSON.stringify(result.student));
        window.location.href = "student.html";
      }
    } else {
      alert("Invalid credentials. Try again.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Error connecting to server.");
  }
}

// =============================
// ADMIN DASHBOARD FUNCTIONS
// =============================

// Show one section at a time
function showSection(sectionId) {
  document.querySelectorAll(".admin-section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}

// Exit Admin Dashboard
function exitAdmin() {
  localStorage.removeItem("adminSession");
  window.location.href = "login.html";
}

// Register Student
async function registerStudent() {
  const data = {
    action: "register",
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    program: document.getElementById("program").value,
    block: document.getElementById("block").value,
    courses: document.getElementById("courses").value
  };

  if (!data.firstName || !data.lastName || !data.program || !data.block) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message || "Student registered successfully!");
    
    // Clear form
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("program").value = "";
    document.getElementById("block").value = "";
    document.getElementById("courses").value = "";
  } catch (err) {
    console.error("Register error:", err);
    alert("Error connecting to server.");
  }
}

// =============================
// STUDENT DASHBOARD FUNCTIONS
// =============================
window.onload = function () {
  // If student.html is loaded
  if (document.getElementById("welcomeText")) {
    const studentData = JSON.parse(localStorage.getItem("studentData"));
    if (!studentData) {
      window.location.href = "login.html";
      return;
    }

    // Display student info
    document.getElementById("welcomeText").textContent =
      `Welcome ${studentData.firstName} ${studentData.lastName}!`;
    document.getElementById("studentInfo").textContent =
      `${studentData.program} - Block ${studentData.block}`;

    // Load grades from API
    loadGrades(studentData.username);
  }
};

// Fetch grades from backend
async function loadGrades(username) {
  try {
    const response = await fetch(API_URL + "?action=getGrades&username=" + username);
    const result = await response.json();

    const gradesTable = document.getElementById("gradesTable");
    gradesTable.innerHTML = "";

    if (result.success && result.grades.length > 0) {
      result.grades.forEach(grade => {
        gradesTable.innerHTML += `
          <tr>
            <td>${grade.period}</td>
            <td>${grade.course}</td>
            <td>${grade.grade}</td>
            <td>${grade.remarks}</td>
          </tr>
        `;
      });
    } else {
      gradesTable.innerHTML = `<tr><td colspan="4">No grades available</td></tr>`;
    }
  } catch (err) {
    console.error("Error loading grades:", err);
    alert("Could not load grades.");
  }
}

// Logout for students
function logout() {
  localStorage.removeItem("studentData");
  window.location.href = "login.html";
}
