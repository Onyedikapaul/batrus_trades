const year = () => new Date().getFullYear();

// ─── Deposit Created (pending) ────────────────────────────────────────────────
export function depositCreatedEmailTemplate({
  name = "there",
  amount = "0",
  paymentMethod = "N/A",
}) {
  const safeName = String(name || "there").replace(/[<>]/g, "");
  const safeAmount = parseFloat(amount).toFixed(2);
  const safeMethod = String(paymentMethod || "N/A").replace(/[<>]/g, "");

  return `
  <div style="margin:0;padding:0;background:#f6f8fb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#ffffff;border-radius:16px;
                   border:1px solid rgba(0,0,0,0.08);overflow:hidden;
                   font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">

            <!-- HEADER -->
            <tr>
              <td style="background:#033d75;padding:20px;">
                <div style="color:#ffffff;">
                  <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">Batrus Trades</div>
                  <div style="font-size:12px;opacity:0.85;margin-top:4px;">Deposit Request Received</div>
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:22px 20px;">
                <h2 style="margin:0 0 10px;font-size:18px;letter-spacing:-0.02em;color:#101828;">
                  Hi, ${safeName}
                </h2>
                <p style="margin:0 0 14px;font-size:14px;color:#475467;line-height:1.6;">
                  We've received your deposit request. Our team will review and confirm it shortly.
                  You'll get another email once it's been approved.
                </p>

                <!-- Details box -->
                <div style="margin:18px 0;padding:18px;background:#f6f8fb;border:1px solid rgba(0,0,0,0.10);border-radius:14px;">
                  <div style="font-size:12px;color:#667085;margin-bottom:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    Deposit Details
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Amount</td>
                      <td style="font-size:13px;color:#101828;font-weight:700;text-align:right;">$${safeAmount}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Payment Method</td>
                      <td style="font-size:13px;color:#101828;font-weight:600;text-align:right;">${safeMethod}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Status</td>
                      <td style="text-align:right;">
                        <span style="font-size:12px;font-weight:600;color:#b45309;background:#fef3c7;padding:2px 10px;border-radius:20px;">Pending</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="margin:0;font-size:13px;color:#667085;line-height:1.6;">
                  If you did not make this request, please contact support immediately.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:16px 20px;border-top:1px solid rgba(0,0,0,0.08);">
                <div style="font-size:12px;color:#667085;line-height:1.5;">
                  <p style="margin:0 0 6px;">This email was sent by <b>Batrus Trades</b>.</p>
                  <p style="margin:0;">© ${year()} Batrus Trades. All rights reserved.</p>
                  <p style="margin:6px 0 0;">Need help? Contact support.</p>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// ─── Deposit Confirmed ────────────────────────────────────────────────────────
export function depositConfirmedEmailTemplate({
  name = "there",
  amount = "0",
  paymentMethod = "N/A",
}) {
  const safeName = String(name || "there").replace(/[<>]/g, "");
  const safeAmount = parseFloat(amount).toFixed(2);
  const safeMethod = String(paymentMethod || "N/A").replace(/[<>]/g, "");

  return `
  <div style="margin:0;padding:0;background:#f6f8fb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#ffffff;border-radius:16px;
                   border:1px solid rgba(0,0,0,0.08);overflow:hidden;
                   font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">

            <!-- HEADER -->
            <tr>
              <td style="background:#033d75;padding:20px;">
                <div style="color:#ffffff;">
                  <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">Batrus Trades</div>
                  <div style="font-size:12px;opacity:0.85;margin-top:4px;">Deposit Confirmed</div>
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:22px 20px;">
                <h2 style="margin:0 0 10px;font-size:18px;letter-spacing:-0.02em;color:#101828;">
                  Great news, ${safeName}! 🎉
                </h2>
                <p style="margin:0 0 14px;font-size:14px;color:#475467;line-height:1.6;">
                  Your deposit has been confirmed and <b>$${safeAmount}</b> has been credited to your account balance. You can now use your funds.
                </p>

                <!-- Details box -->
                <div style="margin:18px 0;padding:18px;background:#f6f8fb;border:1px solid rgba(0,0,0,0.10);border-radius:14px;">
                  <div style="font-size:12px;color:#667085;margin-bottom:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    Deposit Details
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Amount Credited</td>
                      <td style="font-size:13px;color:#101828;font-weight:700;text-align:right;">$${safeAmount}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Payment Method</td>
                      <td style="font-size:13px;color:#101828;font-weight:600;text-align:right;">${safeMethod}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Status</td>
                      <td style="text-align:right;">
                        <span style="font-size:12px;font-weight:600;color:#065f46;background:#d1fae5;padding:2px 10px;border-radius:20px;">Confirmed</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="margin:0;font-size:13px;color:#667085;line-height:1.6;">
                  Thank you for using Batrus Trades. If you have any questions, feel free to contact support.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:16px 20px;border-top:1px solid rgba(0,0,0,0.08);">
                <div style="font-size:12px;color:#667085;line-height:1.5;">
                  <p style="margin:0 0 6px;">This email was sent by <b>Batrus Trades</b>.</p>
                  <p style="margin:0;">© ${year()} Batrus Trades. All rights reserved.</p>
                  <p style="margin:6px 0 0;">Need help? Contact support.</p>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// ─── Deposit Rejected ─────────────────────────────────────────────────────────
export function depositRejectedEmailTemplate({
  name = "there",
  amount = "0",
  paymentMethod = "N/A",
  rejectionReason = null,
}) {
  const safeName = String(name || "there").replace(/[<>]/g, "");
  const safeAmount = parseFloat(amount).toFixed(2);
  const safeMethod = String(paymentMethod || "N/A").replace(/[<>]/g, "");
  const safeReason = rejectionReason
    ? String(rejectionReason).replace(/[<>]/g, "")
    : null;

  return `
  <div style="margin:0;padding:0;background:#f6f8fb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#ffffff;border-radius:16px;
                   border:1px solid rgba(0,0,0,0.08);overflow:hidden;
                   font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">

            <!-- HEADER -->
            <tr>
              <td style="background:#033d75;padding:20px;">
                <div style="color:#ffffff;">
                  <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">Batrus Trades</div>
                  <div style="font-size:12px;opacity:0.85;margin-top:4px;">Deposit Update</div>
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:22px 20px;">
                <h2 style="margin:0 0 10px;font-size:18px;letter-spacing:-0.02em;color:#101828;">
                  Hi, ${safeName}
                </h2>
                <p style="margin:0 0 14px;font-size:14px;color:#475467;line-height:1.6;">
                  Unfortunately, your deposit request of <b>$${safeAmount}</b> could not be processed and has been rejected.
                  ${safeReason ? "Please see the reason below." : "Please contact support for more information."}
                </p>

                <!-- Details box -->
                <div style="margin:18px 0;padding:18px;background:#f6f8fb;border:1px solid rgba(0,0,0,0.10);border-radius:14px;">
                  <div style="font-size:12px;color:#667085;margin-bottom:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    Deposit Details
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Amount</td>
                      <td style="font-size:13px;color:#101828;font-weight:700;text-align:right;">$${safeAmount}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Payment Method</td>
                      <td style="font-size:13px;color:#101828;font-weight:600;text-align:right;">${safeMethod}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Status</td>
                      <td style="text-align:right;">
                        <span style="font-size:12px;font-weight:600;color:#991b1b;background:#fee2e2;padding:2px 10px;border-radius:20px;">Rejected</span>
                      </td>
                    </tr>
                    ${
                      safeReason
                        ? `
                    <tr>
                      <td colspan="2" style="padding-top:12px;border-top:1px solid rgba(0,0,0,0.07);margin-top:8px;">
                        <div style="font-size:12px;color:#667085;margin-bottom:4px;font-weight:600;">Reason</div>
                        <div style="font-size:13px;color:#101828;">${safeReason}</div>
                      </td>
                    </tr>`
                        : ""
                    }
                  </table>
                </div>

                <p style="margin:0;font-size:13px;color:#667085;line-height:1.6;">
                  If you believe this is a mistake, please reach out to our support team and we'll look into it.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:16px 20px;border-top:1px solid rgba(0,0,0,0.08);">
                <div style="font-size:12px;color:#667085;line-height:1.5;">
                  <p style="margin:0 0 6px;">This email was sent by <b>Batrus Trades</b>.</p>
                  <p style="margin:0;">© ${year()} Batrus Trades. All rights reserved.</p>
                  <p style="margin:6px 0 0;">Need help? Contact support.</p>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}
