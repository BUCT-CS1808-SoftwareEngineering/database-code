const APIError = require("../rest").APIError;
const url = require("url")
const pool = require("../config");

module.exports = {
    'GET /api/museum': async (ctx, next) => {
        ctx.rest();
    },
    // body = {
    //     muse_Name:"",
    //     muse_Intro:"",
    //     muse_Location:"",
    //     muse_Address:"",
    //     muse_Opentime:"",
    //     muse_price:"",
    //     muse_class:"",
    //     muse_Ename:"",
    // }
    'POST /api/museum': async (ctx, next) => {
        const {muse_Name,muse_Intro,muse_Location,muse_Address,muse_Opentime,muse_price,muse_class,muse_Ename} = ctx.request.body;
        const [rows,fields] = await pool.execute(`insert into 
                                                \`museum info table\` 
                                                (muse_Name,muse_Intro,muse_Location,muse_Address,muse_Opentime,muse_price,muse_class,muse_Ename) 
                                                values 
                                                (?,?,?,?,?,?,?,?)`,
                                                [muse_Name,muse_Intro,muse_Location,muse_Address,muse_Opentime,muse_price,muse_class,muse_Ename]);
        ctx.rest({...rows});
    },
    'DELETE /api/museum': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/museum': async (ctx, next) => {
        ctx.rest();
    }
};