const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: "Rock'n Rate <info@rocknrate.org>",
    to: email,
    subject: subject,
    html: html,
  });
};

const activationTemplate = (username, activationCode) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activation Code</title>
    <style>
        body {
        font-family: Arial, sans-serif;
        background-color: #1d1d1d;
        margin: 0;
        padding: 20px;
        }
        .container {
        max-width: 600px;
        margin: auto;
        background-color: #1d1d1d;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
        text-align: center;
        padding-bottom: 20px;
        }
        .header h1 {
        margin: 0;
        color: #6ac045;
        }
        .content {
        font-size: 16px;
        line-height: 1.5;
        color: #919191;
        }
        .content a {
        color: #6ac045;
        text-decoration: none;
        }
        .code {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #fff;
        text-align: center;
        margin: 20px 0;
        }
        .footer {
        font-size: 14px;
        color: #919191;
        text-align: center;
        margin-top: 20px;
        }
    </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
        <h1>Welcome to Rock'n Rate!</h1>
        </div>
        <div class="content">
        <p>Hello ${username},</p>
        <p>Thank you for registering with Rock'n Rate. To complete your registration, please use the activation code below:</p>
        <span class="code">${activationCode}</span>
        <p>If you did not request this activation code, please ignore this email.</p>
        <p>If you have any questions or need further assistance, feel free to <a href="mailto:info@rocknrate.org">contact us</a>.</p>
        </div>
        <div class="footer">
        <p>Best regards</p>
        </div>
    </div>
    </body>
    </html>
    `
};


module.exports = { sendEmail, activationTemplate };