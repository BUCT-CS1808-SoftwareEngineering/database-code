const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");

const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    user_ID:Joi.number().integer(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    muse_ID:Joi.number().integer().required(),
    user_ID:Joi.number().integer().required(),
})
const DELETE_SCHEME= Joi.object({
    att_ID:Joi.number().integer().required(),
})
module.exports = {
    'GET /api/attention': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {user_ID,muse_ID,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined" && typeof user_ID == "undefined"){
            const get_sql = `select * from \`attention table\` limit ? offset ?`;
            var [result,err] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else if(muse_ID){
            const get_sql = `select user.* from \`attention table\` att,\`user table\` user where att.muse_ID=? and att.user_ID=user.user_ID limit ? offset ?`;
            var [result,err] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else if(user_ID){
            const get_sql = `select mus.* from \`attention table\` att,\`museum info table\` mus where att.user_ID=? and att.muse_ID=mus.muse_ID limit ? offset ?`;
            var [result,err] = await Pool.query(get_sql,[user_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_sql = `select * from \`attention table\` set ?`;
            var [result,err] = await Pool.query(get_sql,value);
        }
        ctx.rest({
            code:"success",
            info:result,
        });
    },
    'GET /api/attention/num':async (ctx,next)=>{
        const get_num_sql = `select count(*) from \`attention table\``;
        var [result] = await Pool.query(get_num_sql);
        ctx.rest({
            code:"success",
            info:Object.values(result[0])[0],
        });
    },
    'POST /api/attention': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const insert_string = `insert into 
                            \`attention table\` 
                            SET ?`;
        await Pool.query(insert_string,value);
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/attention': async (ctx, next) => {
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {att_ID} = value;
        await Pool.query(`delete from \`attention table\` where att_ID=?`,[att_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
};