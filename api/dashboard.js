//dashboard.js
const express = require('express');
const fs = require('fs');
const router = express.Router();

const dbFilePath = './api/db/users.json';

router.get('/', (req, res) => {
    let data = [];
    try {
        const fileContent = fs.readFileSync(dbFilePath, 'utf8');
        data = JSON.parse(fileContent);
    } catch (error) {
        res.status(500).send('Internal Server Error');
        return;
    }

    // Membuat array untuk menyimpan semua transaksi dari semua pengguna
    const allTransactions = [];

    data.forEach(user => {
        if (user.history && user.history.transactions) {
            // Menambahkan semua transaksi pengguna ke dalam array allTransactions
            allTransactions.push({
                //email: user.email,
                transactions: user.history.transactions
            });
        }
    });

    res.json(allTransactions);
});

router.get('/:address', (req, res) => {
    const { address } = req.params;

    let data = [];
    try {
        const fileContent = fs.readFileSync(dbFilePath, 'utf8');
        data = JSON.parse(fileContent);
    } catch (error) {
        res.status(500).send('Internal Server Error');
        return;
    }

    // Mencari pengguna dengan alamat yang sesuai
    const user = data.find(u => u.alamat === address);

    if (user && user.history && user.history.transactions) {
        // Mengembalikan histori transaksi pengguna dengan alamat tertentu
        res.json({
            //email: user.email,
            transactions: user.history.transactions
        });
    } else {
        // Jika pengguna tidak ditemukan atau tidak memiliki histori transaksi
        res.status(404).send('User not found or no transaction history');
    }
});

module.exports = router;
