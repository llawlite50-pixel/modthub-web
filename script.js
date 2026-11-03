
(() => {
  "use strict";
  // Replace these with your actual Supabase project values.
  // Never put your secret/service-role key in this file.
  const SUPABASE_URL = "https://clbuxkvagwpsmjmlngsf.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rJc5pu_T3JTNgKUXW38dOg_zNbOdljJ";

  const themeToggle = document.getElementById("themeToggle");
  const searchInput = document.getElementById("searchInput");
  const currentYear = document.getElementById("currentYear");
  const appCount = document.getElementById("appCount");
  const emptyState = document.getElementById("emptyState");
  const appsSection = document.getElementById("apps");

  let allApps = [];

  // Theme
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    localStorage.setItem("modprehub-theme", theme);
  }

  applyTheme(localStorage.getItem("modprehub-theme") || "dark");

  themeToggle?.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // App list container
  const appGrid = document.createElement("div");
  appGrid.id = "appGrid";
  appGrid.className = "app-grid";

  if (appsSection) {
    appsSection.appendChild(appGrid);
  }

  function showMessage(message) {
    if (!emptyState) return;

    emptyState.hidden = false;
    emptyState.querySelector("h3").textContent = message;

    const paragraph = emptyState.querySelector("p");
    if (paragraph) {
      paragraph.textContent =
        "Please try again later or visit our Telegram channel.";
    }

    appGrid.replaceChildren();
  }

  
function createAppCard(app) {
  const card = document.createElement("a");
  card.className = "app-card";
  card.href = app.apk_url;
  card.setAttribute("aria-label", `Download ${app.title}`);

  const icon = document.createElement("img");
  icon.className = "app-icon";
  icon.alt = app.title || "App icon";
  icon.loading = "lazy";
  icon.src = app.icon_url || "https://placehold.co/128x128";
  icon.addEventListener("error", () => {
    icon.src = "https://placehold.co/128x128";
  }, { once: true });

  const title = document.createElement("h3");
  title.className = "app-title";
  title.textContent = app.title || "Untitled App";

  const rating = document.createElement("div");
  rating.className = "app-rating";
  rating.textContent = "★★★★★";
  rating.setAttribute("aria-label", "5 stars");

  const version = document.createElement("span");
  version.className = "app-version";
  version.textContent = `v${app.version || "1.0"}`;

  card.append(icon, title, rating, version);
  return card;
}


  function renderApps(apps) {
    appGrid.replaceChildren();

    if (appCount) {
      appCount.textContent = String(apps.length);
    }

    if (emptyState) {
      emptyState.hidden = apps.length > 0;
    }

    if (apps.length === 0) {
      if (emptyState) {
        const heading = emptyState.querySelector("h3");
        const paragraph = emptyState.querySelector("p");

        if (heading) heading.textContent = "No Apps Found";
        if (paragraph) {
          paragraph.textContent =
            "No published apps match your search.";
        }
      }
      return;
    }

    apps.forEach((app) => {
      appGrid.appendChild(createAppCard(app));
    });
  }

  // Load published apps from Supabase
  async function loadApps() {
    if (
      SUPABASE_URL.includes("YOUR_SUPABASE") ||
      SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE")
    ) {
      showMessage("Supabase Setup Needed");
      console.error("Add your Supabase URL and publishable key to script.js.");
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/apps?select=id,title,description,version,category,icon_url,apk_url,featured,published,created_at&published=eq.true&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Supabase error:", response.status, errorText);
        showMessage("Could Not Load Apps");
        return;
      }

      allApps = await response.json();
      renderApps(allApps);
    } catch (error) {
      console.error("Failed to load apps:", error);
      showMessage("Connection Error");
    }
  }

  // Search apps
  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    const filteredApps = allApps.filter((app) => {
      const searchableText = [
        app.title,
        app.description,
        app.category,
        app.version
      ].filter(Boolean).join(" ").toLowerCase();

      return searchableText.includes(query);
    });

    renderApps(filteredApps);
  });

  loadApps();
})();
