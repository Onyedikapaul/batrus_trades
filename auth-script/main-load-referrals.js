(function () {
  const API_URL = "/api/referral/my-referrals";

  function setByClass(className, value) {
    document.querySelectorAll(`.${className}`).forEach((el) => {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value ?? "";
      } else {
        el.textContent = value ?? "";
      }
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  }

  function loadReferrals() {
    fetch(API_URL, { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
                  console.log("API response:", JSON.stringify(data, null, 2));

        setByClass(
          "referral-grand-total",
          "$" + Number(data.grandTotal).toFixed(2),
        );
        setByClass("referral-count", data.count);

        const referrals = data.referrals;

        // ── Left table: username + date joined ────────────────────────────
        const leftTbody = document.querySelector(".referral-list-body");
        if (leftTbody) {
          if (referrals.length === 0) {
            leftTbody.innerHTML = `
              <tr>
                <td colspan="2" class="text-center text-muted">No referrals yet.</td>
              </tr>`;
          } else {
            leftTbody.innerHTML = referrals
              .map(
                (r) => `
              <tr>
                <td>${r.referred?.username ?? "N/A"}</td>
                <td>${formatDate(r.referred?.createdAt)}</td>
              </tr>
            `,
              )
              .join("");
          }
        }

        // ── Right table: flatten earnings, use parent r.referred for user info
        const rightTbody = document.querySelector(".referral-earnings-body");
        if (rightTbody) {
          // Each earning row = earning data + referred user from parent referral
          const allEarnings = referrals.flatMap((r) =>
            r.earnings.map((e) => ({
              name: r.referred?.name ?? r.referred?.username ?? "N/A",
              joined: r.referred?.createdAt,
              earned: e.earned,
              earnedAt: e.createdAt, 
            })),
          );

          if (allEarnings.length === 0) {
            rightTbody.innerHTML = `
              <tr>
                <td colspan="3" class="text-center">
                  <span class="badge badge-warning">Pending</span>
                </td>
              </tr>`;
          } else {
            rightTbody.innerHTML = allEarnings
              .map(
                (e) => `
              <tr>
                <td>${e.name}</td>
                <td>$${Number(e.earned).toFixed(2)}</td>
                <td>${formatDate(e.joined)}</td>
              </tr>
            `,
              )
              .join("");
          }
        }
      })
      .catch((err) => console.error("[load-referrals]", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReferrals);
  } else {
    loadReferrals();
  }
})();
