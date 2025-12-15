import { Resend } from "resend";
 
const resend = new Resend(process.env.RESEND_API_KEY);
 const getEmailTemplate = (
  subject: string,
  content: string,
  user: { name: string }
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="
  margin:0;
  padding:0;
  background-color:#f4f4f4;
  font-family:Arial, Helvetica, sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="
          background-color:#ffffff;
          border-radius:8px;
          overflow:hidden;
          box-shadow:0 2px 8px rgba(0,0,0,0.05);
        ">

          <!-- Header -->
          <tr>
            <td style="
              background-color:#000000;
              padding:20px;
              text-align:center;
            ">
              <h1 style="
                color:#ffffff;
                margin:0;
                font-size:22px;
                letter-spacing:1px;
              ">
                KLG GROUP COUTURE
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h2 style="
                color:#333333;
                font-size:20px;
                margin-top:0;
              ">
                ${subject}
              </h2>

              <p style="
                color:#555555;
                font-size:14px;
                line-height:1.6;
              ">
                Hello <strong>${user.name}</strong>,
              </p>

              <p style="
                color:#555555;
                font-size:14px;
                line-height:1.6;
              ">
                ${content}
              </p>

              <!-- Divider -->
              <hr style="
                border:none;
                border-top:1px solid #eeeeee;
                margin:30px 0;
              "/>

              <p style="
                color:#777777;
                font-size:13px;
                line-height:1.6;
              ">
                If you did not request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background-color:#fafafa;
              padding:20px;
              text-align:center;
            ">
              <p style="
                color:#999999;
                font-size:12px;
                margin:0;
              ">
                © ${new Date().getFullYear()} KLG GROUP COUTURE<br/>
                All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};


export const sendEmail = async (to: string, subject: string, content: string, user: {name: string}) => {
    const html = getEmailTemplate(subject, content, user)
    try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: `KLG GROUP COUTURE - ${subject}`,
      html: html,
    });
    
    console.log(`Email sent to ${to} with subject: ${subject}`);
         
    } catch (error) {
        console.error('Failed to send email', error);
    }
  
}

export const sendOPT = async (data: any) => {
  const { email, otp, user } = data;

  const subject = "Your One-Time Password (OTP)";

  const content = `
    Please use the following One-Time Password (OTP) to complete your action:

    <div style="
      margin:20px 0;
      padding:15px;
      background-color:#f4f4f4;
      border-radius:6px;
      text-align:center;
      font-size:20px;
      letter-spacing:3px;
      font-weight:bold;
    ">
      ${otp}
    </div>

    This code is valid for <strong>5 minutes</strong>.
    <br/><br/>
    For security reasons, please do not share this code with anyone.
  `;

  await sendEmail(email, subject, content, user);
};

export const sendConfirmationEmail = async (to: string, user: any) => {
  const subject = "Welcome to KLG GROUP COUTURE 🎉";

  const content = `
    Your registration has been successfully completed!
    <br/><br/>
    We're excited to welcome you to <strong>KLG GROUP COUTURE</strong>.
    Our platform is designed to help you manage your couture activities easily and efficiently.
    <br/><br/>
    If you need any assistance, feel free to contact our support team.
  `;

  await sendEmail(to, subject, content, user);
};
