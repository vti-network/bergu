// login.js
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const router = express();
const getDateTimeNow = require('./component/datetime');
const sendEMAIL = require('./component/email');
// const nodemailer = require('nodemailer');
const dbFilePath = './api/db/users.json';
let data = [];
try {
    const fileContent = fs.readFileSync(dbFilePath, 'utf8');
    data = JSON.parse(fileContent);
} catch (error) {}

router.get('/:email/:password', (req, res) => {
    const { email, password } = req.params;

    // Find user based on email and password
    const user = data.find(entry => entry.email === email && entry.password === password);

    if (user) {
        // Authentication successful
        const loginTime = getDateTimeNow();
        const generatedtoken = generateToken(email, loginTime);
        // You may perform additional actions here (e.g., create a session, set cookies, etc.)
        res.cookie(user.alamat, generatedtoken, { maxAge: 86400000, httpOnly: true });
        res.json({
            success: true,
            message: 'Authentication successful',
            user: {
                email: user.email,
                alamat: user.alamat,
                // Include other relevant user information
            },
            loginTime,
        });

    } else {
        // Authentication failed
        res.status(401).json({
            success: false,
            message: 'Authentication failed. Invalid email or password.',
        });
    }
    console.log(user);
});

// Function to generate a unique token
function generateToken(email, loginTime) {
    // Combine email and login time to create a unique string
    const uniqueString = email + loginTime;

    // Create a hash using SHA256
    const sha256 = crypto.createHash('sha256');
    sha256.update(uniqueString);

    // Return the hashed token
    return sha256.digest('hex');
}
module.exports = router;
