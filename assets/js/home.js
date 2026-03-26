document.addEventListener("DOMContentLoaded", function () {
  /* ── MOBILE NAV TOGGLE ── */
  var toggle = document.getElementById("mobileToggle");
  var mobileNav = document.getElementById("mobileNav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      var spans = toggle.querySelectorAll(".animated-icon2 span");

      if (isOpen) {
        if (spans[0]) {
          spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        }
        if (spans[1]) {
          spans[1].style.opacity = "0";
          spans[1].style.transform = "scaleX(0)";
        }
        if (spans[2]) {
          spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
        }
        document.body.style.overflow = "hidden";
        toggle.style.zIndex = "9999"; /* keep toggler above overlay */
        toggle.style.position = "relative";
      } else {
        spans.forEach(function (s) {
          s.style.transform = "";
          s.style.opacity = "";
        });
        document.body.style.overflow = "";
        toggle.style.zIndex = "";
        toggle.style.position = "";
      }
    });

    /* Close nav when a link inside is clicked */
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        var spans = toggle.querySelectorAll(".animated-icon2 span");
        spans.forEach(function (s) {
          s.style.transform = "";
          s.style.opacity = "";
        });
        document.body.style.overflow = ""; /* unlock scroll */
      });
    });
  }

  /* ── HERO SLOGAN CAROUSEL ── */
  var items = document.querySelectorAll("#slogans .carousel-item");
  var current = 0;

  if (items.length > 1) {
    setInterval(function () {
      items[current].classList.remove("active");
      current = (current + 1) % items.length;
      items[current].classList.add("active");
    }, 4000);
  }

  /* ── FAQ ACCORDION ── */
  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var answer = item.querySelector(".faq-answer");
      var isOpen = item.classList.contains("open");

      /* Close all */
      document.querySelectorAll(".faq-item").forEach(function (el) {
        el.classList.remove("open");
        el.querySelector(".faq-question").setAttribute(
          "aria-expanded",
          "false",
        );
        el.querySelector(".faq-answer").style.maxHeight = null;
      });

      /* Open this one if it was closed */
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  /* ── CONTACT FORM ── */
  var contactForm = document.getElementById("contactForm");
  var formSuccess = document.getElementById("formSuccess");

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      var btn = contactForm.querySelector("button[type=submit]");
      var originalHTML = btn.innerHTML;
      btn.innerHTML = "Sending...";
      btn.disabled = true;

      if (formSuccess) formSuccess.style.display = "none";

      var body = {
        firstName: (
          contactForm.querySelector("[name=firstName]")?.value || ""
        ).trim(),
        lastName: (
          contactForm.querySelector("[name=lastName]")?.value || ""
        ).trim(),
        email: (contactForm.querySelector("[name=email]")?.value || "").trim(),
        subject: (
          contactForm.querySelector("[name=subject]")?.value || ""
        ).trim(),
        message: (
          contactForm.querySelector("[name=message]")?.value || ""
        ).trim(),
      };

      try {
        var res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        var data = await res.json();

        if (data.success) {
          contactForm.reset();
          if (formSuccess) {
            formSuccess.textContent = "✓ " + data.message;
            formSuccess.style.display = "block";
            setTimeout(function () {
              formSuccess.style.display = "none";
            }, 5000);
          }
        } else {
          alert(data.message || "Something went wrong. Please try again.");
        }
      } catch (err) {
        console.error("Contact form error:", err);
        alert("Network error. Please check your connection and try again.");
      } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }
    });
  }
});
