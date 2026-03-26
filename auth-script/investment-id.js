const planId = new URLSearchParams(window.location.search).get("plan");

function showModal(type, message) {
  const icon = document.getElementById("modal-icon");
  const title = document.getElementById("modal-title");
  const msg = document.getElementById("modal-message");
  const btn = document.getElementById("modal-btn");

  if (type === "success") {
    icon.className = "fa fa-check-circle fa-3x text-success mb-3";
    title.textContent = "Success";
    btn.onclick = () => {
      window.location.href = "/account/investments.html";
    };
  } else {
    icon.className = "fa fa-times-circle fa-3x text-danger mb-3";
    title.textContent = "Error";
    btn.onclick = null;
  }

  msg.textContent = message;
  $("#investModal").modal("show");
}

async function loadPlanDetails() {
  if (!planId) {
    document.getElementById("package-title").textContent = "INVALID PACKAGE";
    return;
  }
  try {
    const res = await fetch(`/api/investment/plans/${planId}`, {
      credentials: "include",
    });
    const { success, data } = await res.json();
    if (!success) throw new Error();

    document.getElementById("package").value = data.name;
    document.getElementById("amount").value = data.min_amount;
    document.getElementById("amount").min = data.min_amount;
    document.getElementById("amount").max = data.max_amount;

    document.getElementById("package-title").textContent = data.name;
    document.getElementById("min-price").textContent = "$" + data.min_amount;
    document.getElementById("max-price").textContent = "$" + data.max_amount;
    document.getElementById("expected-return").textContent =
      data.return_percentage + "%";
    document.getElementById("duration").textContent =
      data.duration_hours + " Hours";

    document.getElementById("amount").addEventListener("input", function () {
      const val = parseFloat(this.value) || 0;
      const profit = (val * (data.return_percentage / 100)).toFixed(2);
      const total = (val + parseFloat(profit)).toFixed(2);
      if (document.getElementById("paymentAmount"))
        document.getElementById("paymentAmount").textContent = val;
      if (document.getElementById("totalProfit"))
        document.getElementById("totalProfit").textContent = profit;
      if (document.getElementById("total"))
        document.getElementById("total").textContent = total;
    });
  } catch (err) {
    document.getElementById("package-title").textContent = "INVALID PACKAGE";
    console.error("Failed to load plan", err);
  }
}

async function submitInvestment(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const btn = document.getElementById("invest-btn");
  btn.value = "Processing...";
  btn.disabled = true;

  try {
    const res = await fetch("/api/investment/invest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ planId, amount }),
    });
    const { success, message, new_balance } = await res.json();
    if (!success) throw new Error(message);

    if (document.getElementById("balance")) {
      document.getElementById("balance").value = new_balance;
    }

    showModal("success", "Your investment was placed successfully!");
  } catch (err) {
    showModal("error", err.message || "Investment failed. Please try again.");
    btn.value = "Invest";
    btn.disabled = false;
  }
}

document
  .getElementById("invest-form")
  .addEventListener("submit", submitInvestment);
loadPlanDetails();
