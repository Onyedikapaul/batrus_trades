import PDFDocument from "pdfkit";
import WithdrawalModel from "../model/Withdrawalmodel.js";

// ─── GET /api/transaction/withdrawal/:id/receipt ──────────────────────────────
export const downloadWithdrawalReceipt = async (req, res) => {
  try {
    const withdrawal = await WithdrawalModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("user", "name email username");

    if (!withdrawal) {
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found." });
    }

    const user = withdrawal.user;

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

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="withdrawal-receipt-${withdrawal._id}.pdf"`,
    );

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
      .text("Withdrawal Receipt", 50, 78);
    doc
      .moveTo(50, 100)
      .lineTo(545, 100)
      .strokeColor("#172b4d")
      .lineWidth(2)
      .stroke();

    // ── Status badge ─────────────────────────────────────────────────────────
    const statusColors = {
      approved: "#2dce89",
      pending: "#fb6340",
      rejected: "#f5365c",
      cancelled: "#8898aa",
    };
    const statusColor = statusColors[withdrawal.status] || "#8898aa";
    doc.roundedRect(390, 50, 110, 28, 5).fillColor(statusColor).fill();
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(withdrawal.status.toUpperCase(), 390, 59, {
        width: 110,
        align: "center",
      });

    // ── User info ─────────────────────────────────────────────────────────────
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

    doc
      .moveTo(50, 200)
      .lineTo(545, 200)
      .strokeColor("#e9ecef")
      .lineWidth(1)
      .stroke();

    // ── Details table ─────────────────────────────────────────────────────────
    const rows = [
      ["Transaction ID", withdrawal._id.toString()],
      ["Amount", `$${Number(withdrawal.amount).toFixed(2)}`],
      ["Currency", withdrawal.currency],
      ["Wallet Address", withdrawal.walletAddress],
      [
        "Status",
        withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1),
      ],
      ["Date Submitted", formatDate(withdrawal.createdAt)],
      ["Date Actioned", formatDate(withdrawal.actionedAt)],
    ];

    if (withdrawal.walletTitle)
      rows.push(["Wallet Title", withdrawal.walletTitle]);
    if (withdrawal.description)
      rows.push(["Description", withdrawal.description]);
    if (withdrawal.rejectionReason)
      rows.push(["Rejection Reason", withdrawal.rejectionReason]);

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
    console.error("downloadWithdrawalReceipt error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate receipt." });
  }
};
