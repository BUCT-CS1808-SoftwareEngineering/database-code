const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");


const POST_SCHEME = Joi.object({
    // news_ID:Joi.number().required(),
    // muse_ID:Joi.number().required(),
    muse_Name:Joi.string().max(50).required(),
    news_Name:Joi.string().max(255).required(),
    news_Content:Joi.string().required(),
    news_type:Joi.number().required(),
    news_time:Joi.date().required(),
    news_source:Joi.string().max(20).required(),
})
module.exports = {
    'GET /api/museum/news': async (ctx, next) => {
        ctx.rest();
    },
    'POST /api/museum/news': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);

        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const {muse_Name,news_Name,news_Content,news_type,news_time,news_source} = value;

        const [row] = await Pool.execute(`select muse_ID from \`museum info table\` where muse_Name=?`,[muse_Name]);
        //若museum info table里暂无此博物馆则存入缓存。
        if(row.length === 0 ){
            MuseNameCache.put(value);
            ctx.rest({
                code:"waiting",
                info:"waiting",
            })
            return ;
        }


        const muse_ID = row[0].muse_ID;
        const query_string = `insert into 
                            \`news info table\` 
                            (muse_ID,news_Name,news_Content,news_type,news_time,news_source) values 
                            (?,?,?,?,?,?)`;
        await Pool.execute(query_string,[muse_ID,news_Name,news_Content,news_type,news_time,news_source]);
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/museum/news': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/museum/news': async (ctx, next) => {
        ctx.rest();
    }
};