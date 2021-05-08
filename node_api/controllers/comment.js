const APIError = require('../rest').APIError;
const Pool = require("../config");
const Url =require("url");
const Joi = require("joi");


const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    user_ID:Joi.number().integer(),
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
        var {user_ID,muse_ID,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined" && typeof user_ID == "undefined"){
            const get_sql = `select * from \`comment table\` limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else if(muse_ID){
            const get_sql = `select * from \`comment table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else if(user_ID){
            const get_sql = `select * from \`comment table\` where user_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[user_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_sql = `select * from \`attention table\` set ?`;
            var [result] = await Pool.query(get_sql,value);
        }
        ctx.rest({
            code:"success",
            info:result,
        });
    },
    'GET /api/comment/num':async (ctx,next)=>{
        const get_num_sql = `select count(*) from \`comment table\``;
        var [result,fields,err] = await Pool.query(get_num_sql);
        ctx.rest({
            code:"success",
            info:Object.values(result[0])[0],
        });
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