import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: body.email,
      to: "info@dariellamotors.com",
      subject: `${body.firstName} - Inquiry about ${body.carTitle}`,
      html: `
        <h2>New Availability Request</h2>
        <p><b>Name:</b> ${body.firstName} ${body.lastName}</p>
        <p><b>Email:</b> ${body.email}</p>
        <p><b>Phone:</b> ${body.phone}</p>
        <p><b>Car:</b> ${body.carTitle}</p>
        <p><b>Page URL:</b> <a href="${body.pageUrl}">${body.pageUrl}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.log(e);
    return new Response("Email Error", { status: 500 });
  }
}
