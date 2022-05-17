//const { pg } = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');
const config = require('./appConfig');
const { sql } = require('@databases/pg');
const { Pool } = require('pg');



const dbconfig = {
    host: config.db_host,
    port: config.db_port,
    database: config.db_database,
    user: config.db_user,
    password: config.db_password,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(config.db_certification).toString()
    },

};

var client;


exports.connect = function() {
    console.log('>>>> Connecting to YugabyteDB!');

    try {

        client = new Pool(dbconfig);
        client.connect();
        console.log('>>>> Connected to YugabyteDB!');

    } catch (err) {
        console.log("Failed to connect db");
    }

};

exports.disconnect = function() {

    // client.end();
    console.log("Db disconnected ..!!")
};

exports.insert = (name, data) => {

    return new Promise((resolve, reject) => {
        stmt = `INSERT INTO users (name) VALUES
            ('` + name + `')`;
        client.query(stmt).then(resp => {
            console.log('>>>> Successfully inserted users audio.');
            resolve(resp);
        }).catch(err => {
            console.log('Error:: Insert Failed for -', name);
            reject(err);
        });
    });
};

exports.getUsers = () => {
    console.log('>>>> get all users:');

    return new Promise((resolve, reject) => {
        client.query('SELECT name FROM users order by name').then(resp => {
            //  console.log("getRecords Result=", resp.rows);
            resolve(resp);
        }).catch(err => {
            console.log('Error:: Failed getRecords from db ');
            resolve(err);
        });
    });
};

exports.deleteUser = (name) => {
    console.log('>>>> get all users:');

    return new Promise((resolve, reject) => {
        client.query(`Delete  FROM users where name='` + name + `'`).then(resp => {
            resolve(resp);
        }).catch(err => {
            console.log('Error:: Failed to delete ');
            resolve(err);
        });
    });
};

exports.isUserExists = (name) => {
    console.log('>>>> is user exists:', name);

    return new Promise((resolve, reject) => {
        client.query('SELECT name FROM users where UPPER(name)=`' + name.toUpperCase() + '`').then(resp => {
            //  console.log("getRecords Result=", resp.rows);
            resolve(resp);
        }).catch(err => {
            console.log('Error:: Failed getRecords from db ');
            resolve(err);
        });
    });
};

exports.getAudioByUser = (name) => {
    console.log('DB: Retrieving audio by user{}', name);

    return new Promise((resolve, reject) => {
        client.query(`SELECT content FROM users where name= '` + name + `'`).then(resp => {
            console.log("Content =", resp.rows[0].content);
            //resolve("Save data Successfully.");
            resolve(resp);
        }).catch(err => {
            console.log('Error:: Failed getAudioByUser from db -' + name);
            resolve(err);
        });
    });
};
