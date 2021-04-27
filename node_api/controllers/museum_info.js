const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");


const POST_SCHEME = Joi.object({
    muse_Name:Joi.string().max(50).required(),
    muse_Intro:Joi.string().required(),
    muse_Location:Joi.number().less(10000000000).precision(6).required(),
    muse_Address:Joi.string().max(100).required(),
    muse_Opentime:Joi.string().max(50).required(),
    muse_price:Joi.string().max(10).required(),
    muse_class:Joi.string().max(50).required(),
    muse_Ename:Joi.string().max(50).required(),
})


module.exports = {
    'GET /api/museum': async (ctx, next) => {
        ctx.rest();
    },
    'POST /api/museum': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);

        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const {muse_Name,muse_Intro,muse_Location,muse_Address,muse_Opentime,muse_price,muse_class,muse_Ename} = value;
        const query_string = `insert into 
                            \`museum info table\` 
                            (muse_Name,muse_Intro,muse_Location,muse_Address,muse_Opentime,muse_price,muse_class,muse_Ename) values 
                            (?,?,?,?,?,?,?,?)`;
        const rows = await Pool.execute(query_string,[muse_Name,muse_Intro,muse_Location,muse_Address,muse_Opentime,muse_price,muse_class,muse_Ename]);
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/museum': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/museum': async (ctx, next) => {
        ctx.rest();
    }
};