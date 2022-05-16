var PropertiesReader = require('properties-reader');
const path = require("path").resolve('application.properties');
console.log(path);
var properties = PropertiesReader(path);

let resourceKey = properties.get("azure.resourceKey");
let region = properties.get("azure.region");
let storageAccountAccessKey = properties.get("azure.storageAccountAccessKey");
let storageAccountName = properties.get("azure.storageAccountName");
let storageContainer = properties.get("azure.storageAccountContainer");


let db_host = properties.get("db.host");
let db_port = properties.get("db.port");
let db_database = properties.get("db.database");
let db_user = properties.get("db.user");
let db_password = properties.get("db.password");
let db_certification = properties.get("db.certification.path");
console.log("dbhost =>", db_host);

var config = {
    RESOURCE_KEY: resourceKey,
    REGION: region,
    AZURE_STORAGE_ACCOUNT_NAME: storageAccountName,
    AZURE_STORAGE_ACCOUNT_ACCESS_KEY: storageAccountAccessKey,
    AZURE_STORAGE_CONTAINER: storageContainer,
    db_host: db_host,
    db_port: db_port,
    db_database: db_database,
    db_user: db_user,
    db_password: db_password,
    db_certification: db_certification
}


module.exports = config;
