const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "AutoCare Hub - Password Reset OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#0d3d3d">AutoCare Hub</h2>
        <p>Your password reset OTP is:</p>
        <div style="background:#f0fdf4;border:2px solid #0d3d3d;padding:20px;text-align:center;border-radius:10px;margin:20px 0">
          <h1 style="color:#0d3d3d;letter-spacing:10px;margin:0;font-size:36px">${otp}</h1>
        </div>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color:#888;font-size:12px">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTP };
