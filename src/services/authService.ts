import bcrypt from 'bcryptjs';
import UserModel from "../models/userModel";
import jwt from 'jsonwebtoken';
import AppError from "../errors/AppError";
import {signAccessToken} from "../utils/jwtUtil";
import IUser from "../interfaces/IUser";
import crypto from "node:crypto";
import brevoConfig from "../configs/brevo";
import {BrevoClient} from "@getbrevo/brevo";
import PasswordResetModel from "../models/resetPasswordModel";
import ResetPasswordModel from "../models/resetPasswordModel";

const brevo = new BrevoClient({
    apiKey: brevoConfig.apiKey
});


const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const registerUser = async (user: IUser) => {
    console.log("Executes registerUser()");
    try {
        const existingUser = await UserModel.findOne({
            $or: [
                { email: user.email },
                { phone: user.phone }
            ]
        });

        if (existingUser) {
            throw new AppError(409, "User is already exist.");
        }

        const hashedPassword = await bcrypt.hash(user.password, 12);

        const newUser = new UserModel({
            fullName: user.fullName,
            email: user.email,
            password: hashedPassword,
            phone: user.phone,
            roles: user.roles,
            isActive: true
        });

        await newUser.save();

    } catch (error) {
        console.error("Error in regiterUser(): ", error);
        throw error;
    }
}

export interface AuthDTO {
    email: string,
    password: string
}

export const login = async (auth: AuthDTO): Promise<IUser> => {
    console.log("Executes login()");
    try {
        if (!auth.email || !auth.password) {
            throw new AppError(400, "Email and Password are required.");
        }

        const user = await UserModel.findOne({ email: auth.email });

        if (!user) {
            throw new AppError(401, "Invalid email or password.");
        }

        const isValid = await bcrypt.compare(auth.password, user.password);

        if (!isValid) {
            throw new AppError(401, "Invalid email or password.");
        }

        return user;

    } catch (error) {
        console.error("Error in login(): ", error);
        throw error;
    }
}

export const getNewAccessToken = async (refreshToken: string): Promise<string> => {
    console.log("Executes getNewAccessToken()");
    try {
        let payload: jwt.JwtPayload;

        try {
            payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;

        } catch {
            throw new AppError(401, "Token is expired or Invalid token.");
        }

        const user = await UserModel.findById(payload?.sub);

        if (!user) {
            throw new AppError(401, "Token is expired or Invalid token.");
        }

        return signAccessToken(user);

    } catch (error) {
        console.error("Error in getNewAccessToken(): ", error);
        throw error;
    }
}

export const getMyDetails = async (userId: string): Promise<IUser> => {
    try {
        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            throw new AppError(404, "Related user not found.");
        }

        return user;

    } catch (error) {
        console.error("Error in getMyDetails(): ", error);
        throw error;
    }
};

