// lib/email.js
// Sends parking alert emails via Resend.
// Called by the check-parking API route when a spot opens up.

import { Resend } from "resend"

// Initialize Resend with our API key from .env.local
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendParkingAlert({ email, resortName, date, reservationUrl }) {
  // Format the date nicely: "2026-01-15" → "Thursday, January 15, 2026"
  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Use RESEND_FROM if a custom verified domain is configured in Vercel env vars.
  // Falls back to Resend's shared testing address which works without domain verification.
  const from = process.env.RESEND_FROM || "SkiSpot Alerts <onboarding@resend.dev>"

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: `🎿 Parking just opened at ${resortName} — ${formattedDate}`,
    html: emailTemplate({ resortName, formattedDate, reservationUrl }),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  return data
}

// HTML email template — clean, mobile-friendly
function emailTemplate({ resortName, formattedDate, reservationUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0369a1;padding:32px 32px 24px;">
      <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
        ⛷️ SkiSpot
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;">
        Parking Alert
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        Parking just opened! 🎉
      </h1>
      <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.6;">
        A parking spot became available at <strong style="color:#0f172a;">${resortName}</strong>
        on <strong style="color:#0f172a;">${formattedDate}</strong>.
        Book now before it fills up again — spots go fast.
      </p>

      <!-- CTA Button -->
      <a href="${reservationUrl}"
        style="display:inline-block;background:#0369a1;color:#ffffff;text-decoration:none;
               padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">
        Book Parking Now →
      </a>

      <!-- Warning -->
      <div style="margin-top:24px;padding:14px 16px;background:#fef9c3;border-radius:8px;border-left:3px solid #eab308;">
        <p style="margin:0;font-size:13px;color:#713f12;">
          <strong>Act quickly.</strong> Spots typically get claimed within minutes of opening.
          This alert has been deactivated — set a new one at SkiSpot if you need a backup.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        You received this because you set a parking alert at SkiSpot.
        This alert has been automatically deactivated.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
