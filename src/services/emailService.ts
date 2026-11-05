import { BrevoClient } from "@getbrevo/brevo";
import brevoConfig from "../configs/brevo";
import EmailModel, { EmailStatus } from "../models/emailModel";
import QRModel from "../models/qrModel";
import AppError from "../errors/AppError";

interface SendTicketConfirmationEmail {
    recipient: string;
    passengerId: string;
    passengerName: string;
    ticketId: string;
    totalPrice: number;
    qrImage: Buffer;
}

const brevo = new BrevoClient({
    apiKey: brevoConfig.apiKey
});

const EMAIL_SUBJECT = "RailLanka - Booking Confirmation";

export const sendTicketConfirmationEmail = async ({
    recipient,
    passengerId,
    passengerName,
    ticketId,
    totalPrice,
    qrImage
}: SendTicketConfirmationEmail) => {

    const qrDoc = await QRModel.findOne({ ticket: ticketId });

    if (!qrDoc) {
        throw new AppError(404, "QR not found for this ticket.");
    }

    const emailRecord = await EmailModel.findOneAndUpdate(
        { ticket: ticketId },
        {
            $setOnInsert: {
                ticket: ticketId,
                passenger: passengerId,
                qr: qrDoc._id,
                recipient,
                subject: EMAIL_SUBJECT,
                emailStatus: EmailStatus.PENDING
            }
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    if (emailRecord.emailStatus === EmailStatus.SENT) {
        return null;
    }

    const qrBase64 = qrImage.toString("base64");

    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: brevoConfig.senderName,
                email: brevoConfig.senderEmail
            },

            to: [
                {
                    email: recipient,
                    name: passengerName
                }
            ],

            subject: EMAIL_SUBJECT,

            attachment: [
                {
                    name: "raillanka-ticket-qr.png",
                    content: qrBase64
                }
            ],

            htmlContent: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="color-scheme" content="light only" />
              <title>RailLanka Booking Confirmation</title>
            </head>
            <body style="margin:0; padding:0; background-color:#eef2f7; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

              <!-- Preheader (inbox preview text) -->
              <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
                Your ticket ${ticketId} is confirmed. Your QR code is attached to this email.
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7; padding:32px 12px;">
                <tr>
                  <td align="center">

                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(15,23,42,0.08);">

                      <!-- Header -->
                      <tr>
                        <td align="center" bgcolor="#1d4ed8" style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%); padding:36px 24px 30px;">
                          <div style="font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#bfdbfe; font-weight:600;">RailLanka</div>
                          <div style="font-size:26px; font-weight:700; color:#ffffff; margin-top:10px;">Booking Confirmed</div>
                          <div style="margin-top:16px;">
                            <span style="display:inline-block; background-color:#dcfce7; color:#166534; font-size:12px; font-weight:700; padding:6px 14px; border-radius:999px; letter-spacing:0.5px;">
                              &#10003; PAYMENT SUCCESSFUL
                            </span>
                          </div>
                        </td>
                      </tr>

                      <!-- Greeting -->
                      <tr>
                        <td style="padding:32px 32px 8px;">
                          <p style="margin:0 0 8px; font-size:18px; font-weight:600; color:#0f172a;">Hello ${passengerName},</p>
                          <p style="margin:0; font-size:15px; line-height:1.6; color:#475569;">
                            Your railway ticket has been successfully booked. Here are your trip details.
                          </p>
                        </td>
                      </tr>

                      <!-- Ticket details card -->
                      <tr>
                        <td style="padding:20px 32px 8px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                            <tr>
                              <td style="padding:18px 20px; border-bottom:1px dashed #cbd5e1;">
                                <div style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#94a3b8; font-weight:600;">Ticket ID</div>
                                <div style="font-size:18px; font-weight:700; color:#0f172a; margin-top:4px; font-family:'Courier New', monospace;">${ticketId}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:18px 20px;">
                                <div style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#94a3b8; font-weight:600;">Total Paid</div>
                                <div style="font-size:24px; font-weight:700; color:#2563eb; margin-top:4px;">LKR ${totalPrice.toFixed(2)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- QR section (attachment) -->
                      <tr>
                        <td align="center" style="padding:24px 32px 8px;">
                          <div style="font-size:16px; font-weight:700; color:#0f172a; margin-bottom:6px;">Your Ticket QR Code</div>
                          <div style="font-size:14px; color:#64748b; margin-bottom:18px;">Show this to the ticket inspector when boarding.</div>

                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f9ff; border:2px solid #bfdbfe; border-radius:16px;">
                            <tr>
                              <td align="center" style="padding:22px 28px; font-size:15px; font-weight:600; color:#1e3a8a;">
                                &#128206; Your QR code is attached to this email<br />
                                <span style="font-size:13px; font-weight:400; color:#64748b;">
                                  File name: raillanka-ticket-qr.png<br />
                                  You can also open it any time under My Tickets.
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Notice -->
                      <tr>
                        <td style="padding:24px 32px 32px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbeb; border-left:4px solid #f59e0b; border-radius:8px;">
                            <tr>
                              <td style="padding:14px 16px; font-size:13px; line-height:1.6; color:#92400e;">
                                <strong>Keep this email safe.</strong> Your QR code is required for ticket verification and should not be shared with anyone.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td align="center" style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 32px;">
                          <p style="margin:0 0 6px; font-size:14px; font-weight:600; color:#334155;">Thank you for choosing RailLanka</p>
                          <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.6;">
                            Travel smart. Travel Sri Lanka by rail.<br />
                            &copy; ${new Date().getFullYear()} RailLanka. All rights reserved.
                          </p>
                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>
              </table>
            </body>
            </html>
        `
        });

        await EmailModel.findByIdAndUpdate(emailRecord._id, {
            $set: {
                emailStatus: EmailStatus.SENT,
                sentAt: new Date()
            },
            $unset: { errorMessage: "" }
        });

        return result;

    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown email error.";

        await EmailModel.findByIdAndUpdate(emailRecord._id, {
            $set: {
                emailStatus: EmailStatus.FAILED,
                errorMessage: message
            }
        }).catch((updateError) => {
            console.error("Failed to mark email as FAILED", updateError);
        });

        throw error;
    }
};