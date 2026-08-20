import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

const emailFrom = process.env.EMAIL_FROM || smtpUser;

if (
  !smtpHost ||
  !smtpUser ||
  !smtpPassword ||
  !emailFrom
) {
  console.warn(
    "SMTP email configuration is missing. OTP emails will not work until SMTP variables are configured.",
  );
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,

  // Gmail SMTP:
  // 587 = STARTTLS
  // 465 = SSL
  secure: smtpPort === 465,

  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },

  // Keep SMTP connection alive
  pool: true,
  maxConnections: 3,
  maxMessages: 100,

  // Fail fast if SMTP is actually unreachable
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,

  // Reuse connections
  tls: {
    minVersion: "TLSv1.2",
  },
});

/*
 * SMTP WARM-UP
 *
 * This checks the SMTP server when backend starts
 * instead of waiting for the first OTP request.
 */
if (smtpHost && smtpUser && smtpPassword) {
  transporter
    .verify()
    .then(() => {
      console.log("SMTP READY - OTP email server connected");
    })
    .catch((error) => {
      console.error(
        "SMTP CONNECTION ERROR:",
        error?.message || error,
      );
    });
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose:
    | "LOGIN"
    | "REGISTER"
    | "PASSWORD_RESET",
) {
  const purposeText =
    purpose === "LOGIN"
      ? "Admin Login"
      : purpose === "REGISTER"
        ? "Admin Account Verification"
        : "Admin Password Reset";

  const startTime = Date.now();

  console.log(
    `OTP EMAIL START -> ${to} -> ${purpose}`,
  );

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,

      subject: `MF-Rides ${purposeText} OTP`,

      text: `
Your MF-Rides verification OTP is ${otp}.

This OTP expires in 5 minutes.

Do not share this OTP with anyone.
      `.trim(),

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 520px;
            margin: auto;
            padding: 30px;
          "
        >

          <h2 style="color: #f5b000;">
            MF-RIDES
          </h2>

          <h3>
            ${purposeText}
          </h3>

          <p>
            Your verification OTP is:
          </p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 18px;
              background: #f5f5f5;
              text-align: center;
              border-radius: 10px;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP expires in
            <strong>5 minutes</strong>.
          </p>

          <p style="color: #777;">
            Never share this OTP with anyone.
          </p>

          <hr />

          <p
            style="
              color: #999;
              font-size: 12px;
            "
          >
            MF-Rides Admin Security
          </p>

        </div>
      `,
    });

    const elapsed = Date.now() - startTime;

    console.log(
      `OTP EMAIL SENT -> ${to} -> ${elapsed}ms`,
    );

    console.log(
      "SMTP MESSAGE ID:",
      info.messageId,
    );

    console.log(
      "SMTP RESPONSE:",
      info.response,
    );

    return info;
  } catch (error: any) {
    const elapsed = Date.now() - startTime;

    console.error(
      `OTP EMAIL FAILED -> ${to} -> ${elapsed}ms`,
    );

    console.error(
      "SMTP ERROR:",
      error?.message || error,
    );

    throw error;
  }
}