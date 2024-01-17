//send.js
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const router = express();
const getDateTimeNow = require('./component/datetime');

const dbFilePath = './api/db/users.json';

router.get('/:alamat/:secretKey/:currency/:value/:alamatTujuan', (req, res) => {
    const { alamat, secretKey, currency, value, alamatTujuan } = req.params;

    let data = [];
    try {
        const fileContent = fs.readFileSync(dbFilePath, 'utf8');
        data = JSON.parse(fileContent);
    } catch (error) {
        res.status(500).send('Internal Server Error');
        return;
    }

    const senderIndex = data.findIndex(entry => entry.alamat === alamat && entry.secretKey === secretKey);

    if (senderIndex !== -1) {
        const fee = 500;
        const totalValue = parseInt(value);

        if (totalValue < 1000) {
            res.status(400).send('Minimum transaction value is 1000');
            return;
        }

        if (parseInt(data[senderIndex].balance[0][currency]) < totalValue + fee) {
            res.status(400).send(`Insufficient balance in ${currency}`);
            return;
        }

        const receiverIndex = data.findIndex(entry => entry.alamat === alamatTujuan);

        if (receiverIndex !== -1) {
            // Update the balance for the sender (including fee)
            data[senderIndex].balance[0][currency] = (parseInt(data[senderIndex].balance[0][currency]) - (totalValue + fee)).toString();

            // Update the balance for the receiver
            data[receiverIndex].balance[0][currency] = (parseInt(data[receiverIndex].balance[0][currency]) + totalValue).toString();

            // Create the hs object for the transaction and add it to the sender's history
            const hsSender = {
                date_time: getDateTimeNow(),
                opt: 'sell',
                currency,
                value: (totalValue + fee).toString(), // Include fee in the total value
                pengirim: alamat,
                penerima: alamatTujuan
            };

            if (!data[senderIndex].history) {
                data[senderIndex].history = { transactions: [] };
            }

            data[senderIndex].history.transactions.push(hsSender);

            const hsReceiver = {
                date_time: getDateTimeNow(),
                opt: 'buy',
                currency,
                value: totalValue.toString(),
                penerima: alamatTujuan,
                pengirim: alamat
            };

            if (!data[receiverIndex].history) {
                data[receiverIndex].history = { transactions: [] };
            }

            data[receiverIndex].history.transactions.push(hsReceiver);

            fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
            res.json(data[senderIndex].history.transactions);
        } else {
            res.status(404).send('Receiver data not found');
        }
    } else {
        res.status(404).send('Sender data not found');
    }
});

module.exports = router;
