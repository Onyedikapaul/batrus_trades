const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");
const submitBtn = contactForm.querySelector("button[type=submit]");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "Sending...";
  formSuccess.style.display = "none";

  const body = {
    firstName: contactForm.firstName.value.trim(),
    lastName: contactForm.lastName.value.trim(),
    email: contactForm.email.value.trim(),
    subject: contactForm.subject.value.trim(),
    message: contactForm.message.value.trim(),
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.success) {
      formSuccess.textContent = "✓ " + data.message;
      formSuccess.style.display = "block";
      contactForm.reset();
    } else {
      alert(data.message || "Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("Contact form error:", err);
    alert("Network error. Please check your connection and try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
});
