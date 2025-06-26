import nodemailer from 'nodemailer';

export default class EmailService {
  constructor(email, template) {
    this.email = email;
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    this.template =
      template ||
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Xel Package Registry - Notification</title>
  <style>
    :root {
      color-scheme: light dark;
    }

    body {
      font-family: "Segoe UI", Roboto, sans-serif;
      background-color: #f9f9f9;
      color: #333;
      margin: 0;
      padding: 0;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1e1e1e;
        color: #ddd;
      }
      .container {
        background: #2b2b2b;
        box-shadow: 0 0 0 1px #444;
      }
      .footer {
        color: #888;
        border-top: 1px solid #444;
      }
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      padding: 24px 32px;
    }

    .header {
      font-size: 22px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 20px;
    }

    .message {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 24px;
      white-space: pre-wrap;
    }

    .footer {
      font-size: 13px;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 16px;
      margin-top: 24px;
    }

    .footer a {
      color: inherit;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">📦 Xel Package Registry Notification</div>

    <div class="message">
      {{MESSAGE}}
    </div>

    <div class="footer">
      This is an automated message from the <strong>Xel Package Registry</strong>.<br />
      If you didn't perform this action or think this email was sent to you by mistake,<br />
      please reply directly or contact us at <a href="mailto:owner@glitchiethedev.com">owner@glitchiethedev.com</a>.
    </div>
  </div>
</body>
</html>
`;
  }

  async send(subject, message) {
    const template = this.template.replace('{{MESSAGE}}', message);
    const mailOptions = {
      from: process.env.MAIL_SENDER,
      to: this.email,
      subject: subject,
      html: template,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
