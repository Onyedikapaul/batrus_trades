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

// ─── Login Form ────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const details = form.querySelector("input[name='details']").value.trim();
    const password = form.querySelector("input[name='password']").value;

    // ── Turnstile token ──
    const turnstileToken = form.querySelector(
      "[name='cf-turnstile-response']",
    )?.value;
    if (!turnstileToken) {
      return showToast("⚠️ Please complete the captcha.", false);
    }

    if (!details || !password) {
      return showToast("⚠️ Please fill in all fields.", false);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          details,
          password,
          "cf-turnstile-response": turnstileToken,
        }),
      });

      const data = await res.json();

      if (!data.success && data.needsVerification) {
        showToast("⚠️ " + data.message, false);
        setTimeout(() => (window.location.href = data.redirectTo), 2000);
        return;
      }

      if (data.success) {
        showToast("✅ " + data.message, true);
        setTimeout(() => {
          window.location.href = "/account";
        }, 2000);
      } else {
        showToast("⚠️ " + data.message, false);
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign In";
        if (window.turnstile) turnstile.reset();
      }
    } catch (err) {
      showToast("⚠️ Network error. Please try again.", false);
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
      if (window.turnstile) turnstile.reset();
    }
  });
});
