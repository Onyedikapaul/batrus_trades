import PDFDocument from "pdfkit";
import Depositmodel from "../model/Depositmodel.js";

// ─── GET /api/transaction/deposit/:id/receipt ─────────────────────────────────
// Generates and streams a PDF receipt for a specific deposit
export const downloadDepositReceipt = async (req, res) => {
  try {
    const deposit = await Depositmodel.findOne({
      _id: req.params.id,
      user: req.user._id, // ensure user can only download their own
    }).populate("user", "name email username");

    if (!deposit) {
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found." });
    }

    const user = deposit.user;

    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // ── Build PDF ────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set response headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="deposit-receipt-${deposit._id}.pdf"`,
    );

    // Stream PDF directly to response
    doc.pipe(res);

    // ── Header ───────────────────────────────────────────────────────────────
    doc
      .fillColor("#172b4d")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("Batrus Trades", 50, 50);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#6c757d")
      .text("Deposit Receipt", 50, 78);

    // Horizontal line
    doc
      .moveTo(50, 100)
      .lineTo(545, 100)
      .strokeColor("#172b4d")
      .lineWidth(2)
      .stroke();

    // ── Status badge area ────────────────────────────────────────────────────
    const statusColors = {
      confirmed: "#2dce89",
      pending: "#fb6340",
      rejected: "#f5365c",
      cancelled: "#8898aa",
    };
    const statusColor = statusColors[deposit.status] || "#8898aa";

    doc.roundedRect(390, 50, 110, 28, 5).fillColor(statusColor).fill();

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(deposit.status.toUpperCase(), 390, 59, {
        width: 110,
        align: "center",
      });

    // ── User info ────────────────────────────────────────────────────────────
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#172b4d")
      .text("Account Holder", 50, 125);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#525f7f")
      .text(`${user?.name || "N/A"}`, 50, 142)
      .text(`@${user?.username || "N/A"}`, 50, 157)
      .text(`${user?.email || "N/A"}`, 50, 172);

    // ── Divider ───────────────────────────────────────────────────────────────
    doc
      .moveTo(50, 200)
      .lineTo(545, 200)
      .strokeColor("#e9ecef")
      .lineWidth(1)
      .stroke();

    // ── Details table ────────────────────────────────────────────────────────
    const rows = [
      ["Transaction ID", deposit._id.toString()],
      ["Amount", `$${Number(deposit.amount).toFixed(2)}`],
      ["Payment Method", deposit.paymentMethod],
      [
        "Status",
        deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1),
      ],
      ["Date Submitted", formatDate(deposit.createdAt)],
      ["Date Actioned", formatDate(deposit.actionedAt)],
    ];

    if (deposit.rejectionReason) {
      rows.push(["Rejection Reason", deposit.rejectionReason]);
    }

    let y = 220;
    rows.forEach(([label, value], i) => {
      const bg = i % 2 === 0 ? "#f8f9fa" : "#ffffff";
      doc.rect(50, y, 495, 28).fillColor(bg).fill();

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#6c757d")
        .text(label, 60, y + 9, { width: 180 });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#172b4d")
        .text(value, 250, y + 9, { width: 285 });

      y += 28;
    });

    // ── Footer ────────────────────────────────────────────────────────────────
    doc
      .moveTo(50, y + 20)
      .lineTo(545, y + 20)
      .strokeColor("#e9ecef")
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#adb5bd")
      .text(
        `Generated on ${formatDate(new Date())} — Batrus Trades`,
        50,
        y + 32,
        { align: "center", width: 495 },
      )
      .text(
        "This is an auto-generated receipt. Please retain for your records.",
        50,
        y + 48,
        { align: "center", width: 495 },
      );

    doc.end();
  } catch (error) {
    console.error("downloadDepositReceipt error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate receipt." });
  }
};
