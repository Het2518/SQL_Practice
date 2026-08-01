'use strict';

const nodemailer = require('nodemailer');

/**
 * Creates a transporter using standard SMTP environment variables.
 * If EMAIL_USER is not set, it will log the code to the console instead (useful for local dev).
 */
let transporterInstance = null;

function getTransporter() {
  if (transporterInstance) return transporterInstance;
  if (!process.env.EMAIL_USER) return null;

  transporterInstance = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporterInstance;
}

/**
 * Send an email with a 6-digit verification code.
 */
async function sendVerificationEmail(toEmail, code) {
  const transporter = getTransporter();
  
  const subject = 'Verify your DataDesk account';
  const text = `Welcome to DataDesk!\n\nYour 6-digit verification code is: ${code}\n\nThis code will expire in 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to DataDesk!</h2>
      <p>Thank you for registering. Please use the following 6-digit code to verify your account:</p>
      <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; margin: 0; color: #2563eb;">${code}</h1>
      </div>
      <p style="color: #71717a; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    console.log(`\n\n[Email Service (DEV MODE)]\nSubject: ${subject}\nTo: ${toEmail}\nCode: ${code}\n\n`);
    return true; // Pretend it sent for local dev testing
  }

  try {
    await transporter.sendMail({
      from: `"DataDesk" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

/**
 * Send a password reset email with a 6-digit code.
 */
async function sendPasswordResetEmail(toEmail, code) {
  const transporter = getTransporter();
  
  const subject = 'Reset your DataDesk password';
  const text = `You requested a password reset.\n\nYour 6-digit reset code is: ${code}\n\nThis code will expire in 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Use the following 6-digit code to reset it:</p>
      <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; margin: 0; color: #dc2626;">${code}</h1>
      </div>
      <p style="color: #71717a; font-size: 14px;">This code will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    console.log(`\n\n[Email Service (DEV MODE)]\nSubject: ${subject}\nTo: ${toEmail}\nCode: ${code}\n\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"DataDesk Support" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
