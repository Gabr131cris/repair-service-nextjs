import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await req.json();
    const { firstName, lastName, email, phone, carTitle, pageUrl } = body;

    await resend.emails.send({
      from: "notifications@oprenashue.resend.app", 
      to: "info@dariellamotors.com",
      subject: `${firstName} is interested in ${carTitle}`,
      html: `
        <h2>New Inquiry – Check Availability</h2>

        <p><b>First Name:</b> ${firstName}</p>
        <p><b>Last Name:</b> ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>

        <hr />

        <p><b>Car Listing:</b> ${carTitle}</p>
        <p><b>Page URL:</b> <a href="${pageUrl}">${pageUrl}</a></p>

        <br />
        <p>This lead was automatically generated from the website.</p>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.log("EMAIL ERROR →", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
