(function () {
  const API_URL = "/api/transaction/deposit/my-history";

  // ── Inject styles ─────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.innerHTML = `
    @media (max-width: 767px) {
      .deposit-table thead { display: none; }
      .deposit-table tr {
        display: block;
        margin-bottom: 1rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 0.75rem;
      }
      .deposit-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;
        padding: 0.3rem 0;
        font-size: 0.875rem;
      }
      .deposit-table td::before {
        content: attr(data-label);
        font-weight: 600;
        color: #6c757d;
        margin-right: 0.5rem;
        white-space: nowrap;
      }
    }
    #deposit-modal-overlay {
      display: none;
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.55);
      z-index: 99998;
      justify-content: center;
      align-items: center;
    }
    #deposit-modal-overlay.active { display: flex; }
    #deposit-modal {
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 520px;
      margin: 1rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      position: relative;
    }
    #deposit-modal .modal-close {
      position: absolute; top: 1rem; right: 1rem;
      background: none; border: none;
      font-size: 1.4rem; cursor: pointer; color: #6c757d;
    }
    #deposit-modal .detail-row {
      display: flex; justify-content: space-between;
      padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;
      font-size: 0.9rem;
    }
    #deposit-modal .detail-row:last-of-type { border-bottom: none; }
    #deposit-modal .detail-label { color: #6c757d; font-weight: 500; }
    #deposit-modal .detail-value { font-weight: 600; text-align: right; word-break: break-all; }
    @media print {
      body > *:not(#print-area) { display: none !important; }
      #print-area { display: block !important; padding: 2rem; font-family: Arial, sans-serif; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject modal + print area ─────────────────────────────────────────────
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="deposit-modal-overlay">
      <div id="deposit-modal">
        <button class="modal-close" id="close-deposit-modal">&times;</button>
        <h5 class="mb-3 font-weight-bold">Deposit Details</h5>
        <div id="deposit-modal-content"></div>
        <div class="mt-4" style="display:flex; gap:0.75rem;">
          <button id="download-deposit-pdf" class="btn btn-primary btn-sm">
            <i class="fa fa-download mr-1"></i> Download PDF
          </button>
          <button id="close-deposit-modal-btn" class="btn btn-secondary btn-sm">Close</button>
        </div>
      </div>
    </div>
    <div id="print-area" style="display:none;"></div>
  `,
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusBadge(status) {
    const map = {
      pending: "badge-warning",
      confirmed: "badge-success",
      rejected: "badge-danger",
      cancelled: "badge-secondary",
    };
    return `<span class="badge ${map[status] || "badge-secondary"} text-capitalize">${status}</span>`;
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  function openModal(deposit) {
    document.getElementById("deposit-modal-content").innerHTML = `
      <div class="detail-row"><span class="detail-label">Transaction ID</span><span class="detail-value"><code>${deposit._id}</code></span></div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">$${Number(deposit.amount).toFixed(2)}</span></div>
      <div class="detail-row"><span class="detail-label">Payment Method</span><span class="detail-value text-capitalize">${deposit.paymentMethod}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${statusBadge(deposit.status)}</span></div>
      <div class="detail-row"><span class="detail-label">Date Submitted</span><span class="detail-value">${formatDate(deposit.createdAt)}</span></div>
      ${deposit.actionedAt ? `<div class="detail-row"><span class="detail-label">Date Actioned</span><span class="detail-value">${formatDate(deposit.actionedAt)}</span></div>` : ""}
      ${deposit.rejectionReason ? `<div class="detail-row"><span class="detail-label">Rejection Reason</span><span class="detail-value text-danger">${deposit.rejectionReason}</span></div>` : ""}
    `;
    document.getElementById("download-deposit-pdf").dataset.deposit =
      JSON.stringify(deposit);
    document.getElementById("deposit-modal-overlay").classList.add("active");
  }

  function closeModal() {
    document.getElementById("deposit-modal-overlay").classList.remove("active");
  }

  // ── PDF download via print ────────────────────────────────────────────────
  function downloadAsPDF(deposit) {
    // Hit backend — browser will download the PDF directly
    window.location.href = `/api/transaction/deposit/${deposit._id}/receipt`;
  }

  function downloadAsPDF_old(deposit) {
    const printArea = document.getElementById("print-area");
    printArea.style.display = "block";
    printArea.innerHTML = `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h2 style="color:#172b4d;border-bottom:2px solid #172b4d;padding-bottom:0.5rem;">Digitex Waves — Deposit Receipt</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:1.5rem;">
          <tr style="background:#f8f9fa;"><td style="padding:0.75rem;font-weight:600;color:#6c757d;width:40%;">Transaction ID</td><td style="padding:0.75rem;">${deposit._id}</td></tr>
          <tr><td style="padding:0.75rem;font-weight:600;color:#6c757d;">Amount</td><td style="padding:0.75rem;">$${Number(deposit.amount).toFixed(2)}</td></tr>
          <tr style="background:#f8f9fa;"><td style="padding:0.75rem;font-weight:600;color:#6c757d;">Payment Method</td><td style="padding:0.75rem;text-transform:capitalize;">${deposit.paymentMethod}</td></tr>
          <tr><td style="padding:0.75rem;font-weight:600;color:#6c757d;">Status</td><td style="padding:0.75rem;text-transform:capitalize;">${deposit.status}</td></tr>
          <tr style="background:#f8f9fa;"><td style="padding:0.75rem;font-weight:600;color:#6c757d;">Date Submitted</td><td style="padding:0.75rem;">${formatDate(deposit.createdAt)}</td></tr>
          ${deposit.actionedAt ? `<tr><td style="padding:0.75rem;font-weight:600;color:#6c757d;">Date Actioned</td><td style="padding:0.75rem;">${formatDate(deposit.actionedAt)}</td></tr>` : ""}
          ${deposit.rejectionReason ? `<tr style="background:#f8f9fa;"><td style="padding:0.75rem;font-weight:600;color:#6c757d;">Rejection Reason</td><td style="padding:0.75rem;color:#e74c3c;">${deposit.rejectionReason}</td></tr>` : ""}
        </table>
        <p style="margin-top:2rem;color:#adb5bd;font-size:0.8rem;">Generated on ${new Date().toLocaleString()} — Digitex Waves</p>
      </div>
    `;
    window.print();
    setTimeout(() => {
      printArea.style.display = "none";
    }, 1000);
  }

  // ── Render table ──────────────────────────────────────────────────────────
  function renderTable(deposits) {
    const tbody = document.querySelector(".deposit-history-body");
    if (!tbody) return;

    if (deposits.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No deposits found.</td></tr>`;
      return;
    }

    tbody.innerHTML = deposits
      .map(
        (d) => `
      <tr>
        <td data-label="Amount">$${Number(d.amount).toFixed(2)} <small class="text-muted text-capitalize">(${d.paymentMethod})</small></td>
        <td data-label="Status">${statusBadge(d.status)}</td>
        <td data-label="Transaction ID"><code style="font-size:0.72rem;">${d._id}</code></td>
        <td data-label="Date">${formatDate(d.createdAt)}</td>
        <td data-label="Action">
          <button class="btn btn-sm btn-outline-primary view-deposit-btn" data-deposit='${JSON.stringify(d).replace(/'/g, "&#39;")}'>
            <i class="fa fa-eye mr-1"></i> View
          </button>
        </td>
      </tr>
    `,
      )
      .join("");
  }

  // ── Event listeners ───────────────────────────────────────────────────────
  document.addEventListener("click", function (e) {
    if (e.target.closest(".view-deposit-btn")) {
      const btn = e.target.closest(".view-deposit-btn");
      openModal(JSON.parse(btn.dataset.deposit));
    }
    if (
      e.target.closest("#close-deposit-modal") ||
      e.target.closest("#close-deposit-modal-btn")
    ) {
      closeModal();
    }
    if (e.target.id === "deposit-modal-overlay") {
      closeModal();
    }
    if (e.target.closest("#download-deposit-pdf")) {
      const deposit = JSON.parse(
        document.getElementById("download-deposit-pdf").dataset.deposit,
      );
      downloadAsPDF(deposit);
    }
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  function loadDepositHistory() {
    fetch(API_URL, { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) renderTable(data.deposits);
      })
      .catch((err) => console.error("[deposit-history]", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDepositHistory);
  } else {
    loadDepositHistory();
  }
})();
