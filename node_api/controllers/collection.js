const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");

const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    col_Name:Joi.string(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required(),
})
const POST_SCHEME = Joi.object({
    muse_Name:Joi.string().max(50).required(),
    col_Name:Joi.string().max(50).required(),
    col_Intro:Joi.string().required(),
    col_Photo:Joi.string().required(),
})
const DELETE_SCHEME = Joi.object({
    col_ID:Joi.number().integer().required(),
})
const PUT_SCHEME = Joi.object({
    col_ID:Joi.number().integer().required(),
    muse_Name:Joi.string().max(50).required(),
    col_Name:Joi.string().max(50).required(),
    col_Intro:Joi.string().required(),
    col_Photo:Joi.string().required(),
})
const getRegexpFromChinese = (col_Name) => col_Name.trim().split("").join("?");
module.exports = {
    'GET /api/collection': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,col_Name,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined" && typeof col_Name=="undefined"){
            const get_num_sql = `select count(*) from \`collection info table\``;
            var [num_rows] = await Pool.query(get_num_sql);
            const get_sql = `select * from \`collection info table\` limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else if (typeof muse_ID != "undefined" && typeof col_Name=="undefined"){
            const get_num_sql = `select count(*) from \`collection info table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`collection info table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else if (typeof muse_ID == "undefined" && typeof col_Name !="undefined"){
            const sql_regexp = getRegexpFromChinese(col_Name);
            const get_num_sql = `select count(*) from \`collection info table\` where col_Name regexp ?`;
            var [num_rows] = await Pool.query(get_num_sql,[sql_regexp]);
            const get_sql = `select * from \`collection info table\` where col_Name regexp ? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[sql_regexp,pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const sql_regexp = getRegexpFromChinese(col_Name);
            const get_num_sql = `select count(*) from \`collection info table\` where muse_ID = ? and col_Name regexp ?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID,sql_regexp]);
            const get_sql = `select * from \`collection info table\` where muse_ID=? and col_Name regexp ? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,sql_regexp,pageSize,(pageIndex-1)*pageSize]);
        }
        num_rows = typeof num_rows=="undefined"?0:Object.values(num_rows[0])[0];
        ctx.rest({
            code:"success",
            info:{
                num:num_rows,
                items:result,
            },
        });
    },
    'POST /api/collection': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_Name} = value;
        const [row] = await Pool.execute(`select muse_ID from \`museum info table\` where muse_Name=?`,[muse_Name]);
        //若museum info table里暂无此博物馆则存入缓存。
        if(row.length === 0 ){
            MuseNameCache.put(value,"collection info table");
            ctx.rest({
                code:"waiting",
                info:"waiting",
            })
            return ;
        }
        delete value.muse_Name;
        const muse_ID = row[0].muse_ID;
        const query_string = `insert into 
                            \`collection info table\` 
                            SET ?`;
        await Pool.query(query_string,{muse_ID:muse_ID,...value});
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/collection': async (ctx, next) => {
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {col_ID} = value;
        await Pool.query(`delete from \`collection info table\` where col_ID=?`,[col_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })

    },
    'PUT /api/collection': async (ctx, next) => {
        var {value,error} = PUT_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_Name,col_Name,col_Intro,col_Photo,col_ID} = value;
        const udpate_sql = `update \`collection info table\` set muse_Name=?,col_Name=?,col_Intro=?,col_Photo=? where col_ID=?`;
        await Pool.execute(udpate_sql,[muse_Name,col_Name,col_Intro,col_Photo,col_ID]);
        ctx.rest({
            code:"success",
            info:"success"
        });
    }
};