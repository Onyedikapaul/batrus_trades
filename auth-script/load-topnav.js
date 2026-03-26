(function () {
  const TOPNAV_URL = "/auth-components/topnav.html";
  const LOGOUT_URL = "/api/auth/logout";
  const REDIRECT_URL = "/auth/login.html";

  async function logout() {
    try {
      await fetch(LOGOUT_URL, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[logout]", error);
    } finally {
      window.location.href = REDIRECT_URL;
    }
  }

  function bindLogout() {
    document.querySelectorAll(".logout-btn").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    });
  }

  function injectTopnav(html) {
    const mount = document.getElementById("topnav-mount");
    if (!mount) return console.error("[load-topnav] #topnav-mount not found");
    mount.innerHTML = html;

    // Bind logout only after topnav is in the DOM
    bindLogout();
  }

  function loadTopnav() {
    fetch(TOPNAV_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load topnav: ${res.status}`);
        return res.text();
      })
      .then((html) => injectTopnav(html))
      .catch((err) => console.error("[load-topnav]", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTopnav);
  } else {
    loadTopnav();
  }
})();
