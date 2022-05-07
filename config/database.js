require("dotenv").config();
const { Sequelize } = require("sequelize");

let DATABASE_NAME = process.env.DATABASE_NAME;
let DATABASE_USERNAME = process.env.DATABASE_USERNAME;
let DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
let DATABASE_HOST = process.env.DATABASE_HOST;
let DATABASE_DIALECT = process.env.DATABASE_DIALECT;

// Database configurations

// Option 2: Passing parameters separately (other dialects)
const sequelize = new Sequelize(
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    {
        host: DATABASE_HOST,
        dialect: DATABASE_DIALECT /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        pool: {
            max: 30,
            min: 0,
            acquire: 60000,
            idle: 5000,
        },
    }
);

try {
    sequelize.authenticate();
} catch (error) {
    console.error("Unable to connect to the database:", error);
}

module.exports = sequelize;
