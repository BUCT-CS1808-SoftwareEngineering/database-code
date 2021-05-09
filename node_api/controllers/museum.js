const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");

const GET_SCHEME = Joi.object({
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
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
const DELETE_SCHEME = Joi.object({
    muse_ID:Joi.number().integer().required(),
})

module.exports = {
    'GET /api/museum/info': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {pageIndex,pageSize} = value;
        const get_num_sql = `select count(*) from \`museum info table\``;
        var [num_rows] = await Pool.query(get_num_sql);
        const get_sql = `select * from \`museum info table\` limit ? offset ?`;
        var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },
    'POST /api/museum/info': async (ctx, next) => {
        var {value,error} = POST_SCHEME.validate(ctx.request.body);

        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const insert_sql = `insert into \`museum info table\` SET ?`;
        const [row] = await Pool.query(insert_sql,value);
        // 再解决缓存中的muse_Name匹配,插入news info table表
        let {muse_Name} = value;
        let waiting_array = MuseNameCache.get(muse_Name)
        if(waiting_array != undefined){
            waiting_array.forEach(async element =>{
                await Pool.query(`insert into \`${element.table}\` SET ?`,{muse_ID:row.insertId,...element.query});
            });
        }
        ctx.rest({
            code:"success",
            info:"success",
        });
    },
    'DELETE /api/museum/info': async (ctx, next) => {
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID} = value;
        await Pool.query(`delete from \`museum info table\` where muse_ID=?`,[muse_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
    'PUT /api/museum/info': async (ctx, next) => {
        ctx.rest();
    }
};