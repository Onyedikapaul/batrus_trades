import { contactFormEmailTemplate } from "../lib/email-templates/contactFormEmailTemplate.js";
import resend from "../lib/resend.js";

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * POST /api/contact
 * body: { firstName, lastName, email, subject, message }
 */
export const submitContactForm = async (req, res) => {
  try {
    const firstName = String(req.body.firstName || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();

    // Validation
    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "First name, email and message are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message is too short.",
      });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const emailSubject = subject
      ? `Contact Form: ${subject}`
      : `New message from ${fullName}`;

    const html = contactFormEmailTemplate({
      name: fullName,
      email,
      subject: subject || "General Enquiry",
      message,
    });

    const resp = await resend.emails.send({
      from: "Batrus Trades Contact <info@batrus-trades.pro>",
      to: ["info@batrus-trades.pro"],
      replyTo: email,
      subject: emailSubject,
      html,
      text: `From: ${fullName} <${email}>\nTopic: ${subject}\n\n${message}`,
    });

    if (resp?.error) {
      console.error("Resend error:", resp.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send message. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message sent! We'll get back to you within 2 hours.",
    });
  } catch (err) {
    console.error("submitContactForm error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};