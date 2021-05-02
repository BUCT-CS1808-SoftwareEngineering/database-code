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