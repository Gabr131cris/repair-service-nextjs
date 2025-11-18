import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { firstName, lastName, email, phone, carTitle, pageUrl } = body;

    await resend.emails.send({
      from: "Dariella Motors <info@dariellamotors.com>", // domain UL TAU valid
      to: "info@dariellamotors.com", // email unde primești mesajele
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
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
