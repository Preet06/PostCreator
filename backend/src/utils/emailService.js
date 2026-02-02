const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {Object} options - Email options (email, subject, message)
 */
const sendEmail = async (options) => {
    // Create transporter
    // For development, we'll use Ethereal (fake SMTP service)
    // In production, you would use SendGrid, Mailtrap, etc.
    let testAccount;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        testAccount = await nodemailer.createTestAccount();
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || testAccount?.smtp.host || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || testAccount?.smtp.port || 587,
        auth: {
            user: process.env.EMAIL_USER || testAccount?.user,
            pass: process.env.EMAIL_PASS || testAccount?.pass,
        },
    });

    // Define email options
    const mailOptions = {
        from: `PostCreator <${process.env.FROM_EMAIL || 'noreply@postcreator.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
