import { sendEmail } from "../../lib/email/send";
import { contactUsFormTemplate } from "../../lib/email/templates/contact-us";
import { BadRequestException } from "../../lib/errors/catch-errors";

export class EmailService {
  public sendContactUsEmail = async ({
    name,
    email,
    message,
  }: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> => {
    const emailContent = contactUsFormTemplate({
      name,
      email,
      message,
    });

    const sendResult = await sendEmail({ ...emailContent, replyTo: email });
    // treat missing result or an error flag as failure
    if (!sendResult || (sendResult as any).error) {
      throw new BadRequestException("Failed to send contact us email");
    }
  };
}
