(function () {
  const SIDENAV_URL = "/auth-components/sidebar.html";

  // Inject sidebar styles directly — no waiting on fetched HTML
  const style = document.createElement("style");
  style.innerHTML = `
    @media (min-width: 768px) {
      #sidenav-main {
        display: block !important;
        transform: translateX(0) !important;
      }
    }

    @media (max-width: 767px) {
      #sidenav-main {
        position: fixed;
        top: 0;
        left: 0;
        width: 250px;
        height: 100vh;
        z-index: 9999;
        display: block !important;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      #sidenav-main.mobile-open {
        transform: translateX(0) !important;
      }

      #sidenav-overlay {
        display: none;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
      }

      #sidenav-overlay.active {
        display: block;
      }
    }
  `;
  document.head.appendChild(style);

  // Create overlay element and append to body
  function createOverlay() {
    if (document.getElementById("sidenav-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "sidenav-overlay";
    overlay.onclick = closeSidenav;
    document.body.appendChild(overlay);
  }

  // Toggle sidebar open/close
  window.toggleSidenav = function () {
    const nav = document.getElementById("sidenav-main");
    const overlay = document.getElementById("sidenav-overlay");
    if (!nav) return;
    nav.classList.toggle("mobile-open");
    if (overlay) overlay.classList.toggle("active");
  };

  window.closeSidenav = function () {
    const nav = document.getElementById("sidenav-main");
    const overlay = document.getElementById("sidenav-overlay");
    if (nav) nav.classList.remove("mobile-open");
    if (overlay) overlay.classList.remove("active");
  };

  function highlightActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.php";
    const links = document.querySelectorAll("#sidenav-main .nav-link");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && currentPage === href) {
        link.classList.add("active");
      }
    });
  }

  function injectSidenav(html) {
    const mount = document.getElementById("sidenav-mount");
    if (!mount) return console.error("[load-sidenav] #sidenav-mount not found");
    mount.innerHTML = html;
    createOverlay();
    highlightActiveLink();
  }

  function loadSidenav() {
    fetch(SIDENAV_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load sidenav: ${res.status}`);
        return res.text();
      })
      .then((html) => injectSidenav(html))
      .catch((err) => console.error("[load-sidenav]", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSidenav);
  } else {
    loadSidenav();
  }
})();