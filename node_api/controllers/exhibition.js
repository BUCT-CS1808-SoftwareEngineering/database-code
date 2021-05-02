const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");


const POST_SCHEME = Joi.object({
    muse_Name:Joi.string().max(50).required(),
    exhib_Name:Joi.string().max(50).required(),
    exhib_Content:Joi.string().required(),
    exhib_Pic:Joi.string().required(),
})
module.exports = {
    'GET /api/exhibition': async (ctx, next) => {
        ctx.rest();
    },
    'POST /api/exhibition': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_Name} = value;
        const [row] = await Pool.execute(`select muse_ID from \`museum info table\` where muse_Name=?`,[muse_Name]);
        //若museum info table里暂无此博物馆则存入缓存。
        if(row.length === 0 ){
            MuseNameCache.put(value,"exhibition info table");
            ctx.rest({
                code:"waiting",
                info:"waiting",
            })
            return ;
        }
        delete value.muse_Name;
        const muse_ID = row[0].muse_ID;
        const query_string = `insert into 
                            \`exhibition info table\` 
                            SET ?`;
        await Pool.query(query_string,{muse_ID:muse_ID,...value});
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/exhibition': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/exhibition': async (ctx, next) => {
        ctx.rest();
    }
};