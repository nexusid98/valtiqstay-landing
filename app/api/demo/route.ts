import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {name?:string;hotel?:string;email?:string;phone?:string};
    const { name, hotel, email, phone } = body;

    if (!name?.trim() || !hotel?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Wire up your email provider here (Resend, SendGrid, Nodemailer, etc.)
    // Example:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "ValtiqStay <noreply@valtiqstay.com>",
    //   to: "alisamaffei@valtiqstay.com",
    //   subject: `Demo request from ${name} — ${hotel}`,
    //   text: `Name: ${name}\nHotel: ${hotel}\nEmail: ${email}\nPhone: ${phone ?? "—"}\nTime: ${new Date().toISOString()}`,
    // });

    console.log("[ValtiqStay Demo]", { name, hotel, email, phone: phone ?? "—", ts: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
