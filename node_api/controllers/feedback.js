const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");


const POST_SCHEME = Joi.object({
    muse_ID:Joi.number().required(),
    user_ID:Joi.number().required(),
    env_Review:Joi.number().required(),
    exhibt_Review:Joi.number().required(),
    service_Review:Joi.number().required(),
})
module.exports = {
    'GET /api/feedback': async (ctx, next) => {
        ctx.rest();
    },
    'GET /api/feedback/num':async (ctx,next)=>{
        const get_num_sql = `select count(*) from \`feedback table\``;
        var [result,fields,err] = await Pool.query(get_num_sql);
        if(!err){
            ctx.rest({
                code:"success",
                info:Object.values(result[0])[0],
            });
        }
        else{
            ctx.rest({
                code:"fail",
                info:"fail",
            });
        }
    },
    'POST /api/feedback': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
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