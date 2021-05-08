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
    env_Review:Joi.number().integer().required(),
    exhibt_Review:Joi.number().integer().required(),
    service_Review:Joi.number().integer().required(),
})
const DELETE_SCHEME = Joi.object({
    fdback_ID:Joi.number().integer().required(),
})
module.exports = {
    'GET /api/feedback': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {user_ID,muse_ID,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined" && typeof user_ID == "undefined"){
            const get_sql = `select * from \`feedback table\` limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else if(muse_ID){
            const get_sql = `select user.* from \`feedback table\` fed,\`user table\` user where fed.muse_ID=? and fed.user_ID=user.user_ID limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else if(user_ID){
            const get_sql = `select mus.* from \`feedback table\` fed,\`museum info table\` mus where fed.user_ID=? and fed.muse_ID=mus.muse_ID limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[user_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_sql = `select * from \`feedback table\` set ?`;
            var [result] = await Pool.query(get_sql,value);
        }
        ctx.rest({
            code:"success",
            info:result,
        });
    },
    'GET /api/feedback/num':async (ctx,next)=>{
        const get_num_sql = `select count(*) from \`feedback table\``;
        var [result] = await Pool.query(get_num_sql);
        ctx.rest({
            code:"success",
            info:Object.values(result[0])[0],
        });
    },
    'POST /api/feedback': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,user_ID} = value;
        const search_sql = `select 1 from \`feedback table\` where muse_ID=? and user_ID=? limit 1`;
        var [result] = await Pool.query(search_sql,[muse_ID,user_ID]);
        if(result.length != 0){
            throw new APIError("error","已经反馈过了");
        }
        const insert_string = `insert into 
                            \`feedback table\` 
                            SET ?`;
        await Pool.query(insert_string,value);
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/feedback': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/feedback': async (ctx, next) => {
        ctx.rest();
    }
};