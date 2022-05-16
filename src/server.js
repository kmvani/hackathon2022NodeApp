const { textToSpeech } = require('./azure-cognitiveservices-speech');
const { textToSpeechConfig } = require('./azure-cognitiveservices-speech');
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline
} = require('@azure/storage-blob');


const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
var request = require('request-promise');
const utils = require('./utils');
const db = require('./dbconfig')
var stream = require('stream');
const config = require('./appConfig');
const multer = require('multer');
var fs = require('fs');
const getStream = require('into-stream');
const inMemoryStorage = multer.memoryStorage();
//const uploadStrategy = multer({ storage: inMemoryStorage }).single('audio');
const { AZURE_STORAGE_CONTAINER } = require('./appConfig');
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
const ONE_MINUTE = 60 * 1000;

// fn to create express server
const create = async() => {

    // server
    const app = express();
    key = config.RESOURCE_KEY;
    region = config.REGION;
    storageName = config.AZURE_STORAGE_ACCOUNT_NAME;
    storageAccessKey = config.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
    container = config.AZURE_STORAGE_CONTAINER;


    const sharedKeyCredential = new StorageSharedKeyCredential(
        config.AZURE_STORAGE_ACCOUNT_NAME,
        config.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);
    const pipeline = newPipeline(sharedKeyCredential);

    const blobServiceClient = new BlobServiceClient(
        `https://${config.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
        pipeline
    );

    const storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            cb(null, file.originalname);
        },
    });
    const upload = multer({ storage });

    app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

    // Log request
    app.use(utils.appLogger);
    app.use(express.static('public'));
    app.use('/images', express.static('images'));
    app.use('/css', express.static('css'));
    app.use('/js', express.static('js'));

    app.use(express.static('uploads'));

    // root route - serve static file
    app.get('/api/hello', (req, res) => {
        console.log("goodbye...");
        res.json({ hello: 'goodbye' });
        res.end();
    });

    // root route - serve static file
    app.get('/', (req, res) => {
        return res.sendFile(path.join(__dirname, '../public/client.html'));
    });

    app.get('/get-audio-files', async(req, res, next) => {
        var files = fs.readdirSync("/audiofiles/*.mp3");
        console.log("filenames =", files);
    });

    //app.post('/record', upload.single('audio'), (req, res) => res.json({ success: true }));

    app.post('/record', upload.single('audio'), async(req, res) => {
        console.log("upload to container =", container);

        var buffer = fs.readFileSync(req.file.path + ".mp3");
        //  console.log("req.file =", req.file);
        const blobName = req.file.originalname + ".mp3";
        const stream = getStream(buffer);
        const containerClient = blobServiceClient.getContainerClient(container);;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        db.insert(req.file.originalname, "").then((result) => {
            blockBlobClient.uploadStream(stream,
                uploadOptions.bufferSize, uploadOptions.maxBuffers, { blobHTTPHeaders: { blobContentType: "audio/mpeg" } }).then(res => {

            }).catch(err => {
                console.log('error', { message: err.message });

            });

            return res.json({ success: true });
        }).catch(err => {
            console.log("error occured -", err)
            return res.status(500).send(err);
        }).finally(() => {
            db.disconnect();
        });
    });

    const getBlobName = originalName => {
        // Use a random number to generate a unique file name, 
        // removing "0." from the start of the string.
        const identifier = Math.random().toString().replace(/0\./, '');
        return `${identifier}-${originalName}`;
    };

    app.get('/recordings', (req, res) => {
        let files = fs.readdirSync(path.join(__dirname, 'uploads'));

        files = files.filter((file) => {
            // check that the files are audio files
            const fileNameArr = file.split('.');
            return fileNameArr[fileNameArr.length - 1] === 'mp3';
        }).map((file) => `/${file}`);
        return res.json({ success: true, files });
    });

    // creates a temp file on server, the streams to client
    /* eslint-disable no-unused-vars */
    app.get('/text-to-speech', async(req, res, next) => {

        const { phrase, file } = req.query;
        if (!key || !region || !phrase) res.status(404).send('Invalid query string');

        const audioStream = await textToSpeech(key, region, phrase, file);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked'
        });
        audioStream.pipe(res);
    });

    app.get('/insert-text-to-speech', async(req, res, next) => {

        const { phrase } = req.query;
        if (!key || !region || !phrase) res.status(404).send('Invalid query string');

        const audioStream = await textToSpeech(key, region, phrase, true);
        db.connect();
        db.insert(phrase, audioStream).then((result) => {
            console.log("inserted uploading the file...");
            const blobName = phrase + ".mp3";
            const stream = audioStream;
            const containerClient = blobServiceClient.getContainerClient(container);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            blockBlobClient.uploadStream(stream,
                uploadOptions.bufferSize, uploadOptions.maxBuffers, { blobHTTPHeaders: { blobContentType: "audio/mpeg" } }).then(res => {
                console.log("Insert succesfully...");
            }).catch(err => {
                console.log('error -', { message: err.message });

            });
            return res.status(200).send(result);
        }).catch(err => {
            console.log("error occured -", err)
            return res.status(500).send(err);
        }).finally(() => {
            db.disconnect();
        });
    });

    app.get('/getSpeechFile', async(req, res, next) => {

        const { phrase } = req.query;
        if (!key || !region || !phrase) res.status(404).send('Invalid query string');

        const filePath = await textToSpeechConfig(key, region, phrase);
        console.log("result ==>", filePath);
        var stat = fs.statSync(filePath);
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });
        var readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });

    app.get('/play', async(req, res, next) => {
        const { phrase } = req.query;
        if (!key || !region || !phrase) res.status(404).send('Invalid query string');
        const audiofileUrl = `https://${storageName}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${phrase}.mp3`;
        console.log("play..");
        res.status(200).send({ 'fileurl': audiofileUrl });

    });


    app.get('/getAllNames', async(req, res, next) => {

        db.connect();
        db.getUsers().then((result) => {
            const names = [];
            var rows = result.rows;
            // console.log(rows);
            rows.forEach(row => {
                names.push(row.name);
            });
            console.log("leng=", rows.length);
            return res.status(200).send({ 'names': names });

        }).catch(err => {
            return res.status(500).send(err);
        }).finally(() => {
            db.disconnect();
        });
    });

    app.get('/deleteUser', async(req, res, next) => {
        const { phrase } = req.query;
        db.connect();
        db.deleteUser(phrase).then((result) => {
            console.log(result);
            return res.status(200).send(result);
        }).catch(err => {
            return res.status(500).send(err);
        }).finally(() => {
            db.disconnect();
        });
    });


    app.get('/getNames', async(req, res, next) => {

        db.connect();
        db.getUsers().then((result) => {
            const names = [];
            var rows = result.rows;
            /* console.log(rows);
             rows.forEach(row => {
                 names.push(row.name);
             });
             console.log("leng=", rows.length);
             return res.status(200).send({ 'names': names });*/
            return res.status(200).send(rows);
        }).catch(err => {
            return res.status(500).send(err);
        }).finally(() => {
            db.disconnect();
        });
    });


    // Catch errors
    app.use(utils.logErrors);
    app.use(utils.clientError404Handler);
    app.use(utils.clientError500Handler);
    app.use(utils.errorHandler);

    return app;
};

module.exports = {
    create
};