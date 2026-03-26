document.addEventListener("DOMContentLoaded", async function () {
  try {
    const res = await fetch("/api/auth/check-auth", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (data.ok) {
      // User is authenticated, redirect to dashboard
      window.location.href = "/account";
    }
  } catch (err) {
    // Not authenticated or server error — stay on the page
    console.error("Auth check failed:", err);
  }
});
