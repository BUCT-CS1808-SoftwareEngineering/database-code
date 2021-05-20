const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");

const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    news_ID:Joi.number().integer(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    muse_Name:Joi.string().max(50).required(),
    news_Name:Joi.string().max(255).required(),
    news_Content:Joi.string().required(),
    news_type:Joi.number().required(),
    news_time:Joi.date().required(),
    news_source:Joi.string().max(20).required(),
});
const DELETE_SCHEME = Joi.object({
    news_ID:Joi.number().integer().required(),
})
module.exports = {
    'GET /api/museum/news': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,news_ID,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined" && typeof news_ID == "undefined"){
            const get_num_sql = `select count(*) from \`news info table\``;
            var [num_rows] = await Pool.query(get_num_sql);
            const get_sql = `select * from \`news info table\` limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else if (news_ID == "undefined"){
            const get_num_sql = `select count(*) from \`news info table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`news info table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_num_sql = `select count(*) from \`news info table\` where news_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[news_ID]);
            const get_sql = `select * from \`news info table\` where news_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[news_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },
    'POST /api/museum/news': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);

        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const {muse_Name} = value;
        const [row] = await Pool.execute(`select muse_ID from \`museum info table\` where muse_Name=?`,[muse_Name]);
        //若museum info table里暂无此博物馆则存入缓存。
        if(row.length === 0 ){
            MuseNameCache.put(value,"news info table");
            ctx.rest({
                code:"waiting",
                info:"waiting",
            })
            return ;
        }
        delete value.muse_Name;
        const muse_ID = row[0].muse_ID;
        const query_string = `insert into 
                            \`news info table\` 
                            SET ?`;
        await Pool.query(query_string,{muse_ID:muse_ID,...value});
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/museum/news': async (ctx, next) => {
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {news_ID} = value;
        await Pool.query(`delete from \`news info table\` where news_ID=?`,[news_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
    'PUT /api/museum/news': async (ctx, next) => {
        ctx.rest();
    },
};