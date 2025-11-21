import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();

    await resend.emails.send({
      from: "Dariella Motors <noreply@dariellamotors.com>",
      to: "info@dariellamotors.com",
      subject: `!!! Consign !!! New Vehicle Submission From ${body.firstName} ${body.lastName}`,
      html: `
        <h2>!!! Consign FROM ${body.firstName}</h2>

        <h3>Vehicle Details</h3>
        <p><b>VIN:</b> ${body.vin || "-"}</p>
        <p><b>Make:</b> ${body.make || "-"}</p>
        <p><b>Model:</b> ${body.model || "-"}</p>
        <p><b>Year:</b> ${body.year || "-"}</p>
        <p><b>Miles:</b> ${body.miles || "-"}</p>

        <h3>Personal Details</h3>
        <p><b>Name:</b> ${body.firstName}  ${body.lastName}</p>
        <p><b>Email:</b> ${body.email}</p>
        <p><b>Phone:</b> ${body.phone}</p>

        <br/>
        <p>This email was submitted from your website - consign page.</p>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
