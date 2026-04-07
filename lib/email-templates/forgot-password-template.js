export function forgotPasswordEmailTemplate({
  name = "there",
  code = "123456",
}) {
  const safeName = String(name || "there").replace(/[<>]/g, "");
  const safeCode = String(code || "")
    .replace(/\D/g, "")
    .slice(0, 6);
  const year = new Date().getFullYear();

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
              <td style="background:#7c3aed;padding:20px;">
                <div style="color:#ffffff;">
                  <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">
                    Batrus Trades
                  </div>
                  <div style="font-size:12px;opacity:0.85;margin-top:4px;">
                    Password Reset Request
                  </div>
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
                  We received a request to reset your <b>Batrus Trades</b> account password.
                  Use the code below to reset it. If you didn't request this, you can safely ignore this email —
                  your password will not be changed.
                </p>

                <!-- Code box -->
                <div style="
                  margin:18px 0;
                  padding:18px;
                  background:#faf5ff;
                  border:1px solid rgba(124,58,237,0.2);
                  border-radius:14px;
                  text-align:center;
                ">
                  <div style="font-size:12px;color:#667085;margin-bottom:8px;">
                    Your password reset code
                  </div>
                  <div style="font-size:32px;font-weight:800;letter-spacing:10px;color:#7c3aed;">
                    ${safeCode}
                  </div>
                  <div style="font-size:12px;color:#667085;margin-top:10px;">
                    This code will expire in <b>30 minutes</b>.
                  </div>
                </div>

                <!-- Warning box -->
                <div style="
                  padding:12px 16px;
                  background:#fff7ed;
                  border-left:4px solid #f59e0b;
                  border-radius:6px;
                  margin-bottom:16px;
                ">
                  <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                    ⚠️ Never share this code with anyone. Batrus Trades staff will never ask for your reset code.
                  </p>
                </div>

                <p style="margin:0;font-size:13px;color:#667085;line-height:1.6;">
                  If you did not request a password reset, please contact support immediately.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:16px 20px;border-top:1px solid rgba(0,0,0,0.08);">
                <div style="font-size:12px;color:#667085;line-height:1.5;">
                  <p style="margin:0 0 6px;">This email was sent by <b>Batrus Trades</b>.</p>
                  <p style="margin:0;">© ${year} Batrus Trades. All rights reserved.</p>
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
