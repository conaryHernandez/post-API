const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
// CONSTANTS
const MONGODB_URI = 'mongodb://conaryh:k9X9MpdWnfHYcqMC@cluster0-shard-00-00-nvbxl.mongodb.net:27017,cluster0-shard-00-01-nvbxl.mongodb.net:27017,cluster0-shard-00-02-nvbxl.mongodb.net:27017/messages?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&w=majority';

const app = express();
const feedRoutes = require('./routes/feed');

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'images');
//     },
//     filename: function(req, file, cb) {
//         cb(null, uuidv4())
//     }
// });

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});


const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json()); // application/json
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')));
// CORS enabled
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // allowing specific origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // allowing specific origins to use our methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // allowing specific origins to set headers
    next();
});


app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);

    const status = error.statusCode;
    const message = error.message;

    res.status(status).json(message);
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(8080);
    })
    .catch(err => {
        console.log(err);
    });