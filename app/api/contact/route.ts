import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Configure the email transport using Nodemailer
    // We will use standard SMTP config. The user will need to supply EMAIL_USER and EMAIL_PASS
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard configuration for Gmail
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail Address
        pass: process.env.EMAIL_PASS, // Your App Password
      },
    });

    // Setup the email data
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Send from the authenticated user to avoid spam filters
      replyTo: email,
      to: process.env.EMAIL_USER, // Send to your own email address
      subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #6b21a8; margin-top: 0;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <h3 style="color: #1e293b;">Message:</h3>
          <p style="white-space: pre-wrap; color: #334155; line-height: 1.6;">${message}</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
