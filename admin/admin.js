
"use strict";

// Supabase project information
const SUPABASE_URL = "https://clbuxkvagwpsmjmlngsf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rJc5pu_T3JTNgKUXW38dOg_zNbOdljJ";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("modthub_admin_token");
  const status = document.getElementById("statusMessage");
  const form = document.getElementById("appForm");
  const saveButton = document.getElementById("saveAppButton");
  const appList = document.getElementById("appList");

  const showStatus = (message, error = false) => {
    status.textContent = message;
    status.style.color = error ? "#ff7777" : "#65d68a";
  };

  const logout = () => {
    sessionStorage.removeItem("modthub_admin_token");
    window.location.href = "/admin/";
  };

  document.getElementById("logoutButton").addEventListener("click", (event) => {
    event.preventDefault();
    logout();
  });

  const links = document.querySelectorAll(".sidebar a");
  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  document.getElementById("currentYear").textContent =
    new Date().getFullYear();

  if (
    !token ||
    SUPABASE_URL.includes("PASTE_") ||
    SUPABASE_PUBLISHABLE_KEY.includes("PASTE_")
  ) {
    showStatus("Login or Supabase configuration missing.", true);
    return;
  }

  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Verify that this session belongs to an authorized admin
  try {
    const check = await fetch("/.netlify/functions/check-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token })
    });

    const result = await check.json();

    if (!check.ok || !result.isAdmin) {
      logout();
      return;
    }
  } catch {
    showStatus("Could not verify admin session. Please refresh.", true);
    return;
  }

  async function loadApps() {
    appList.textContent = "Loading apps...";

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/apps?select=id,title,version,category,apk_url,downloads,created_at&order=created_at.desc`,
        { headers }
      );

      if (!response.ok) {
  const errorText = await response.text();
  console.error("Supabase error:", response.status, errorText);
  throw new Error(
    `Supabase error ${response.status}: ${errorText}`
  );
}

      const apps = await response.json();

      document.getElementById("totalApps").textContent = apps.length;

      const downloads = apps.reduce(
        (sum, app) => sum + Number(app.downloads || 0), 0
      );
      document.getElementById("totalDownloads").textContent = downloads;

      appList.replaceChildren();

      if (!apps.length) {
        appList.textContent = "No apps added yet.";
        return;
      }

      apps.forEach(app => {
        const card = document.createElement("div");
        card.style.cssText =
          "padding:14px;margin:12px 0;border:1px solid #444;border-radius:8px";

        const name = document.createElement("h3");
        name.textContent = app.title;

        const details = document.createElement("p");
        details.textContent =
          `Version: ${app.version || "N/A"} | Category: ${app.category || "N/A"} | Downloads: ${app.downloads || 0}`;

        const link = document.createElement("a");
        link.textContent = "Open APK Download";
        link.href = app.apk_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        card.append(name, details, link);
        appList.appendChild(card);
      });

    } catch (error) {
      appList.textContent = error.message;
      showStatus(error.message, true);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    showStatus("Saving app information...");

    try {
      const title = document.getElementById("appTitle").value.trim();
      const apkUrl = document.getElementById("appApk").value.trim();

      const parsedUrl = new URL(apkUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("APK URL must start with http:// or https://");
      }

      const slugInput = document.getElementById("appSlug").value.trim();
      const slug = (slugInput || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const app = {
        title,
        slug,
        version: document.getElementById("appVersion").value.trim() || null,
        category: document.getElementById("appCategory").value.trim() || null,
        description: document.getElementById("appDescription").value.trim() || null,
        icon_url: document.getElementById("appIcon").value.trim() || null,
        apk_url: apkUrl,
        featured: document.getElementById("appFeatured").checked,
        published: document.getElementById("appPublished").checked
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/apps`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation"
        },
        body: JSON.stringify(app)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.details || "Could not save app.");
      }

      form.reset();
      document.getElementById("appPublished").checked = true;

      showStatus("App information saved successfully!");
      await loadApps();

    } catch (error) {
      showStatus(error.message || "Something went wrong.", true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Save App";
    }
  });

  document.getElementById("refreshApps").addEventListener("click", loadApps);

  await loadApps();
  showStatus("Admin dashboard connected.");
});
