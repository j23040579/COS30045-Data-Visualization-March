// NAVIGATION
function goHome() {
  location.href = "index.html";
}

function goTV() {
  location.href = "televisions.html";
}

function goAbout() {
  location.href = "about.html";
}

function goStoryBoard() {
  location.href = "storyboard.html";
}

// STORYBOARD PAGE TOGGLE
// Only runs on storyboard.html where .toggle-btn elements exist
const buttons = document.querySelectorAll(".toggle-btn");
const pages = document.querySelectorAll(".page");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const pageNumber = btn.getAttribute("data-page");

    // Remove active from all buttons
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Hide all pages
    pages.forEach((p) => p.classList.remove("active"));

    // Show selected page
    document.getElementById("page" + pageNumber).classList.add("active");
  });
});
