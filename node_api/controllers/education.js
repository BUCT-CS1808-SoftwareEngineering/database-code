const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");

const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    muse_Name:Joi.string().max(50).required(),
    act_Name:Joi.string().max(50).required(),
    act_Content:Joi.string().required(),
    act_Time:Joi.string().max(20).required(),
    act_Pic:Joi.string().required(),
    act_Url:Joi.string().uri().required(),
});
const DELETE_SCHEME = Joi.object({
    act_ID:Joi.number().integer().required(),
})
module.exports = {
    'GET /api/education': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined"){
            const get_num_sql = `select count(*) from \`education act table\``;
            var [num_rows] = await Pool.query(get_num_sql);
            const get_sql = `select * from \`education act table\` limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_num_sql = `select count(*) from \`education act table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`education act table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        num_rows = (typeof num_rows=="undefined" || num_rows.length===0)?0:Object.values(num_rows[0])[0];
        ctx.rest({
            code:"success",
            info:{
                num:num_rows,
                items:result,
            },
        });
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
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {act_ID} = value;
        await Pool.query(`delete from \`education act table\` where act_ID=?`,[act_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
    'PUT /api/education': async (ctx, next) => {
        ctx.rest();
    }
};