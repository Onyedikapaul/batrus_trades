(function () {
  // ── Inject styles ─────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    .inv-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .inv-tabs::-webkit-scrollbar { display: none; }

    .inv-tab-btn {
      background: none;
      border: none;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #8898aa;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: color 0.2s, border-color 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .inv-tab-btn:hover { color: #32325d; }
    .inv-tab-btn.active { color: #5e72e4; border-bottom-color: #5e72e4; }
    .inv-tab-btn .inv-count {
      background: #e9ecef;
      color: #525f7f;
      border-radius: 20px;
      padding: 1px 8px;
      font-size: 11px;
      font-weight: 700;
    }
    .inv-tab-btn.active .inv-count { background: #eaecfb; color: #5e72e4; }

    .inv-tab-panel { display: none; }
    .inv-tab-panel.active { display: block; }

    .inv-scroll-area {
      max-height: 480px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .inv-scroll-area::-webkit-scrollbar { width: 5px; }
    .inv-scroll-area::-webkit-scrollbar-track { background: #f6f9fc; border-radius: 10px; }
    .inv-scroll-area::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }

    .inv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    @media (max-width: 480px) {
      .inv-grid {
        grid-template-columns: 1fr;
      }
      .inv-tab-btn {
        padding: 10px 10px;
        font-size: 12px;
      }
      .inv-tab-btn i { display: none; }
    }

    .inv-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 18px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .inv-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }

    .inv-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .inv-plan-name {
      font-size: 14px;
      font-weight: 700;
      color: #32325d;
      margin: 0;
    }
    .inv-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .inv-badge.active   { background: #d4edda; color: #1a7431; }
    .inv-badge.completed { background: #e2e3e5; color: #383d41; }
    .inv-badge.cancelled { background: #fde8e8; color: #c0392b; }

    .inv-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #8898aa;
      padding: 4px 0;
      border-bottom: 1px dashed #f0f0f0;
    }
    .inv-row:last-child { border-bottom: none; }
    .inv-row strong { color: #525f7f; }

    .inv-progress-wrap { margin-top: 12px; }
    .inv-progress-label {
      font-size: 11px;
      color: #8898aa;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .inv-progress-bar-bg {
      height: 6px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
    }
    .inv-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #5e72e4, #825ee4);
      border-radius: 10px;
      transition: width 0.6s ease;
    }

    .inv-reason-box {
      margin-top: 10px;
      background: #fff5f5;
      border-left: 3px solid #e74c3c;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      color: #c0392b;
    }
    .inv-reason-box span { font-weight: 600; }

    .inv-empty {
      text-align: center;
      padding: 40px 20px;
      color: #adb5bd;
      font-size: 14px;
    }
    .inv-empty i { font-size: 32px; display: block; margin-bottom: 10px; opacity: 0.4; }
  
  `;
  document.head.appendChild(style);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmt(n) {
    return parseFloat(n).toFixed(2);
  }
  function fmtDate(d) {
    return new Date(d).toLocaleString();
  }

  function progressPct(inv) {
    const start = new Date(inv.createdAt).getTime();
    const end = new Date(inv.expires_at).getTime();
    const now = Date.now();
    const pct = Math.min(
      100,
      Math.max(0, ((now - start) / (end - start)) * 100),
    );
    return Math.round(pct);
  }

  // ── Card builders ─────────────────────────────────────────────────────────
  function buildCard(inv, status) {
    const pct = status === "active" ? progressPct(inv) : null;
    const badgeLabel = status.charAt(0).toUpperCase() + status.slice(1);

    const progressHTML =
      pct !== null
        ? `
      <div class="inv-progress-wrap">
        <div class="inv-progress-label"><span>Progress</span><span>${pct}%</span></div>
        <div class="inv-progress-bar-bg">
          <div class="inv-progress-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>`
        : "";

    const reasonHTML =
      status === "cancelled" && inv.cancellationReason
        ? `
      <div class="inv-reason-box"><span>Reason:</span> ${inv.cancellationReason}</div>`
        : "";

    const expiresLabel =
      status === "active"
        ? "Expires"
        : status === "completed"
          ? "Completed"
          : "Cancelled";

    return `
      <div class="inv-card">
        <div class="inv-card-header">
          <p class="inv-plan-name">${inv.plan?.name || "—"}</p>
          <span class="inv-badge ${status}">${badgeLabel}</span>
        </div>
        <div class="inv-row"><span>Invested</span><strong>$${fmt(inv.amount)}</strong></div>
        <div class="inv-row"><span>Expected Return</span><strong>$${fmt(inv.return_amount)}</strong></div>
        <div class="inv-row"><span>ROI</span><strong>${inv.plan?.return_percentage ?? "—"}%</strong></div>
        <div class="inv-row"><span>Duration</span><strong>${inv.plan?.duration_hours ?? "—"} hrs</strong></div>
        <div class="inv-row"><span>${expiresLabel}</span><strong>${fmtDate(inv.expires_at)}</strong></div>
        <div class="inv-row"><span>Started</span><strong>${fmtDate(inv.createdAt)}</strong></div>
        ${progressHTML}
        ${reasonHTML}
      </div>`;
  }

  function renderPanel(container, items, status) {
    if (!items.length) {
      container.innerHTML = `<div class="inv-empty"><i class="fa fa-inbox"></i>No ${status} investments</div>`;
      return;
    }
    container.innerHTML = `<div class="inv-scroll-area"><div class="inv-grid">${items.map((i) => buildCard(i, status)).join("")}</div></div>`;
  }

  // ── Build tab UI ──────────────────────────────────────────────────────────
  function buildTabs(active, completed, cancelled) {
    // Find the card-body that currently holds the section markup
    const cardBody = document.querySelector(".card-body");
    if (!cardBody) return;

    cardBody.innerHTML = `
      <div class="inv-tabs">
        <button class="inv-tab-btn active" data-tab="active">
          <i class="fa fa-bolt"></i> Active <span class="inv-count">${active.length}</span>
        </button>
        <button class="inv-tab-btn" data-tab="completed">
          <i class="fa fa-check-circle"></i> Completed <span class="inv-count">${completed.length}</span>
        </button>
        <button class="inv-tab-btn" data-tab="cancelled">
          <i class="fa fa-times-circle"></i> Cancelled <span class="inv-count">${cancelled.length}</span>
        </button>
      </div>

      <div class="inv-tab-panel active" id="tab-active"></div>
      <div class="inv-tab-panel"        id="tab-completed"></div>
      <div class="inv-tab-panel"        id="tab-cancelled"></div>
    `;

    renderPanel(document.getElementById("tab-active"), active, "active");
    renderPanel(
      document.getElementById("tab-completed"),
      completed,
      "completed",
    );
    renderPanel(
      document.getElementById("tab-cancelled"),
      cancelled,
      "cancelled",
    );

    // Tab switching
    cardBody.querySelectorAll(".inv-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        cardBody
          .querySelectorAll(".inv-tab-btn")
          .forEach((b) => b.classList.remove("active"));
        cardBody
          .querySelectorAll(".inv-tab-panel")
          .forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document
          .getElementById("tab-" + btn.dataset.tab)
          .classList.add("active");
      });
    });
  }

  // ── Fetch & render ────────────────────────────────────────────────────────
  async function loadInvestments() {
    const cardBody = document.querySelector(".card-body");
    if (cardBody) cardBody.innerHTML = '<div class="lead m-4">Loading...</div>';

    try {
      const res = await fetch("/api/investment/user", {
        credentials: "include",
      });
      const { success, data } = await res.json();
      if (!success) throw new Error();

      const active = data.filter((i) => i.status === "active");
      const completed = data.filter((i) => i.status === "completed");
      const cancelled = data.filter((i) => i.status === "cancelled");

      buildTabs(active, completed, cancelled);
    } catch (err) {
      if (cardBody)
        cardBody.innerHTML =
          '<div class="lead m-4 text-danger">Failed to load investments.</div>';
      console.error(err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadInvestments);
  } else {
    loadInvestments();
  }
})();
