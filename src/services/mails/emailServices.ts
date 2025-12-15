import { Resend } from "resend";
import { userInfo } from 'os';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "<onboarding@resend.dev>",
      to,
      subject: `${process.env.COMPANY_NAME} - ${subject}`,
      html: html,
    });
    
    console.log(`Email sent to ${to} with subject: ${subject}`);
         
    } catch (error) {
        console.error('Failed to send email', error);
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
