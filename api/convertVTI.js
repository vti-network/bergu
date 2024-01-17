// convertVTI.js
const express = require('express');
const router = express();
const fs = require('fs');
const getDateTimeNow = require('./component/datetime');

const dbFilePath = './api/db/users.json';

// Middleware untuk membaca data dari file
const bacaDataDariFile = () => {
    try {
        const kontenFile = fs.readFileSync(dbFilePath, 'utf8');
        return JSON.parse(kontenFile);
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Rute untuk mengonversi VTI ke IDR
router.get('/:alamat/:secretKey/VTI/:vtiAmount/IDR', (req, res) => {
    const {alamat, secretKey, vtiAmount } = req.params;

    // Validasi vtiAmount
    const vtiAmountTerparse = parseInt(vtiAmount);
    if (isNaN(vtiAmountTerparse) || vtiAmountTerparse <= 0) {
        res.status(400).send('Jumlah VTI tidak valid');
        return;
    }

    // Baca data dari file menggunakan middleware
    let data = bacaDataDariFile();

    // Temukan data berdasarkan secretKey
    const indeksDataDitemukan = data.findIndex(entry => entry.alamat === alamat && entry.secretKey === secretKey);

    if (indeksDataDitemukan !== -1) {
        // Jika data ditemukan, konversi VTI ke IDR dengan biaya
        const biayaGas = 500; // Biaya gas untuk konversi
        const jumlahTerkonversi = vtiAmountTerparse - biayaGas;

        // Periksa apakah pengguna memiliki saldo cukup di VTI
        if (parseInt(data[indeksDataDitemukan].balance[0].VTI) < vtiAmountTerparse) {
            res.status(400).send('Saldo VTI tidak mencukupi');
            return;
        }

        // Perbarui saldo
        data[indeksDataDitemukan].balance[0].VTI = (parseInt(data[indeksDataDitemukan].balance[0].VTI) - vtiAmountTerparse).toString();
        data[indeksDataDitemukan].balance[0].IDR = (parseInt(data[indeksDataDitemukan].balance[0].IDR) + jumlahTerkonversi).toString();

        // Buat entri histori
        const hs = {
            date_time: getDateTimeNow(),
            opt: 'convert',
            value: vtiAmountTerparse,
            currency: 'VTI',
            pengirim: alamat,
            penerima: alamat
        };

        if (!data[indeksDataDitemukan].history) {
            data[indeksDataDitemukan].history = { transactions: [] };
        }

        data[indeksDataDitemukan].history.transactions.push(hs);

        // Perbarui file dengan data yang telah dimodifikasi
        try {
            fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
            // Respon dengan data yang diperbarui
            res.json(data[indeksDataDitemukan].history.transactions);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error saat memperbarui data');
        }
    } else {
        // Jika data tidak ditemukan, kirim respons 404
        res.status(404).send('Data tidak ditemukan');
    }
});

module.exports = router;
