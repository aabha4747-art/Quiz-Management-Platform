const nodemailer = require("nodemailer");

/* =========================================================
   EMAIL TRANSPORTER
========================================================= */

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_APP_PASSWORD,
    },
  });

/* =========================================================
   VERIFY CONNECTION
========================================================= */

const verifyEmailConnection =
  async () => {
    try {
      await transporter.verify();

      console.log(
        "Email service connected successfully"
      );

      return true;
    } catch (error) {
      console.error(
        "Email service connection failed:",
        error
      );

      return false;
    }
  };

/* =========================================================
   SEND PASSWORD RESET EMAIL
========================================================= */

const sendPasswordResetEmail =
  async ({
    to,
    name,
    resetToken,
    expiryMinutes = 15,
  }) => {
    if (!process.env.EMAIL_USER) {
      throw new Error(
        "EMAIL_USER is missing from .env"
      );
    }

    if (
      !process.env.EMAIL_APP_PASSWORD
    ) {
      throw new Error(
        "EMAIL_APP_PASSWORD is missing from .env"
      );
    }

    const clientUrl =
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const resetUrl =
      `${clientUrl}/reset-password?token=${encodeURIComponent(
        resetToken
      )}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "BioNova"}" <${process.env.EMAIL_USER}>`,

      to,

      subject:
        "Reset your BioNova password",

      text: `
Hello ${name || "Student"},

We received a request to reset your BioNova password.

Use this link to reset your password:

${resetUrl}

This link expires in ${expiryMinutes} minutes.

If you did not request this reset, you can ignore this email.

BioNova
Learn. Assess. Improve.
      `.trim(),

      html: `
        <!DOCTYPE html>
        <html>
          <body
            style="
              margin:0;
              padding:0;
              background:#f7faf9;
              font-family:Arial,Helvetica,sans-serif;
              color:#0f172a;
            "
          >
            <table
              width="100%"
              cellspacing="0"
              cellpadding="0"
              style="
                background:#f7faf9;
                padding:40px 16px;
              "
            >
              <tr>
                <td align="center">
                  <table
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="
                      max-width:600px;
                      background:#ffffff;
                      border-radius:20px;
                      overflow:hidden;
                      border:1px solid #e2e8f0;
                    "
                  >
                    <tr>
                      <td
                        style="
                          padding:30px;
                          background:#0f766e;
                          color:#ffffff;
                        "
                      >
                        <div
                          style="
                            font-size:26px;
                            font-weight:800;
                          "
                        >
                          BioNova
                        </div>

                        <div
                          style="
                            margin-top:6px;
                            font-size:14px;
                          "
                        >
                          Biotechnology Learning Platform
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style="
                          padding:34px;
                        "
                      >
                        <div
                          style="
                            color:#0f766e;
                            font-size:13px;
                            font-weight:800;
                            letter-spacing:1.4px;
                            text-transform:uppercase;
                          "
                        >
                          Password Recovery
                        </div>

                        <h1
                          style="
                            margin:12px 0 14px;
                            font-size:28px;
                            color:#0f172a;
                          "
                        >
                          Reset your password
                        </h1>

                        <p
                          style="
                            font-size:16px;
                            line-height:1.7;
                            color:#475569;
                          "
                        >
                          Hi ${name || "Student"},
                        </p>

                        <p
                          style="
                            font-size:16px;
                            line-height:1.7;
                            color:#475569;
                          "
                        >
                          We received a request to reset the password for your BioNova account.
                        </p>

                        <p
                          style="
                            font-size:16px;
                            line-height:1.7;
                            color:#475569;
                          "
                        >
                          Click the button below to create a new password.
                        </p>

                        <a
                          href="${resetUrl}"
                          style="
                            display:inline-block;
                            margin:20px 0;
                            background:#0f766e;
                            color:#ffffff;
                            text-decoration:none;
                            padding:14px 24px;
                            border-radius:10px;
                            font-weight:700;
                          "
                        >
                          Reset Password
                        </a>

                        <p
                          style="
                            font-size:14px;
                            line-height:1.7;
                            color:#64748b;
                          "
                        >
                          This link expires in ${expiryMinutes} minutes.
                        </p>

                        <p
                          style="
                            font-size:14px;
                            line-height:1.7;
                            color:#64748b;
                          "
                        >
                          If you did not request this password reset, you can safely ignore this email.
                        </p>

                        <hr
                          style="
                            margin:28px 0;
                            border:none;
                            border-top:1px solid #e2e8f0;
                          "
                        />

                        <p
                          style="
                            margin:0;
                            font-size:13px;
                            color:#94a3b8;
                          "
                        >
                          BioNova · Learn. Assess. Improve.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Password reset email sent:",
      info.messageId
    );

    return info;
  };

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  verifyEmailConnection,
  sendPasswordResetEmail,
};