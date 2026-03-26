(function () {
  function setByClass(className, value) {
    document.querySelectorAll(`.${className}`).forEach((el) => {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value ?? "";
      } else {
        el.textContent = value ?? "";
      }
    });
  }

  async function loadReferralStats() {
    try {
      const res = await fetch("/api/referral/stats", {
        credentials: "include",
      });
      const { success, stats } = await res.json();
      if (!success) return;

      setByClass(
        "ref-total-earned",
        "$" + stats.total_referral_earned.toFixed(2),
      );
      setByClass("ref-total-referrals", stats.total_referrals);
    } catch (err) {
      console.error("loadReferralStats error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReferralStats);
  } else {
    loadReferralStats();
  }
})();
