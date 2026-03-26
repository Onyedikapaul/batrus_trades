// ─── Auto-fill ref from URL query param ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const refFromUrl = urlParams.get("ref");
  const refInput = document.querySelector("input[name='ref']");

  if (refFromUrl && refInput) {
    refInput.value = refFromUrl;
  }
});

// ─── Toast Helper ─────────────────────────────────────────────────────────────
function showToast(message, success = true) {
  let toast = document.getElementById("auth-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "auth-toast";
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
  toast.style.background = success ? "#f0a500" : "#e74c3c";
  toast.style.color = success ? "#000" : "#fff";
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
  }, 3500);
}

// ─── Register Form ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = form.querySelector("input[name='name']").value.trim();
    const username = form.querySelector("input[name='username']").value.trim();
    const email = form.querySelector("input[name='email']").value.trim();
    const password = form.querySelector("input[name='password']").value;
    const confirmPassword = form.querySelector(
      "input[name='confirm-password']",
    ).value;
    const ref = form.querySelector("input[name='ref']").value.trim();
    const ac = form.querySelector("input[name='ac']").checked ? "v" : "";

    // ── Turnstile token ──
    const turnstileToken = form.querySelector(
      "[name='cf-turnstile-response']",
    )?.value;
    if (!turnstileToken) {
      return showToast("⚠️ Please complete the captcha.", false);
    }

    if (!name || !username || !email || !password || !confirmPassword) {
      return showToast("⚠️ Please fill in all required fields.", false);
    }
    if (password !== confirmPassword) {
      return showToast("⚠️ Passwords do not match.", false);
    }
    if (!ac) {
      return showToast("⚠️ You must agree to the terms.", false);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          "confirm-password": confirmPassword,
          ref,
          ac,
          "cf-turnstile-response": turnstileToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("✅ " + data.message, true);
        setTimeout(() => {
          window.location.href = data.redirectTo;
        }, 2000);
      } else {
        showToast("⚠️ " + data.message, false);
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
        // Reset turnstile
        if (window.turnstile) turnstile.reset();
      }
    } catch (err) {
      showToast("⚠️ Network error. Please try again.", false);
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
      if (window.turnstile) turnstile.reset();
    }
  });
});
