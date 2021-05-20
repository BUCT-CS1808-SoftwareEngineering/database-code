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
    env_Review:Joi.number().integer().max(5).required(),
    exhibt_Review:Joi.number().integer().max(5).required(),
    service_Review:Joi.number().integer().max(5).required(),
})
const DELETE_SCHEME = Joi.object({
    fdback_ID:Joi.number().integer().required(),
})
const PUT_SCHEME = Joi.object({
    fdback_ID:Joi.number().integer().required(),
    env_Review:Joi.number().integer().required(),
    exhibt_Review:Joi.number().integer().required(),
    service_Review:Joi.number().integer().required(),
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
            const get_num_sql = `select count(*) from \`feedback table\``;
            var [num_rows] = await Pool.query(get_num_sql);
            const get_sql = `select * from \`feedback table\` limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else if(typeof muse_ID == "undefined" && typeof user_ID != "undefined"){
            const get_num_sql = `select count(*) from \`feedback table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`feedback table\` where user_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[user_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else if(typeof muse_ID != "undefined" && typeof user_ID == "undefined"){
            const get_num_sql = `select count(*) from \`feedback table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`feedback table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_num_sql = `select count(*) from \`feedback table\` where muse_ID=? and user_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID,user_ID]);
            const get_sql = `select * from \`feedback table\` where muse_ID=? and user_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,user_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },
    'GET /api/feedback/average': async (ctx,next)=>{
        var query = Url.parse(ctx.request.url,true,true).query;
        var {muse_ID} = query;
        const count_sql = `select avg(env_Review) as "env_Review",avg(exhibt_Review) as "exhibt_Review",avg(service_Review) as "service_Review" from \`feedback table\` where muse_ID=?`;
        var [result] = await Pool.query(count_sql,[muse_ID]);
        ctx.rest({
            code:"success",
            info:result[0],
        })
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
        const {value,error} = PUT_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {fdback_ID} = value;
        const put_sql = `update \`feedback table\` set ? where fdback_ID=?`;
        await Pool.query(put_sql,[value,fdback_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        });
    }
};