const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const emailTemplate = path.join(`${__dirname}`, '..', 'templates/email.html');
const template = fs.readFileSync(emailTemplate, 'utf8');

class EmailService {
  constructor() {}

  // both names supported so controller calls work regardless of casing
  static async sendForgotPasswordEmail(to: string, code: string) {
    return EmailService.sendForgotPasswordMail(to, code);
  }

  static async sendForgotPasswordMail(to: string, code: string) {
    const subject = 'Forgot Password';
    const message = `Your password reset code is <b>${code}</b>. It expires in 5 minutes.`;
    return this.sendMail(to, subject, message);
  }

  private static replaceTemplateConstant(_template: string, key: string, data: string) {
    const regex = new RegExp(key, 'g');
    return _template.replace(regex, data);
  }

  private static async sendMail(to: string, subject: string, message: string) {
    const appName = process.env.APPNAME as string;
    const supportMail = process.env.SUPPORT_MAIL as string;
    const name = to.split('@')[0];
    let html = this.replaceTemplateConstant(template, '#APP_NAME#', appName);
    html = this.replaceTemplateConstant(html, '#NAME#', name);
    html = this.replaceTemplateConstant(html, '#MESSAGE#', message);
    html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text: message,
      html,
    };

    return await transport.sendMail(mailOptions);
  }
}

export default EmailService;