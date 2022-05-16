// azure-cognitiveservices-speech.js

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { Buffer, Blob } = require('buffer');
const { PassThrough } = require('stream');
const fs = require('fs');
const { resolve } = require('path');
const db = require("./dbconfig");
const bytea = require('postgres-bytea');
const { BaseAudioPlayer } = require('microsoft-cognitiveservices-speech-sdk');

const textToSpeech = async(key, region, text, file) => {

    // convert callback function to promise
    return new Promise((resolve, reject) => {

        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3
        let audioConfig = null;
        let filename = './audiofiles/' + text + '.mp3';

        if (file) {
            console.log("textToSpeech file created =", filename);
            audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
        }

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
            text,
            result => {

                const { audioData } = result;
                if (file) {

                    // return stream from file
                    const audioFile = fs.createReadStream(filename);
                    resolve(audioFile);

                } else {

                    // return stream from memory
                    const bufferStream = new PassThrough();
                    bufferStream.end(Buffer.from(audioData));
                    resolve(bufferStream);
                }
            },
            error => {
                synthesizer.close();
                reject(error);
            });
    });
};

const textToSpeechConfig = (key, region, text) => {

    // convert callback function to promise
    return new Promise((resolve, reject) => {

        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3
        let audioConfig = null;
        let filename = './audiofiles/' + text + '.mp3';
        audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
            text,
            result => {

                const audioFile = fs.createReadStream(filename);
                // const blob = new Blob([audioFile]);
                /* const blob = new Blob([audioFile], {
                     type: "audio/mpeg"
                 });*/
                console.log("audioFile =", filename);
                resolve(filename);
            },
            error => {
                synthesizer.close();
                reject(error);
            });
    });
};



module.exports = {
    textToSpeech,
    textToSpeechConfig
};