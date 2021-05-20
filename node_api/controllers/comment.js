const APIError = require('../rest').APIError;
const Pool = require("../config");
const Url =require("url");
const Joi = require("joi");


const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    user_ID:Joi.number().integer(),
    com_IfShow:Joi.bool().options({
        convert:true,
    }).required(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const GET_FROM_REVIEW_SCHEME = Joi.object({
    muse_ID:Joi.number().integer().required(),
    max_review: Joi.number().integer().min(0).max(5).required(),
    min_review : Joi.number().integer().min(0).max(5).less(Joi.ref('max_review')).required(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    user_ID:Joi.number().integer().required(),
    muse_ID:Joi.number().integer().required(),
    com_Info:Joi.string().required(),
    com_Time:Joi.date().required(),
    com_IfShow:Joi.boolean().required()
})
const PUT_SCHEME = Joi.object({
    com_ID:Joi.number().required(),
    com_IfShow:Joi.bool().required(),
})
const DELETE_SCHEME = Joi.object({
    com_ID:Joi.number().integer().required(),
})
module.exports = {
    'GET /api/comment': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {com_IfShow,user_ID,muse_ID,pageIndex,pageSize} = value;
        if(com_IfShow == true){
            if(typeof muse_ID == "undefined" && typeof user_ID == "undefined"){
                const get_num_sql = `select count(*) from \`comment table\` where com_IfShow=?`;
                var [num_rows] = await Pool.query(get_num_sql,[com_IfShow]);
                const get_sql = `select * from \`comment table\` where com_IfShow=? limit ? offset ?`;
                var [result] = await Pool.query(get_sql,[com_IfShow,pageSize,(pageIndex-1)*pageSize]);
            }
            else if(muse_ID){
                const get_num_sql = `select count(*) from \`comment table\` where muse_ID=? and com_IfShow=?`;
                var [num_rows] = await Pool.query(get_num_sql,[muse_ID,com_IfShow]);
                const get_sql = `select * from \`comment table\` where muse_ID=? and com_IfShow=?limit ? offset ?`;
                var [result] = await Pool.query(get_sql,[muse_ID,com_IfShow,pageSize,(pageIndex-1)*pageSize]);
            }
            else{
                const get_num_sql = `select count(*) from \`comment table\` where user_ID=? and com_IfShow=?`;
                var [num_rows] = await Pool.query(get_num_sql,[user_ID,com_IfShow]);
                const get_sql = `select * from \`comment table\` where user_ID=? and com_IfShow=? limit ? offset ?`;
                var [result] = await Pool.query(get_sql,[user_ID,com_IfShow,pageSize,(pageIndex-1)*pageSize]);
            }
        }
        else{
            if(typeof muse_ID == "undefined" && typeof user_ID == "undefined"){
                const get_num_sql = `select count(*) from \`comment table\``;
                var [num_rows] = await Pool.query(get_num_sql);
                const get_sql = `select * from \`comment table\` limit ? offset ?`;
                var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
            }
            else if(muse_ID){
                const get_num_sql = `select count(*) from \`comment table\` where muse_ID=?`;
                var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
                const get_sql = `select * from \`comment table\` where muse_ID=? limit ? offset ?`;
                var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
            }
            else{
                const get_num_sql = `select count(*) from \`comment table\` where user_ID=?`;
                var [num_rows] = await Pool.query(get_num_sql,[user_ID]);
                const get_sql = `select * from \`comment table\` where user_ID=? limit ? offset ?`;
                var [result] = await Pool.query(get_sql,[user_ID,pageSize,(pageIndex-1)*pageSize]);
            }
        }
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },
    'GET /api/comment/byreview': async (ctx,next) => {
        const query = Url.parse(ctx.request.url,true,true).query;
        const {value,error} = GET_FROM_REVIEW_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const {muse_ID,min_review,max_review,pageIndex,pageSize} = value;
        const get_sql = ` select * from \`comment table\` as ct where ct.muse_ID=? and ct.user_ID in (select rt.user_ID from (select ft.muse_ID,ft.user_ID,avg(env_Review+exhibt_Review+service_Review) as avg from \`feedback table\` as ft where ft.muse_ID=? group by ft.muse_ID having avg>? and avg<?) as rt) limit ? offset ?`;
        const [result] = await Pool.query(get_sql,[muse_ID,muse_ID,min_review,max_review,pageSize,(pageIndex-1)*pageSize]);
        ctx.rest({
            code: "success",
            info:{
                num: result.length,
                items: result,
            }
        })
    },
    'POST /api/comment': async (ctx, next) => {
        var {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const insert_sql = `insert into \`comment table\` SET ?`;
        await Pool.query(insert_sql,value);
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/comment': async (ctx, next) => {
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {com_ID} = value;
        await Pool.query(`delete from \`comment table\` where com_ID=?`,[com_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
    'PUT /api/comment': async (ctx, next) => {
        var {value,error} = PUT_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {com_IfShow,com_ID} = value;
        const udpate_sql = `update \`comment table\` set com_IfShow=? where com_ID=?`;
        await Pool.execute(udpate_sql,[com_IfShow,com_ID]);
        ctx.rest({
            code:"success",
            info:"success"
        });
    }
};