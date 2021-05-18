const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const fs = require('fs')

const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    muse_Name:Joi.string().max(50),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    muse_ID:Joi.number().integer().required(),
    user_ID:Joi.number().integer().required(),
    // video_Url:Joi.string().required(),
    // video_IfShow:Joi.boolean().required(),
    // video_Name:Joi.string().max(50).required(),
    video_Time:Joi.date().required(),
    video_Description:Joi.string().required(),
})
const DELETE_SCHEME = Joi.object({
    video_ID:Joi.number().integer().required(),
})

const PUT_SCHEME = Joi.object({
    video_ID:Joi.number().integer().required(),
    video_IfShow:Joi.bool().required(),
})
const getRegexpFromChinese = (museum_name)=>  museum_name.trim().split("").join("?");

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
        const get_sql = `select * from \`review video table\` limit ? offset ?`;
        var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },

    'GET /api/video/search': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,muse_Name,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined"){
            const get_num_sql = `select count(*) from \`review video table\``;
            var [num_rows] = await Pool.query(get_num_sql);
            const get_id_sql = `select muse_ID from \`museum info table\` where muse_Name regexp ?`;
            var [ID]= await Pool.query(get_id_sql,[getRegexpFromChinese(muse_Name)]);
            const get_sql = `select * from \`review video table\` where muse_ID=${ID[0].muse_ID} limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_num_sql = `select count(*) from \`review video table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`review video table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },

    'POST /api/video': async (ctx, next) => {

        var {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);                      //
        }
        console.log(ctx.file,ctx.request.body);
        fs.renameSync(ctx.file.path,`upload/${ctx.file.originalname}`)
        ctx.rest(ctx.file)
        var files=ctx.file
        var videourl=files.path
        var videoname=files.originalname
        const insert_sql = `insert into \`review video table\` SET user_ID=${ctx.request.body.user_ID},
                                                                   muse_ID=${ctx.request.body.muse_ID},
                                                                   video_Url='${videourl}',
                                                                   video_Name='${videoname}',
                                                                   video_Time='${ctx.request.body.video_Time}',
                                                                   video_Description='${ctx.request.body.video_Description}'`;
        await Pool.query(insert_sql);



    },


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