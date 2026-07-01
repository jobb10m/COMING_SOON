import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[mailer] SMTP not configured — skipping email to ${to}: "${subject}"`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Gym Management <no-reply@gym.com>',
    to,
    subject,
    html,
  });
}

export const templates = {
  passwordReset: (resetUrl: string) => `
    <h2>Reset your password</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `,
  membershipExpiry: (name: string, endDate: string) => `
    <h2>Membership Expiring Soon</h2>
    <p>Hi ${name}, your membership expires on ${endDate}. Renew now to keep your access.</p>
  `,
  paymentConfirmation: (name: string, amount: number) => `
    <h2>Payment Received</h2>
    <p>Hi ${name}, we've received your payment of ${amount}. Thank you!</p>
  `,
  classReminder: (name: string, className: string, time: string) => `
    <h2>Class Reminder</h2>
    <p>Hi ${name}, your class "${className}" starts at ${time}.</p>
  `,
};
