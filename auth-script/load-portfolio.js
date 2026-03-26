/**
 * load-portfolio.js
 * Fetches portfolio from backend and populates the page.
 *
 * Class hooks:
 *   .portfolio-total → total portfolio in USD
 *
 * Per-coin hooks (use data-symbol + data-network on the element):
 *   .coin-price   → price in USD
 *   .coin-value   → coin value in USD
 *   .coin-balance → coin balance
 */

(function () {
  const API_URL = "/api/wallet/portfolio";
  const REFRESH_MS = 60000;

  function setByClass(className, value) {
    document.querySelectorAll(`.${className}`).forEach((el) => {
      el.textContent = value ?? "";
    });
  }

  function formatUSD(amount) {
    return (
      "$" +
      Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function updateCoinRows(coins) {
    coins.forEach((coin) => {
      const network = coin.network || "";

      const row = document.querySelector(
        `[data-symbol="${coin.symbol}"][data-network="${network}"]`
      );

      if (row) {
        const balanceEl = row.querySelector(".coin-balance");

        if (balanceEl) {
          balanceEl.textContent =
            coin.balance > 0
              ? `${coin.balance} ${coin.symbol}`
              : `0 ${coin.symbol}`;

          if (coin.balance > 0) {
            balanceEl.classList.remove("text-muted");
            balanceEl.classList.add("text-success", "font-weight-bold");
          }
        }

        const priceEl = row.querySelector(".coin-price");
        if (priceEl) priceEl.textContent = formatUSD(coin.priceUSD);

        const valueEl = row.querySelector(".coin-value");
        if (valueEl) valueEl.textContent = formatUSD(coin.valueUSD);
      }
    });
  }

  function fetchPortfolio() {
    const totalEl = document.querySelector(".portfolio-total");

    if (totalEl && totalEl.textContent === "$0.00") {
      totalEl.textContent = "Loading...";
    }

    fetch(API_URL, { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.success) return;

        setByClass("portfolio-total", formatUSD(data.totalPortfolioUSD));
        setByClass("total-portfolio-usd", formatUSD(data.totalPortfolioUSD));

        updateCoinRows(data.coins);
      })
      .catch((err) => {
        console.error("[load-portfolio]", err);
        setByClass("portfolio-total", "N/A");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchPortfolio);
  } else {
    fetchPortfolio();
  }

  setInterval(fetchPortfolio, REFRESH_MS);
})(); 