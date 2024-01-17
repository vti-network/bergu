//reg.js
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const router = express();
const getDateTimeNow = require ('./component/datetime')
const sendEMAIL = require ('./component/email')
// const nodemailer = require('nodemailer');
//
const generatedHashes = {};
const dbFilePath = './api/db/users.json';
let data = [];
try {
    const fileContent = fs.readFileSync(dbFilePath, 'utf8');
    data = JSON.parse(fileContent);

} catch (error) {
    
}

// /api/r/:email/:password
router.get('/:email/:password', (req, res) => {
    const { email, password } = req.params;

    // Pengecekan apakah email sudah pernah di-generate
    const existingHashEntry = data.find(entry => entry.email === email);
    if (existingHashEntry) {
        const existingHash = existingHashEntry.alamat;
        // res.send(`Hash sudah di-generate sebelumnya: ${existingHash}`);
        res.json({
            Hash_sudah_di_generate_sebelumnya: `/${existingHash}`
        });
        return;
    }


    // Generate a random secret key
    const secretKey = crypto.randomBytes(32).toString('hex');
    // Combine email, password, dan secret key
    const combinedString = `${email}:${password}:${secretKey}`;
    // Membuat hash menggunakan SHA256
    const hash = crypto.createHash('sha256').update(combinedString).digest('hex');
    // Menyimpan hash yang sudah di-generate
    generatedHashes[`${email}:${password}`] = hash;

    const toaddress = email;
    const otp = [`email: ${email}\npassword: ${password}\nalamat: ${hash}\nsecretkey: ${secretKey}`];
    sendEMAIL(toaddress,otp);

    //history
    const history = 
        {
            created: getDateTimeNow(),
            transactions:[]
        };


    // Menyimpan data ke dalam array
    const newData = {
        email,
        password,
        alamat: 'x62'+hash,
        secretKey,
        balance: [
            {
                IDR: "0",
                VTI: "0"
            }
        ],
        history : history
        
        
    };

    data.push(newData);
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');

    res.json({
        alamat: `x62${hash}`,
        secretKey: secretKey
    });


console.log(newData);

});
//

module.exports = router;