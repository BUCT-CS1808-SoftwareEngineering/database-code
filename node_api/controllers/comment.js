const APIError = require('../rest').APIError;
const pool = require("../config");
const Url =require("url");
const Joi = require("joi");


const GET_SCHEME = Joi.object({
    user_ID:Joi.number().required(),
})
const POST_SCHEME = Joi.object({
    user_ID:Joi.number().required(),
    muse_ID:Joi.number().required(),
    com_Info:Joi.string().required(),
    com_Time:Joi.date().required(),
    com_IfShow:Joi.boolean().required()
})
const PUT_SCHEME = Joi.object({
    com_ID:Joi.number().required(),
    com_IfShow:Joi.bool().required(),
})

module.exports = {
    'GET /api/comment': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const get_sql = `select * from \`comment table\` where user_ID=?`;
        var [result,err] = await pool.execute(get_sql,[value.user_ID]);
        ctx.rest({
            code:"success",
            info:result,
        });
    },

    'POST /api/comment': async (ctx, next) => {
        var {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const insert_sql = `insert into \`comment table\` SET ?`;
        var [result,err] = await pool.query(insert_sql,value);
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/comment': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/comment': async (ctx, next) => {
        var {value,error} = PUT_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }

        const {com_ID,com_IfShow} = value;
        const udpate_sql = `update \`comment table\` set com_IfShow=? where com_ID=?`;
        var [result,err] = await pool.execute(udpate_sql,[com_IfShow,com_ID]);
        ctx.rest({
            code:"success",
            info:"success"
        });
    }
};