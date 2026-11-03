(() => {
  "use strict";

  const themeToggle = document.getElementById("themeToggle");
  const searchInput = document.getElementById("searchInput");
  const currentYear = document.getElementById("currentYear");

  // Theme setup
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";

    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );

    localStorage.setItem("modprehub-theme", theme);
  }

  const savedTheme = localStorage.getItem("modprehub-theme") || "dark";
  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme");

    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  // Current year
  currentYear.textContent = new Date().getFullYear();

  // Search placeholder behavior
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    if (query.length > 0) {
      searchInput.setAttribute(
        "aria-label",
        "Search: " + query
      );
    } else {
      searchInput.setAttribute("aria-label", "Search apps");
    }
  });

  // Prevent search from submitting a form
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

})();