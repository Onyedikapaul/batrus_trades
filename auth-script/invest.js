async function loadPlans() {
  const container = document.getElementById("plans-container");
  try {
    const res = await fetch("/api/investment/plans");
    const { success, data } = await res.json();

    if (!success || !data.length) {
      container.innerHTML =
        '<p class="text-muted text-center">No plans available.</p>';
      return;
    }

container.innerHTML = data
  .map((plan, i) => {
    const icons = ["◈", "◆", "✦", "❋", "★"];
    const tiers = ["#6b7280", "#f59e0b", "#a78bfa", "#34d399", "#f97316"];
    const color = tiers[i] || tiers[0];

    return `
      <div class="col-sm-6 mb-3">
        <div style="
          background: #1a1f2e;
          border: 1px solid #2a3145;
          border-top: 3px solid ${color};
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: transform 0.2s, border-color 0.2s;
          cursor: pointer;
        " onmouseenter="this.style.transform='translateY(-3px)';this.style.borderColor='${color}'"
           onmouseleave="this.style.transform='translateY(0)';this.style.borderTop='3px solid ${color}';this.style.borderColor='#2a3145';this.style.borderTopColor='${color}'">

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; font-weight:600;">${icons[i] || "◈"} Investment Plan</span>
              <h5 style="margin:4px 0 0; font-size:18px; font-weight:700; color:#f1f5f9;">${plan.name}</h5>
            </div>
            <div style="text-align:right;">
              <div style="font-size:32px; font-weight:800; color:${color}; line-height:1;">${plan.return_percentage}%</div>
              <div style="font-size:11px; color:#6b7280; margin-top:2px;">return</div>
            </div>
          </div>

          <div style="border-top: 1px solid #2a3145; padding-top:14px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
            <div style="background:#111827; border-radius:8px; padding:10px 12px;">
              <div style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Min Deposit</div>
              <div style="font-size:15px; font-weight:700; color:#f1f5f9;">$${plan.min_amount.toLocaleString()}</div>
            </div>
            <div style="background:#111827; border-radius:8px; padding:10px 12px;">
              <div style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Max Deposit</div>
              <div style="font-size:15px; font-weight:700; color:#f1f5f9;">$${plan.max_amount.toLocaleString()}</div>
            </div>
            <div style="background:#111827; border-radius:8px; padding:10px 12px;">
              <div style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Duration</div>
              <div style="font-size:15px; font-weight:700; color:#f1f5f9;">${plan.duration_hours}h</div>
            </div>
          </div>

          <a href="invest-id.html?plan=${plan._id}" style="
            display:block;
            text-align:center;
            padding: 11px;
            background: ${color};
            color: #0f172a;
            font-weight:700;
            font-size:14px;
            border-radius:8px;
            text-decoration:none;
            letter-spacing:0.3px;
            transition: opacity 0.2s;
          " onmouseenter="this.style.opacity='0.85'" onmouseleave="this.style.opacity='1'">
            Invest Now →
          </a>
        </div>
      </div>
    `;
  })
  .join("");
  } catch (err) {
    container.innerHTML =
      '<p class="text-danger text-center">Failed to load plans.</p>';
    console.error(err);
  }
}

loadPlans();
