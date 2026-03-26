const userId = new URLSearchParams(window.location.search).get("userId");

function showToast(type, message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", warning: "⚠️" };
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>
          <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;cursor:pointer;opacity:0.6;">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function showConfirm(message, onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.innerHTML = `
          <div class="confirm-box">
            <h3>Are you sure?</h3>
            <p>${message}</p>
            <div class="confirm-actions">
              <button class="confirm-cancel">Cancel</button>
              <button class="confirm-delete">Delete</button>
            </div>
          </div>`;
  overlay.querySelector(".confirm-cancel").onclick = () => overlay.remove();
  overlay.querySelector(".confirm-delete").onclick = () => {
    overlay.remove();
    onConfirm();
  };
  document.body.appendChild(overlay);
}

function updateStatusBadge(status) {
  const badge = document.getElementById("statusBadge");
  badge.className = `badge badge-${status}`;
  badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

function populate(user) {
  document.getElementById("name").value = user.name || "";
  document.getElementById("username").value = user.username || "";
  document.getElementById("email").value = user.email || "";
  // document.getElementById("phone").value = user.phone || "";
  document.getElementById("account_balance").value = user.account_balance ?? 0;
  // document.getElementById("role").value = user.role || "user";
  document.getElementById("status").value = user.status || "active";
  document.getElementById("emailVerified").value = String(
    user.emailVerified ?? false,
  );
  document.getElementById("suspensionReason").value =
    user.suspensionReason || "";

  document.getElementById("suspensionWrap").style.display =
    user.status === "suspended" || user.status === "closed" ? "block" : "none";

  updateStatusBadge(user.status || "active");
  document.getElementById("metaText").textContent =
    `ID: ${user._id} · Joined: ${new Date(user.createdAt).toLocaleDateString()}`;
}

async function loadUser() {
  if (!userId) {
    document.getElementById("alertBox").className = "alert alert-error";
    document.getElementById("alertBox").textContent = "No userId in URL.";
    return;
  }
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      credentials: "include",
    });
    const { success, user } = await res.json();
    if (!success) throw new Error("Failed to load user");
    populate(user);
  } catch (err) {
    showToast("error", err.message || "Failed to load user");
  }
}

// Show reason textarea when status changes to suspended/closed
document.getElementById("status").addEventListener("change", function () {
  const wrap = document.getElementById("suspensionWrap");
  wrap.style.display =
    this.value === "suspended" || this.value === "closed" ? "block" : "none";
  if (this.value === "active")
    document.getElementById("suspensionReason").value = "";
});

// Frontend validation before submit
document.getElementById("saveBtn").addEventListener("click", async () => {
  const status = document.getElementById("status").value;
  const suspensionReason = document
    .getElementById("suspensionReason")
    .value.trim();

  if ((status === "suspended" || status === "closed") && !suspensionReason) {
    showToast(
      "warning",
      `Please provide a reason for ${status === "suspended" ? "suspending" : "closing"} this account.`,
    );
    document.getElementById("suspensionReason").focus();
    return;
  }

  const btn = document.getElementById("saveBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";

  const body = {
    name: document.getElementById("name").value.trim(),
    username: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    // phone: document.getElementById("phone").value.trim(),
    account_balance: parseFloat(
      document.getElementById("account_balance").value,
    ),
    // role: document.getElementById("role").value,
    status,
    suspensionReason: suspensionReason || null,
    emailVerified: document.getElementById("emailVerified").value === "true",
  };

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const { success, message } = await res.json();
    if (!success) throw new Error(message);
    showToast("success", "User updated successfully");
    loadUser();
  } catch (err) {
    showToast("error", err.message || "Failed to save");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Changes";
  }
});

// Delete
document.getElementById("deleteBtn").addEventListener("click", () => {
  showConfirm(
    "This will permanently delete the user and cannot be undone.",
    async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const { success, message } = await res.json();
        if (!success) throw new Error(message);
        showToast("success", "User deleted");
        setTimeout(
          () => (window.location.href = "/admin/owner/dashboard/users.html"),
          1500,
        );
      } catch (err) {
        showToast("error", err.message || "Failed to delete");
      }
    },
  );
});

loadUser();
