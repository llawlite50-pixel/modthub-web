
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar a");

  links.forEach(link => {
    link.addEventListener("click", event => {
      links.forEach(item => item.classList.remove("active"));
      event.currentTarget.classList.add("active");
    });
  });

  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  console.log("MoDThub Admin UI loaded.");
});
