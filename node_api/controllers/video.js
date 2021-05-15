const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const asyncBusboy = require('async-busboy');
// import asyncBusboy from 'async-busboy'

const fs = require("fs");
/*var express = require("express");
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'upload/'})*/

const GET_SCHEME = Joi.object({
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    // muse_ID:Joi.number().integer().required(),
    // user_ID:Joi.number().integer().required(),
    // video_Url:Joi.string().required(),
    // video_IfShow:Joi.boolean().required(),
    // video_Name:Joi.string().max(50).required(),
    // video_Time:Joi.date().required(),
    // video_Description:Joi.string().required(),
})
const DELETE_SCHEME = Joi.object({
    video_ID:Joi.number().integer().required(),
})

const PUT_SCHEME = Joi.object({
    video_ID:Joi.number().integer().required(),
    video_IfShow:Joi.bool().required(),
})




module.exports = {
    'GET /api/video': async (ctx, next) => {
        var query =Url.parse(ctx.request.url,true,true).query;
        var {value,error}=GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {pageIndex,pageSize}=value;

        const get_num_sql = `select count(*) from \`review video table\``;
        var [num_rows] = await Pool.query(get_num_sql);
        const get_sql = `select * from \`review video table\` where video_IfShow='0' limit ? offset ?`;
        var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },
    // 'POST /api/video': async (ctx, next) => {
    //
    //     const  {files,fields} = await asyncBusboy(ctx.req);
    //     console.log(files,fields);
    //     router.post('/upload', upload.single('file'), function(req, res, next){
    //         console.log(req);
    //         res.send({ret_code: '0'});
    //     });
    //
    //     // var {value,error} = POST_SCHEME.validate(ctx.request.body);
    //     // if(Joi.isError(error)){
    //     //     throw new APIError("参数错误",error.message);
    //     // }
    //     // const insert_sql = `insert into \`review video table\` SET ?`;
    //     // await Pool.query(insert_sql,value);
    //     // ctx.rest({
    //     //     code:"success",
    //     //     info:"success",
    //     // })
    //     ctx.rest({a:1})
    //
    //
    // },
    'DELETE /api/video': async (ctx, next) => {

        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {video_ID} = value;
        await Pool.query(`delete from \`review video table\` where video_ID=?`,[video_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })

    },

    'PUT /api/video': async (ctx, next) => {
        const {value,error} = PUT_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {video_IfShow,video_ID} = value;
        const put_sql = `update \`review video table\` set video_IfShow=? where video_ID=?`;
        await Pool.query(put_sql,[video_IfShow,video_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        });
    }
};