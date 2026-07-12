import { NextResponse } from "next/server";

type DemoBody = {
  type?: "demo" | "waitlist";
  name?: string;
  hotel?: string;
  email?: string;
  phone?: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DemoBody;
    const { type = "demo", name, hotel, email, phone } = body;

    if (!email?.trim() || !emailRe.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (type === "waitlist") {
      // Wire up your email provider here (Resend, SendGrid, Nodemailer, etc.)
      // Example:
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: "ValtiqStay <noreply@valtiqstay.com>",
      //   to: "alisamaffei@valtiqstay.com",
      //   subject: "New waitlist signup",
      //   text: `Email: ${email}\nTime: ${new Date().toISOString()}`,
      // });
      console.log("[ValtiqStay Waitlist] signup at", new Date().toISOString());
      return NextResponse.json({ success: true });
    }

    // Demo / partner request (hotel path)
    if (!name?.trim() || !hotel?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Wire up your email provider here
    // Example:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "ValtiqStay <noreply@valtiqstay.com>",
    //   to: "alisamaffei@valtiqstay.com",
    //   subject: `Demo request — ${name} from ${hotel}`,
    //   text: `Name: ${name}\nHotel: ${hotel}\nEmail: ${email}\nPhone: ${phone ?? "—"}\nTime: ${new Date().toISOString()}`,
    // });

    console.log("[ValtiqStay Demo] request at", new Date().toISOString());
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
