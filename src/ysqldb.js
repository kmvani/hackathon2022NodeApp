//const { pg } = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');
//const { ClientRequest } = require('http');
//const createPool = require('@databases/pg');
const { sql } = require('@databases/pg');
const { Pool } = require('pg');

const config = {
    host: 'us-east-1.cf97a208-b831-4a6a-a877-0d43dbc1837b.aws.ybdb.io',
    port: '5433',
    database: 'yugabyte',
    user: 'admin',
    password: 'Welcome2yugabyte',
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('C:/vani/root.crt').toString()
    },
    //connectionTimeoutMillis: 25000
};

var url = "postgresql://admin:Welcome2yugabyte@us-east-1.cf97a208-b831-4a6a-a877-0d43dbc1837b.aws.ybdb.io:5433/yugabyte?ssl=true&sslmode=verify-full&sslrootcert=./root.crt";


var client;


exports.connect = function(app) {
    console.log('>>>> Connecting to YugabyteDB!');

    try {
        // const db = createPool(url);
        //db.connect();
        // client = new pg.Client(config);
        client = new Pool(config)
        client.connect();


        console.log('>>>> Connected to YugabyteDB!');
    } catch (err) {
        console.log("Failed to connect db");

    }

};

exports.disconnect = function() {

    client.end();
    console.log("Db disconnected ..!!")
};

exports.insert = function(name, data) {
    try {
        stmt = `INSERT INTO users (name,content) VALUES
            ('` + name + `','` + data + `')`;

        client.query(stmt);

        console.log('>>>> Successfully inserted users audio.');
    } catch (err) {
        console.log("Inserting failed ..!! ", err);
    }

};

exports.getUsers = function() {
    console.log('>>>> get all users:');

    try {
        const result = await client.query('SELECT name, content FROM users');
        console.log("result=", result);
        /* var row;

         for (i = 0; i < res.rows.length; i++) {
             row = res.rows[i];

             console.log('name = %s ',
                 row.name);
         }*/


    } catch (err) {
        console.log("failed to get data from db ..!! ", err);
    }
};

async function connect() {
    console.log('>>>> Connecting to YugabyteDB!');

    try {
        client = new pg.Pool(config);

        await client.connect();

        console.log('>>>> Connected to YugabyteDB!');

        //callbackHadler();
    } catch (err) {
        console.log("Failed to connect db");
        //callbackHadler(err);
    }
}


async function insert(name, data) {
    try {
        stmt = `INSERT INTO users VALUES
            ('` + name + `','` + data + `')`;

        await client.query(stmt);

        console.log('>>>> Successfully inserted users audio.');

        // callbackHadler();
    } catch (err) {
        console.log("Inserting failed ..!! ", err);
        //callbackHadler(err);
    }
}

async function getUsers(callbackHadler) {
    console.log('>>>> get users:');

    try {
        const res = client.query('SELECT name, content FROM users');
        var row;

        for (i = 0; i < res.rows.length; i++) {
            row = res.rows[i];

            console.log('name = %s ',
                row.name);
        }

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}