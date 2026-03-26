(function () {
  const API_URL = "/api/user/my-data";

  function setByClass(className, value) {
    document.querySelectorAll(`.${className}`).forEach((el) => {
      if (el.tagName === "IMG") {
        el.src = value ?? "";
      } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value ?? "";
      } else {
        el.textContent = value ?? "";
      }
    });
  }

  function populateUserData(user) {
    const initials = user.username
      ? user.username
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase())
          .join("")
      : "U";

    setByClass("initials", initials);
    setByClass("user-name", user.name);
    setByClass("user-username", user.username);
    setByClass("user-email", user.email);
    setByClass("user-phone", user.phone);
    setByClass("user-role", user.role);
    setByClass("user-account-balance", user.account_balance.toFixed(2));
    setByClass("user-status", user.status);
    setByClass("user-referral-count", user.referralCount);
    setByClass(
      "user-last-login",
      user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A",
    );
    setByClass(
      "user-member-since",
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
    );
    setByClass(
      "user-email-verified",
      user.emailVerified ? "Verified" : "Not Verified",
    );

    // Avatar initials fallback — sets first letter of name
    setByClass(
      "user-avatar-initials",
      user.name ? user.name.charAt(0).toUpperCase() : "?",
    );

    const userReferral_code =
      window.location.origin + "/auth/signup.html?ref=" + user.referralCode;

    // the clipboard button
    const copyBtn = document.getElementById("referral-copy-btn");
    if (copyBtn) copyBtn.setAttribute("data-clipboard-text", userReferral_code);

    setByClass("user-referral-code", userReferral_code);
  }

  function loadUserData() {
    fetch(API_URL, {
      method: "GET",
      credentials: "include", // sends cookies (for JWT cookie auth)
    })
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch user data: ${res.status}`);
        return res.json();
      })
      .then((data) => populateUserData(data.user))
      .catch((err) => console.error("[load-user-data]", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadUserData);
  } else {
    loadUserData();
  }
})();
