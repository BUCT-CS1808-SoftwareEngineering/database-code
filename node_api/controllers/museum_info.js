const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");


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
    'GET /api/museum/info': async (ctx, next) => {
        ctx.rest();
    },
    'POST /api/museum/info': async (ctx, next) => {
        var {value,error} = POST_SCHEME.validate(ctx.request.body);

        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const insert_sql = `insert into \`museum info table\` SET ?`;
        const [row,err] = await Pool.query(insert_sql,value);
        // console.log(row);
        
        ctx.rest({
            code:"success",
            info:"success",
        });
        // 再解决缓存中的muse_Name匹配,插入news info table表
        let {muse_Name} = value;
        let waiting_array = MuseNameCache.get(muse_Name)
        if(waiting_array != undefined){
            waiting_array.forEach(async element =>{
                await Pool.query(`insert into \`${element.table}\` SET ?`,{muse_ID:row.insertId,...element.query});
            });
        }
    },
    'DELETE /api/museum/info': async (ctx, next) => {
        ctx.rest();
    },
    'PUT /api/museum/info': async (ctx, next) => {
        ctx.rest();
    }
};