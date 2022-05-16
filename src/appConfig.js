var PropertiesReader = require('properties-reader');
const path = require("path").resolve(`application.properties`);
console.log(path);
var properties = PropertiesReader(path);

resourceKey = properties.get("azure.resourceKey");
region = properties.get("azure.region");
storageAccountAccessKey = properties.get("azure.storageAccountAccessKey");
storageAccountName = properties.get("azure.storageAccountName");
storageContainer = properties.get("azure.storageAccountContainer");


db_host = properties.get("db.host");
db_port = properties.get("db.port");
db_database = properties.get("db.database");
db_user = properties.get("db.user");
db_password = properties.get("db.password");
db_certification = properties.get("db.certification.path");

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