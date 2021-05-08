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
    exhib_Name:Joi.string().max(50).required(),
    exhib_Content:Joi.string().required(),
    exhib_Pic:Joi.string().required(),
})
const DELETE_SCHEME = Joi.object({
    exhib_ID:Joi.number().integer().required(),
})
module.exports = {
    'GET /api/exhibition': async (ctx, next) => {
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,pageIndex,pageSize} = value;
        if(typeof muse_ID == "undefined"){
            const get_sql = `select * from \`exhibition info table\` limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        }
        else{
            const get_sql = `select * from \`exhibition info table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        ctx.rest({
            code:"success",
            info:result,
        });
    },
    'GET /api/exhibition/num':async (ctx,next)=>{
        const get_num_sql = `select count(*) from \`exhibition info table\``;
        var [result,fields,err] = await Pool.query(get_num_sql);
        ctx.rest({
            code:"success",
            info:Object.values(result[0])[0],
        });
        
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
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {exhib_ID} = value;
        await Pool.query(`delete from \`exhibition info table\` where exhib_ID=?`,[exhib_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
    'PUT /api/exhibition': async (ctx, next) => {
        ctx.rest();
    }
};