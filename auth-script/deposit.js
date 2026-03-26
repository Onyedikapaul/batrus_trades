(function () {
  const DEPOSIT_API = "/api/transaction/deposit";
  const WALLETS_API = "/api/wallets/active";

  let COIN_ADDRESSES = {};

  function showToast(message, success = true) {
    let toast = document.getElementById("deposit-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "deposit-toast";
      toast.style.cssText = `
        position: fixed; top: 30px; right: 30px;
        padding: 14px 24px; border-radius: 8px;
        font-size: 15px; font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        opacity: 0; transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
        z-index: 99999; pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = success ? "#2dce89" : "#e74c3c";
    toast.style.color = "#fff";
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
    }, 4000);
  }

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("✅ Address copied to clipboard!"))
      .catch(() => {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        showToast("✅ Address copied!");
      });
  }

  function showPaymentPanel(amount, paymentMethod, walletAddress) {
    document.getElementById("deposit-form-wrapper").style.display = "none";
    const panel = document.getElementById("deposit-payment-panel");
    panel.style.display = "block";

    document.getElementById("pay-method-title").textContent =
      paymentMethod.charAt(0).toUpperCase() +
      paymentMethod.slice(1) +
      " Address";
    document.getElementById("pay-amount-text").textContent =
      `Send $${amount} in ${paymentMethod} (in ONE payment) to:`;
    document.getElementById("pay-wallet-address").textContent = walletAddress;

    panel.dataset.amount = amount;
    panel.dataset.paymentMethod = paymentMethod;
  }

  async function confirmPayment(amount, paymentMethod) {
    const confirmBtn = document.getElementById("confirm-payment-btn");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Submitting...";

    try {
      const res = await fetch(DEPOSIT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: Number(amount), paymentMethod }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("✅ Payment submitted! Awaiting admin verification.");
        setTimeout(() => {
          window.location.href = "deposit-history.html";
        }, 2500);
      } else {
        showToast("⚠️ " + data.message, false);
        confirmBtn.disabled = false;
        confirmBtn.textContent = "I've Sent the Payment";
      }
    } catch (err) {
      showToast("⚠️ Network error. Please try again.", false);
      confirmBtn.disabled = false;
      confirmBtn.textContent = "I've Sent the Payment";
    }
  }

  // Pretty display labels
  const COIN_LABELS = {
    bitcoin: "Bitcoin (BTC)",
    ethereum: "Ethereum (ETH)",
    "tether usdt trc20": "Tether USDT (TRC20)",
    "tether usdt erc20": "Tether USDT (ERC20)",
    "tether usdt bep20": "Tether USDT (BEP20)",
    "bitcoin cash": "Bitcoin Cash (BCH)",
    xrp: "XRP (Ripple)",
    tron: "Tron (TRX)",
    doge: "Dogecoin (DOGE)",
    "bnb smart chain": "BNB Smart Chain",
    solana: "Solana (SOL)",
    litecoin: "Litecoin (LTC)",
    cardano: "Cardano (ADA)",
    polkadot: "Polkadot (DOT)",
  };

  async function loadWallets() {
    try {
      const res = await fetch(WALLETS_API);
      const data = await res.json();

      if (!data.success || !data.wallets.length) {
        showToast("⚠️ No payment methods available right now.", false);
        return;
      }

      const select = document.getElementById("payment_method");
      select.innerHTML = '<option value="">— Select payment method —</option>';

      data.wallets.forEach((w) => {
        const coin = w.coin.toLowerCase().trim();

        // Store for lookup when user submits
        COIN_ADDRESSES[coin] = {
          symbol: w.symbol,
          network: w.network || null,
          address: w.address,
        };

        // Use pretty label if available, fallback to symbol + network
        const label =
          COIN_LABELS[coin] ||
          `${w.symbol}${w.network ? " (" + w.network + ")" : ""}`;

        const option = document.createElement("option");
        option.value = coin;
        option.textContent = label;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load wallets:", err);
      showToast("⚠️ Failed to load payment methods.", false);
    }
  }

  function init() {
    const form = document.getElementById("deposit-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const amount = parseFloat(document.getElementById("investment").value);
      const select = document.getElementById("payment_method");
      const paymentMethod = select.value.trim();

      if (!paymentMethod) {
        return showToast("⚠️ Please select a payment method.", false);
      }
      if (!amount || amount < 5) {
        return showToast("⚠️ Minimum deposit amount is $5.", false);
      }

      const coin = COIN_ADDRESSES[paymentMethod];
      if (!coin || !coin.address) {
        return showToast("⚠️ Wallet not available. Contact support.", false);
      }

      showPaymentPanel(amount, paymentMethod, coin.address);
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest("#copy-address-btn")) {
        const address =
          document.getElementById("pay-wallet-address").textContent;
        copyToClipboard(address);
      }
      if (e.target.closest("#confirm-payment-btn")) {
        const panel = document.getElementById("deposit-payment-panel");
        confirmPayment(panel.dataset.amount, panel.dataset.paymentMethod);
      }
      if (e.target.closest("#back-to-form-btn")) {
        document.getElementById("deposit-payment-panel").style.display = "none";
        document.getElementById("deposit-form-wrapper").style.display = "block";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      await loadWallets();
      init();
    });
  } else {
    loadWallets().then(init);
  }
})();
