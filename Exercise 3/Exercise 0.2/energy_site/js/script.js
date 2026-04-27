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

const buttons = document.querySelectorAll(".toggle-btn");
const pages = document.querySelectorAll(".page");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const pageNumber = btn.getAttribute("data-page");

    // remove active from all buttons
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // hide all pages
    pages.forEach((p) => p.classList.remove("active"));

    // show selected page
    document.getElementById("page" + pageNumber).classList.add("active");
  });
});
