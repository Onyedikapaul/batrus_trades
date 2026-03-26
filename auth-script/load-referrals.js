(function () {
  const API_URL = "/api/referral/my-referrals";

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

  function loadReferrals() {
    fetch(API_URL, { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Set totals via class
        setByClass(
          "referral-grand-total",
          "$" + Number(data.grandTotal).toFixed(2),
        );
        setByClass("referral-count", data.count);

        const tbody = document.querySelector(".referral-table-body");
        if (!tbody) return;

        const top3 = data.referrals.slice(0, 3);

        if (top3.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="3" class="text-center text-muted">No referrals yet.</td>
            </tr>`;
          return;
        }

        tbody.innerHTML = top3
          .map(
            (r) => `
          <tr>
            <td>${r.referred?.name ?? "N/A"}</td>
            <td>${r.referred?.username ?? "N/A"}</td>
            <td>${r.totalEarned > 0 ? "$" + r.totalEarned.toFixed(2) : '<span class="badge badge-warning">Pending</span>'}</td>
          </tr>
        `,
          )
          .join("");
      })
      .catch((err) => console.error("[load-referrals]", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReferrals);
  } else {
    loadReferrals();
  }
})();
