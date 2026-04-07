export function contactFormEmailTemplate({
  name = "",
  email = "",
  subject = "",
  message = "",
}) {
  const safeName = String(name || "").replace(/[<>]/g, "");
  const safeEmail = String(email || "").replace(/[<>]/g, "");
  const safeSubject = String(subject || "").replace(/[<>]/g, "");
  const safeMessage = String(message || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
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
              <td style="background:#033d75;padding:20px;">
                <div style="color:#ffffff;">
                  <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">
                    Batrus Trades
                  </div>
                  <div style="font-size:12px;opacity:0.85;margin-top:4px;">
                    New Contact Form Submission
                  </div>
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:28px 24px;">

                <!-- Sender info -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f9fafb;border-radius:10px;border:1px solid #e4e7ec;margin-bottom:20px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#98a2b3;margin-bottom:12px;">
                        Sender Details
                      </div>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size:13px;color:#667085;padding-bottom:6px;padding-right:12px;white-space:nowrap;">
                            👤 Name
                          </td>
                          <td style="font-size:13px;font-weight:600;color:#101828;padding-bottom:6px;">
                            ${safeName}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#667085;padding-bottom:6px;padding-right:12px;white-space:nowrap;">
                            ✉️ Email
                          </td>
                          <td style="font-size:13px;font-weight:600;color:#101828;padding-bottom:6px;">
                            <a href="mailto:${safeEmail}" style="color:#033d75;text-decoration:none;">${safeEmail}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#667085;padding-right:12px;white-space:nowrap;">
                            📌 Topic
                          </td>
                          <td style="font-size:13px;font-weight:600;color:#101828;">
                            ${safeSubject}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Message -->
                <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#98a2b3;margin-bottom:10px;">
                  Message
                </div>
                <div style="font-size:14px;color:#475467;line-height:1.75;white-space:pre-wrap;
                            background:#f9fafb;border-left:3px solid #e8981d;
                            border-radius:0 8px 8px 0;padding:14px 16px;">
                  ${safeMessage}
                </div>

                <!-- Reply CTA -->
                <div style="margin-top:24px;text-align:center;">
                  <a href="mailto:${safeEmail}?subject=Re: ${safeSubject}"
                    style="display:inline-block;background:#e8981d;color:#fff;
                           font-size:14px;font-weight:600;padding:12px 28px;
                           border-radius:8px;text-decoration:none;">
                    Reply to ${safeName} →
                  </a>
                </div>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:16px 20px;border-top:1px solid rgba(0,0,0,0.08);">
                <div style="font-size:12px;color:#667085;line-height:1.5;">
                  <p style="margin:0 0 4px;">This message was submitted via the <b>Batrus Trades</b> contact form.</p>
                  <p style="margin:0;">© ${year} Batrus Trades. All rights reserved.</p>
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
