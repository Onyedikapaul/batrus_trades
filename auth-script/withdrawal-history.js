(function () {
  const API_URL = "/api/transaction/withdrawal/my-history";

  // ── Inject styles ─────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.innerHTML = `
    @media (max-width: 767px) {
      .withdrawal-table thead { display: none; }
      .withdrawal-table tr {
        display: block;
        margin-bottom: 1rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 0.75rem;
      }
      .withdrawal-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;
        padding: 0.3rem 0;
        font-size: 0.875rem;
      }
      .withdrawal-table td::before {
        content: attr(data-label);
        font-weight: 600;
        color: #6c757d;
        margin-right: 0.5rem;
        white-space: nowrap;
      }
    }
    #withdrawal-modal-overlay {
      display: none;
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.55);
      z-index: 99998;
      justify-content: center;
      align-items: center;
    }
    #withdrawal-modal-overlay.active { display: flex; }
    #withdrawal-modal {
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 520px;
      margin: 1rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      position: relative;
    }
    #withdrawal-modal .modal-close {
      position: absolute; top: 1rem; right: 1rem;
      background: none; border: none;
      font-size: 1.4rem; cursor: pointer; color: #6c757d;
    }
    #withdrawal-modal .detail-row {
      display: flex; justify-content: space-between;
      padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;
      font-size: 0.9rem;
    }
    #withdrawal-modal .detail-row:last-of-type { border-bottom: none; }
    #withdrawal-modal .detail-label { color: #6c757d; font-weight: 500; }
    #withdrawal-modal .detail-value { font-weight: 600; text-align: right; word-break: break-all; }
    @media print {
      body > *:not(#withdrawal-print-area) { display: none !important; }
      #withdrawal-print-area { display: block !important; padding: 2rem; font-family: Arial, sans-serif; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject modal ──────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML("beforeend", `
    <div id="withdrawal-modal-overlay">
      <div id="withdrawal-modal">
        <button class="modal-close" id="close-withdrawal-modal">&times;</button>
        <h5 class="mb-3 font-weight-bold">Withdrawal Details</h5>
        <div id="withdrawal-modal-content"></div>
        <div class="mt-4" style="display:flex; gap:0.75rem;">
          <button id="download-withdrawal-pdf" class="btn btn-primary btn-sm">
            <i class="fa fa-download mr-1"></i> Download PDF
          </button>
          <button id="close-withdrawal-modal-btn" class="btn btn-secondary btn-sm">Close</button>
        </div>
      </div>
    </div>
    <div id="withdrawal-print-area" style="display:none;"></div>
  `);

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function statusBadge(status) {
    const map = {
      pending:   "badge-warning",
      approved:  "badge-success",
      rejected:  "badge-danger",
      cancelled: "badge-secondary",
    };
    return `<span class="badge ${map[status] || "badge-secondary"} text-capitalize">${status}</span>`;
  }

  function openModal(w) {
    document.getElementById("withdrawal-modal-content").innerHTML = `
      <div class="detail-row"><span class="detail-label">Transaction ID</span><span class="detail-value"><code>${w._id}</code></span></div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">$${Number(w.amount).toFixed(2)}</span></div>
      <div class="detail-row"><span class="detail-label">Currency</span><span class="detail-value text-capitalize">${w.currency}</span></div>
      <div class="detail-row"><span class="detail-label">Wallet Address</span><span class="detail-value"><code>${w.walletAddress}</code></span></div>
      ${w.walletTitle ? `<div class="detail-row"><span class="detail-label">Wallet Title</span><span class="detail-value">${w.walletTitle}</span></div>` : ""}
      ${w.description ? `<div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${w.description}</span></div>` : ""}
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${statusBadge(w.status)}</span></div>
      <div class="detail-row"><span class="detail-label">Date Submitted</span><span class="detail-value">${formatDate(w.createdAt)}</span></div>
      ${w.actionedAt ? `<div class="detail-row"><span class="detail-label">Date Actioned</span><span class="detail-value">${formatDate(w.actionedAt)}</span></div>` : ""}
      ${w.rejectionReason ? `<div class="detail-row"><span class="detail-label">Rejection Reason</span><span class="detail-value text-danger">${w.rejectionReason}</span></div>` : ""}
    `;
    document.getElementById("download-withdrawal-pdf").dataset.withdrawal = JSON.stringify(w);
    document.getElementById("withdrawal-modal-overlay").classList.add("active");
  }

  function closeModal() {
    document.getElementById("withdrawal-modal-overlay").classList.remove("active");
  }

  function downloadAsPDF(w) {
    // Hit backend for real PDF download
    window.location.href = `/api/transaction/withdrawal/${w._id}/receipt`;
  }

  function renderTable(withdrawals) {
    const tbody = document.querySelector(".withdrawal-history-body");
    if (!tbody) return;

    if (withdrawals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No withdrawals found.</td></tr>`;
      return;
    }

    tbody.innerHTML = withdrawals.map((w) => `
      <tr>
        <td data-label="Amount">$${Number(w.amount).toFixed(2)} <small class="text-muted text-capitalize">(${w.currency})</small></td>
        <td data-label="Status">${statusBadge(w.status)}</td>
        <td data-label="Wallet"><code style="font-size:0.72rem;">${w.walletAddress}</code></td>
        <td data-label="Date">${formatDate(w.createdAt)}</td>
        <td data-label="Action">
          <button class="btn btn-sm btn-outline-primary view-withdrawal-btn" data-withdrawal='${JSON.stringify(w).replace(/'/g, "&#39;")}'>
            <i class="fa fa-eye mr-1"></i> View
          </button>
        </td>
      </tr>
    `).join("");
  }

  // ── Events ────────────────────────────────────────────────────────────────
  document.addEventListener("click", function (e) {
    if (e.target.closest(".view-withdrawal-btn")) {
      openModal(JSON.parse(e.target.closest(".view-withdrawal-btn").dataset.withdrawal));
    }
    if (e.target.closest("#close-withdrawal-modal") || e.target.closest("#close-withdrawal-modal-btn")) {
      closeModal();
    }
    if (e.target.id === "withdrawal-modal-overlay") closeModal();
    if (e.target.closest("#download-withdrawal-pdf")) {
      const w = JSON.parse(document.getElementById("download-withdrawal-pdf").dataset.withdrawal);
      downloadAsPDF(w);
    }
  });

  function load() {
    fetch(API_URL, { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then((data) => { if (data.success) renderTable(data.withdrawals); })
      .catch((err) => console.error("[withdrawal-history]", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();