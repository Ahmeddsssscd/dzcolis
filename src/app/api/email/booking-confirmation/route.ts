import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { to, firstName, bookingRef, fromCity, toCity, departureDate, totalAmount } = await req.json();
    if (!to || !bookingRef) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await sendBookingConfirmationEmail(to, { firstName, bookingRef, fromCity, toCity, departureDate, totalAmount });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Email error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
