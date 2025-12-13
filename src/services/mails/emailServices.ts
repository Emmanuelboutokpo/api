import nodemailer from 'nodemailer';
import { userInfo } from 'os';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,  
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const getEmailTemplate = (subject:string, content : string, user: {name: string}) => {
    return `
    <html>
    <body>
        <img src='${process.env.LOGO_URL}' alt="Company Logo" style="width:150px;"/>
        <h1>${process.env.COMPANY_NAME}</h1>
        <h2>${subject}</h2>
        <p>Dear ${user.name},</p>
        <p>${content}</p>
        <br/>
        <ul>
           ${Object.entries(userInfo()).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
        </ul>
        <br/>

        <p>Best regards, </p>
        <p>${process.env.COMPANY_NAME} Team</p>
    </body>
    </html>
    `;
}

export const sendEmail = async (to: string, subject: string, content: string, user: {name: string}) => {
    const html = getEmailTemplate(subject, content, user)
    try {
        await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `${process.env.COMPANY_NAME} - ${subject}` ,
        html: html,
    });
    console.log(`Email sent to ${to} with subject: ${subject}`);
         
    } catch (error) {
        throw new Error('Failed to send email');
    }
  
}

export const sendOPT = async (data : any) => {
   const {email, otp, user} = data; 
   const subject = 'Your One-Time Password (OTP)';
   const content = `Your OTP is: <strong>${otp}</strong>. It is valid for 5 minutes. Please do not share it with anyone.`;
   await sendEmail(email, subject, content, user);
}

export const sendConfirmationEmail = async (to : string, user : any) => {
 
   const content = `Welcome to SOMACOP Benin platform! Your registration is successful. We're excited to have you on board.`;
   await sendEmail(to, 'Welcome', content, user);
}