export const forgotPassword = async (email: string) => {
    console.log("Executes forgotPassword()");
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new AppError(404, "Sorry, related user is not found.");
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHmac("sha256", process.env.OTP_SECRET!)
            .update(otp)
            .digest("hex");

        const expiryMinutes = new Date(
            Date.now() + 5 * 60 * 1000
        );

        const result = await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: brevoConfig.senderName,
                email: brevoConfig.senderEmail
            },

            to: [
                {
                    email: email,
                    name: user.fullName
                }
            ],

            subject: "Reset your password",

            htmlContent: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="color-scheme" content="light only" />
              <title>RailLanka Verification Code</title>
            </head>
            <body style="margin:0; padding:0; background-color:#eef2f7; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

              <!-- Preheader (inbox preview text) -->
              <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
                Your RailLanka verification code is ${otp}. It expires in ${expiryMinutes} minutes.
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7; padding:32px 12px;">
                <tr>
                  <td align="center">

                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(15,23,42,0.08);">

                      <!-- Header -->
                      <tr>
                        <td align="center" bgcolor="#1d4ed8" style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%); padding:36px 24px 30px;">
                          <div style="font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#bfdbfe; font-weight:600;">RailLanka</div>
                          <div style="font-size:26px; font-weight:700; color:#ffffff; margin-top:10px;">Verify Your Email</div>
                          <div style="margin-top:16px;">
                            <span style="display:inline-block; background-color:#dbeafe; color:#1e40af; font-size:12px; font-weight:700; padding:6px 14px; border-radius:999px; letter-spacing:0.5px;">
                              &#128274; ONE-TIME PASSWORD
                            </span>
                          </div>
                        </td>
                      </tr>

                      <!-- Greeting -->
                      <tr>
                        <td style="padding:32px 32px 8px;">
                          <p style="margin:0 0 8px; font-size:18px; font-weight:600; color:#0f172a;">Hello ${user.fullName || "there"},</p>
                          <p style="margin:0; font-size:15px; line-height:1.6; color:#475569;">
                            Use the verification code below to continue with your RailLanka account.
                          </p>
                        </td>
                      </tr>

                      <!-- OTP card -->
                      <tr>
                        <td align="center" style="padding:24px 32px 8px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f9ff; border:2px solid #bfdbfe; border-radius:16px;">
                            <tr>
                              <td align="center" style="padding:26px 20px 10px;">
                                <div style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#94a3b8; font-weight:600;">Your verification code</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding:0 20px 8px;">
                                <div style="font-size:40px; font-weight:700; color:#1e3a8a; letter-spacing:12px; font-family:'Courier New', monospace; padding-left:12px;">${otp}</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding:0 20px 24px;">
                                <span style="font-size:13px; color:#64748b;">
                                  This code expires in <strong style="color:#1e3a8a;">${expiryMinutes} minutes</strong>.
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
                                <strong>Never share this code.</strong> RailLanka staff will never ask for your OTP. If you didn't request this code, you can safely ignore this email.
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

        const passwordReset = new PasswordResetModel({
            email,
            otpHash,
            expiresAt: expiryMinutes,
        });

        await passwordReset.save();

        return result;

    } catch (error) {
        console.error("Error in forgotPassword()", error);
        throw error;
    }
}

export const verifyOTP = async (email: string, otp: string): Promise<string> => {
    console.log("Executes verifyOTP()");
    try {
        const passwordResetDoc = await PasswordResetModel.findOne({ email });
        if (!passwordResetDoc) {
            throw new AppError(404, "Sorry, related user is not found.");
        }

        if (passwordResetDoc.verifiedAt) {
            throw new AppError(400, "OTP has already been verified.");
        }

        if (passwordResetDoc.attempts >= 5) {
            throw new AppError(429, "Too many attempts. Please request a new OTP.");
        }

        passwordResetDoc.attempts++;
        await passwordResetDoc.save();

        if (passwordResetDoc.expiresAt <= new Date()) {
            throw new AppError(400, "Your OTP has expired. Please request a new one.");
        }

        const receivedHashedOTP = crypto
            .createHmac("sha256", process.env.OTP_SECRET!)
            .update(otp)
            .digest("hex");

        const receivedBuffer = Buffer.from(receivedHashedOTP, "hex");
        const storedBuffer = Buffer.from(passwordResetDoc.otpHash, "hex");

        const isValid =
            receivedBuffer.length === storedBuffer.length &&
            crypto.timingSafeEqual(receivedBuffer, storedBuffer);

        if (!isValid) {
            throw new AppError(400, "Invalid OTP.");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        passwordResetDoc.verifiedAt = new Date(Date.now());
        passwordResetDoc.resetTokenHash = resetTokenHash;
        passwordResetDoc.resetTokenExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await passwordResetDoc.save();

        return resetToken;

    } catch (error) {
        console.error("Error in verifyOTP()", error);
        throw error;
    }
}

export const resetPassword = async (email: string, resetToken: string, newPassword: string) => {
    console.log("Executes resetPassword()");
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new AppError(404, "Sorry, your email is not valid.");
        }

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const passwordResetDoc = await ResetPasswordModel.findOne({
            resetTokenHash,
            email: user.email,
            resetTokenExpiresAt: { $gt: new Date(Date.now()) }
        });
        if (!passwordResetDoc) {
            throw new AppError(401, "Sorry, Your request can't process.");
        }

        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        await passwordResetDoc.deleteOne();

    } catch (error) {
        console.error("Error in resetPassword()", error);
        throw error;
    }
}