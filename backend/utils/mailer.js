require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendEmail(toEmail, url) {
  const mailOptions = {
    from: `"CodingRing" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Verify Your Email - CodingRing",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f6fa; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background-color: #2d3436; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">CodingRing</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2>Welcome to CodingRing!</h2>
            <p style="font-size: 16px; color: #636e72;">Click the button below to verify your email address and get started.</p>
            <a href="${url}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #0984e3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
            <p style="margin-top: 30px; font-size: 14px; color: #b2bec3;">If you didn’t request this, you can safely ignore it.</p>
          </div>
          <div style="background-color: #dfe6e9; text-align: center; padding: 20px; font-size: 12px; color: #636e72;">
            &copy; ${new Date().getFullYear()} CodingRing. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


module.exports = sendEmail;