const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");

const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer().required(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    muse_ID:Joi.number().required(),
    user_ID:Joi.number().required(),
})
module.exports = {
    'GET /api/attention': async (ctx, next) => {
        ctx.rest();
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
        ctx.rest();
    },
    'PUT /api/attention': async (ctx, next) => {
        ctx.rest();
    }
};