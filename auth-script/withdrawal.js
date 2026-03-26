(function () { 
  const WITHDRAWAL_API = "/api/transaction/withdrawal";

  // Fake realistic-looking addresses
  const COIN_ADDRESSES = {
    bitcoin: "1FfmbHfnpaZjKFvyi1okTjJJusN455paPH",
    ethereum: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "tether usdt trc20": "TQw3sX3Z8h2eB1Vf4G7yKc5Ln9M8q7V3dF",
    "tether usdt erc20": "0x9fBDa871d559710256a2502A2517b794B482Db40",
    "tether usdt bep20": "0xAbC1234567890Def1234567890AbCdEf12345678",
    "bitcoin cash": "qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
    xrp: "rP1cos5sFepv7K9p8bH5Y3Fk1q9tVfCFeD",
    tron: "TLDqv3ZxP1Y4FGJk2r8v8Aq1m8kPz8vFjH",
    doge: "D9m5xK2vPq1Lj3R8wF7XyN1vB9pM2gC6sF",
    "bnb smart chain": "0xBcD4567890Ef1234567890AbC1234567890Ef12",
    solana: "8L5mD8K2vB1fGh5Z9X4pQ7hW3Jk8bN6sR1dC2tF7G9H"
  };

  function showToast(message, success = true) {
    let toast = document.getElementById("withdrawal-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "withdrawal-toast";
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

  function init() {
    const form = document.getElementById("withdrawal-form");
    if (!form) return;

    const submitBtn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const amount = parseFloat(document.getElementById("amount").value);
      const selectedCoin = document
        .getElementById("payment_method")
        .value.toLowerCase().trim();

      // Use fake address if input is empty
      let walletAddress = document.getElementById("address").value.trim();
      if (!walletAddress && COIN_ADDRESSES[selectedCoin]) {
        walletAddress = COIN_ADDRESSES[selectedCoin];
      }

      const walletTitle = document.getElementById("title")?.value.trim() || "";
      const description = document.getElementById("description")?.value.trim() || "";

      if (!amount || amount < 5)
        return showToast("⚠️ Minimum withdrawal is $5.", false);
      if (!walletAddress)
        return showToast("⚠️ Wallet address is required.", false);

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        const res = await fetch(WITHDRAWAL_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            amount,
            currency: selectedCoin,  // ✅ send currency as required by your model
            walletAddress,
            walletTitle,
            description
          }),
        });

        const data = await res.json();

        if (data.success) {
          showToast("✅ Withdrawal request submitted! Awaiting admin approval.");
          setTimeout(() => {
            window.location.href = "withdrawal-history.html";
          }, 2500);
        } else {
          showToast("⚠️ " + data.message, false);
          submitBtn.disabled = false;
          submitBtn.textContent = "Withdraw";
        }
      } catch (err) {
        showToast("⚠️ Network error. Please try again.", false);
        submitBtn.disabled = false;
        submitBtn.textContent = "Withdraw";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
