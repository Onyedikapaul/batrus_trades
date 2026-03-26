document.addEventListener("DOMContentLoaded", async function () {
  try {
    const res = await fetch("/api/auth/check-auth", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!data.ok) {
      // Not authenticated, redirect to login
      window.location.href = "/auth/login.html";
    }
  } catch (err) {
    // Server error — redirect to login to be safe
    window.location.href = "/auth/login.html";
  }
});