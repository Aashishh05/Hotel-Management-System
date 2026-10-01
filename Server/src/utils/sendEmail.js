import transporter from "../config/nodemailer.js";

const toPlainText = (html) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|li|a|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const sendEmail = async ({ email, subject, message, text }) => {
  if (!email || !subject) {
    throw new Error("sendEmail requires an 'email' and a 'subject'");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_SENDER || process.env.EMAIL_USER,
    to: email,
    subject,
    text: text || toPlainText(message || ""),
    html: message,
  });
};

export default sendEmail;
