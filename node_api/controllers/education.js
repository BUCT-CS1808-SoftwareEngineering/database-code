const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");


const POST_SCHEME = Joi.object({
    muse_Name:Joi.string().max(50).required(),
    act_Name:Joi.string().max(50).required(),
    act_Content:Joi.string().required(),
    act_Time:Joi.string().max(20).required(),
    act_Pic:Joi.string().required(),
    act_Url:Joi.string().uri().required(),
})
module.exports = {
    'GET /api/education': async (ctx, next) => {
        ctx.rest();
    },
    'POST /api/education': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const {muse_Name} = value;

        const [row] = await Pool.execute(`select muse_ID from \`museum info table\` where muse_Name=?`,[muse_Name]);
        //若museum info table里暂无此博物馆则存入缓存。
        if(row.length === 0 ){
            MuseNameCache.put(value,"education act table");
            ctx.rest({
                code:"waiting",
                info:"waiting",
            })
            return ;
        }
        delete value.muse_Name;
        const muse_ID = row[0].muse_ID;
        const query_string = `insert into 
                            \`education act table\` 
                            SET ?`;
        await Pool.query(query_string,{muse_ID:muse_ID,...value});
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/education': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/education': async (ctx, next) => {
        ctx.rest();
    }
};