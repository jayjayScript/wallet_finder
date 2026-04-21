import { NextResponse } from "next/server";

/**
 * POST /api/log-email
 *
 * Receives a searched email and forwards it to the admin panel API.
 * Set the ADMIN_API_URL environment variable when you have the endpoint ready.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, timestamp } = body as { email: string; timestamp: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }

    const ADMIN_API_URL = process.env.ADMIN_API_URL ?? "";

    if (!ADMIN_API_URL) {
      // API not configured yet — just log server-side for now
      console.log(`[WalletFinder] Email searched: ${email} at ${timestamp}`);
      return NextResponse.json({ success: true, note: "Logged locally — admin API not configured" });
    }

    /* ── Forward to admin panel ── */
    const res = await fetch(ADMIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any auth headers your admin API requires:
        // "Authorization": `Bearer ${process.env.ADMIN_API_KEY}`,
      },
      body: JSON.stringify({ email, timestamp, source: "wallet-finder" }),
    });

    if (!res.ok) {
      console.error(`[WalletFinder] Admin API responded with ${res.status}`);
      return NextResponse.json({ success: false, error: "Admin API error" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[WalletFinder] log-email error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
