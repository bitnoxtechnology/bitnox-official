import { resend } from "./client";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
  replyTo?: string;
};

export const sendEmail = async ({
  to,
  from = "Bitnox Technology <bitnox@mailer.bitnoxsolution.com>",
  subject,
  text,
  html,
  replyTo,
}: Params) => {
  try {
    const emailResponse = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      text,
      subject,
      html,
      replyTo,
    });

    console.log("Resend Email Response: ", emailResponse);
    return emailResponse;
  } catch (error) {
    console.error("Resend Email Sending Failed: ", error);
  }
};
