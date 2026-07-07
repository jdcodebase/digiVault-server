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
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
    `;

    await sendEmail(email, subject, html);
};