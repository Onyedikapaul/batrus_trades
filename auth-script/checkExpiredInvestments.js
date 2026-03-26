(function () {
  const ENDPOINT = "/api/investments/check-expired";
  const INTERVAL_MS = 20 * 60 * 1000; // 20 minutes
  const DEBUG = true;

  const log = (...args) => DEBUG && console.log("[InvCheck]", ...args);
  const warn = (...args) => console.warn("[InvCheck]", ...args);

  async function checkExpiredInvestments() {
    log("Running check at", new Date().toLocaleTimeString());

    try {
      const res = await fetch(ENDPOINT, {
        method: "GET",
        credentials: "include", // sends httpOnly cookie automatically
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 || res.status === 403) {
        log("Not authenticated, skipping check.");
        return;
      }

      if (!res.ok) {
        warn(`Server responded with ${res.status}`);
        return;
      }

      const data = await res.json();
      log("Response:", data);

      if (data.processed > 0) {
        log(`✔ ${data.processed} investment(s) completed and credited.`);
      } else {
        log("No expired investments this round.");
      }
    } catch (err) {
      warn("Failed to reach check endpoint:", err.message);
    }
  }

  checkExpiredInvestments();
  setInterval(checkExpiredInvestments, INTERVAL_MS);

  log("Scheduler started. Interval:", INTERVAL_MS / 1000 / 60, "minutes");
})();
