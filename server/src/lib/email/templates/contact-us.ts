import { config } from "../../../config/app.config";

const host = config.HOST;

export const contactUsFormTemplate = ({
  name,
  email,
  serviceType,
  message,
}: {
  name: string;
  email: string;
  serviceType: string;
  message: string;
}) => ({
  to: "info@bitnoxsolution.com",
  subject: `New Contact Message from ${name}`,
  text: `
You have received a new message via Contact Us form on (${host}).

Name: ${name}
Email: ${email}
Service Type: ${serviceType}
Message:
${message}
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
          background-color: #00e6ff;
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
        }
        .content h2 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #333333;
        }
        .label {
          font-weight: bold;
          margin-top: 15px;
        }
        .value {
          margin: 5px 0 15px;
          color: #555555;
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
        <div class="header">New Contact Message</div>
        <div class="content">
          <h2>You’ve received a new message from the platform contact form on (${host})</h2>
          <div>
            <div class="label">Sender Name:</div>
            <div class="value">${name}</div>

            <div class="label">Sender Email:</div>
            <div class="value">${email}</div>

            <div class="label">Service Type:</div>
            <div class="value">${serviceType}</div>

            <div class="label">Message:</div>
            <div class="value">${message.replace(/\n/g, "<br/>")}</div>
          </div>
        </div>
        <div class="footer">
          <p>This message was sent from your platform’s contact form. Please do not share this email address publicly.</p>
        </div>
      </div>
    </body>
    </html>
  `,
});
