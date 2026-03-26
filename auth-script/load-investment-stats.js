(function () {
  function setByClass(className, value) {
    document.querySelectorAll(`.${className}`).forEach((el) => {
      if (el.tagName === "IMG") {
        el.src = value ?? "";
      } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value ?? "";
      } else {
        el.textContent = value ?? "";
      }
    });
  }

  async function loadInvestmentStats() {
    try {
      const res = await fetch("/api/investment/stats", {
        credentials: "include",
      });
      const { success, stats } = await res.json();
      if (!success) return;

      setByClass("inv-total-invested", "$" + stats.total_invested.toFixed(2));
      setByClass("inv-active-amount", "$" + stats.active_amount.toFixed(2));
      setByClass("inv-total-profit", "$" + stats.total_profit.toFixed(2));
    } catch (err) {
      console.error("loadInvestmentStats error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadInvestmentStats);
  } else {
    loadInvestmentStats();
  }
})();
