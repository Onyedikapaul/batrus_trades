const year = () => new Date().getFullYear();

export function investmentCancelledEmailTemplate({
  name = "there",
  amount = "0",
  plan = "N/A",
}) {
  const safeName = String(name || "there").replace(/[<>]/g, "");
  const safeAmount = parseFloat(amount).toFixed(2);
  const safePlan = String(plan || "N/A").replace(/[<>]/g, "");

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
                  <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">Apex Trades</div>
                  <div style="font-size:12px;opacity:0.85;margin-top:4px;">Investment Cancelled</div>
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
                  Your investment has been cancelled by our team and your original amount of <b>$${safeAmount}</b> has been refunded to your account balance.
                </p>

                <!-- Details box -->
                <div style="margin:18px 0;padding:18px;background:#f6f8fb;border:1px solid rgba(0,0,0,0.10);border-radius:14px;">
                  <div style="font-size:12px;color:#667085;margin-bottom:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    Investment Summary
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Plan</td>
                      <td style="font-size:13px;color:#101828;font-weight:600;text-align:right;">${safePlan}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Amount Refunded</td>
                      <td style="font-size:13px;color:#101828;font-weight:700;text-align:right;">$${safeAmount}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#667085;padding:5px 0;">Status</td>
                      <td style="text-align:right;">
                        <span style="font-size:12px;font-weight:600;color:#991b1b;background:#fee2e2;padding:2px 10px;border-radius:20px;">Cancelled</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="margin:0;font-size:13px;color:#667085;line-height:1.6;">
                  If you have any questions about this cancellation, please contact our support team.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:16px 20px;border-top:1px solid rgba(0,0,0,0.08);">
                <div style="font-size:12px;color:#667085;line-height:1.5;">
                  <p style="margin:0 0 6px;">This email was sent by <b>Apex Trades</b>.</p>
                  <p style="margin:0;">© ${year()} Apex Trades. All rights reserved.</p>
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
