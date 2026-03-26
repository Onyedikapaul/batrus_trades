(function () {
  const API_URL = "/api/user/update-profile";

  function showToast(message, success = true) {
    let toast = document.getElementById("profile-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "profile-toast";
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
    }, 3500);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("profile-form");
    if (!form) return;

    const nameInput = document.getElementById("input-name");
    const submitBtn = form.querySelector("button[type='submit']");

    // Start disabled
    submitBtn.disabled = true;

    // Wait for load-user-data.js to populate the field, then store original
    // Use MutationObserver to detect when the value is set
    let originalName = "";

    const observer = new MutationObserver(() => {
      originalName = nameInput.value.trim();
    });

    observer.observe(nameInput, { attributeFilter: ["value"] });

    // Also handle direct .value assignment (used by setByClass)
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    );
    const originalSet = descriptor.set;
    Object.defineProperty(nameInput, "value", {
      set(val) {
        originalSet.call(this, val);
        originalName = val.trim();
        submitBtn.disabled = true; // reset button when value is set externally
      },
      get() {
        return descriptor.get.call(this);
      },
    });

    // Enable button only when value differs from original
    nameInput.addEventListener("input", () => {
      const current = nameInput.value.trim();
      submitBtn.disabled = current === originalName || current === "";
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = nameInput.value.trim();
      if (!name) return showToast("⚠️ Name cannot be empty.", false);

      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      try {
        const res = await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name }),
        });

        const data = await res.json();

        if (data.success) {
          originalName = name; // update original to new saved value
          showToast("✅ Profile updated successfully.");
        } else {
          showToast("⚠️ " + data.message, false);
        }
      } catch (err) {
        showToast("⚠️ Network error. Please try again.", false);
      } finally {
        submitBtn.disabled = true; // disable again after save
        submitBtn.textContent = "Save Changes";
      }
    });
  });
})();
