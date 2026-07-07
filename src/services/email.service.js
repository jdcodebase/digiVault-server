import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';

const transporter = Object.freeze(
    nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    })
)

export const verifyTransporter = async () => {
    try {
        await transporter.verify();

        logger.info("SMTP transporter verified successfully");
    } catch (error) {
        logger.error("SMTP verification failed", {
            message: error.message,
            stack: error.stack,
        });

        throw error;
    }
};

export const sendEmail = async (to, subject, html) => {
    if (!to) {
        throw new Error("Recipient email is required");
    }

    try {
        const info = await transporter.sendMail({
            from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_EMAIL}>`,
            to,
            subject,
            html,
        });

        logger.info("Email sent successfully", {
            to,
            subject,
            messageId: info.messageId,
        });

        return info;
    } catch (error) {
        logger.error("Failed to send email", {
            to,
            subject,
            message: error.message,
            stack: error.stack,
        });

        throw error;
    }
};

export const sendVerificationEmail = async (name, email, otp) => {
    const subject = "Verify your Email";

    const html = `
        <h2>Email Verification</h2>
        <p>Hi ${name},</p>
        <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            text-align:center;
            background:#f5f5f5;
            padding:16px;
            border-radius:8px;
        ">
            362004
        </div>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>

        <p>If you didn't request this verification, you can safely ignore this email.</p>
    `;

    await sendEmail(email, subject, html);
};