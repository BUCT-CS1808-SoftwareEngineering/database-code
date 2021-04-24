const APIError = require('../rest').APIError;
const pool = require("../config");

module.exports = {
    'GET /api/user': async (ctx, next) => {
        const [rows,fields] = await pool.execute(`selet * from \`user table\``);
        ctx.rest({...rows});
    },

    'POST /api/user': async (ctx, next) => {
        ctx.rest();
    },
    'DELETE /api/user': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/user': async (ctx, next) => {
        ctx.rest();
    }
};