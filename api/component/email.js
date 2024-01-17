//email.js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'azpwkk@gmail.com',
      pass: 'ujwh sttm gfrq saln'
    }
});

function sendEMAIL(toaddress, otp) {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'azpwkk@gmail.com',
            to: toaddress,
            subject: 'register',
            text: otp
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(error.toString());
            } else {
                console.log('Email sent:', info.response);
                resolve('Email terkirim: ' + info.response);
            }
        });
    });
}


module.exports = sendEMAIL;
