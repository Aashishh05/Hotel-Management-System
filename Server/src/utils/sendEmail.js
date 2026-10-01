import transporter from "../config/nodemailer.js";

const sendEmail = async (options) => {
  await transporter.sendEmail({
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: "password reset OTP",
    text: `Your OTP for password reset is ${options.otp}. It is valid for 10 minutes.`,
  });
};

export default sendEmail;