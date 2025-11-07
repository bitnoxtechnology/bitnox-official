export const otpEmailTemplate = ({
  name,
  email,
  otp,
  expiresInMinutes = 10,
}: {
  name: string;
  email: string;
  otp: string;
  expiresInMinutes?: number;
}) => ({
  to: email,
  subject: "Your Bitnox Sign-In OTP Code",
  text: `
Hello ${name},

Your One-Time Password (OTP) for signing in to your Bitnox account is: ${otp}

This code will expire in ${expiresInMinutes} minutes. 
If you did not request this, please ignore this message.

- The Bitnox Team
  `,
  html: `
    <html>
    <head>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #00bfa5;
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          padding: 20px;
          text-align: center;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .content {
          padding: 20px;
          text-align: center;
        }
        .content h2 {
          font-size: 22px;
          margin-bottom: 10px;
          color: #333333;
        }
        .otp-box {
          display: inline-block;
          background-color: #f0f9f9;
          color: #00bfa5;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 6px;
          padding: 15px 25px;
          border-radius: 8px;
          margin-top: 20px;
          margin-bottom: 30px;
          border: 2px dashed #00bfa5;
        }
        .footer {
          font-size: 14px;
          color: #999999;
          text-align: center;
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Sign-In Verification</div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Your One-Time Password (OTP) for signing in to your Bitnox account is:</p>
          <div class="otp-box">${otp}</div>
          <p>This code is valid for <strong>${expiresInMinutes} minutes</strong>.</p>
          <p>If you did not request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Bitnox Technology Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
});
