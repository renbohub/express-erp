require('dotenv/config')

const knex = require('knex').knex({
    client: 'mysql2',
    connection:{
        host: process.env.DB_HOST,
        port : 3306,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE,
        timezone: '+00:00'
    }
});

module.exports = knex