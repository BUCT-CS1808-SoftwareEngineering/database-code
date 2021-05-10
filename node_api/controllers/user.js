const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");

const GET_SCHEME = Joi.object({
  //  user_ID:Joi.number().integer(),
    pageIndex:Joi.number().integer().required(),
    pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    user_Name:Joi.string().max(50).required(),
    user_Phone:Joi.string().max(20).required(),
    user_Passwd:Joi.string().max(20).required(),
    user_Email:Joi.string().email().required()
});
const DELETE_SCHEME = Joi.object({
    user_ID:Joi.number().integer().required(),
})


module.exports = {
    'GET /api/user': async (ctx, next) => {
        var query =Url.parse(ctx.request.url,true,true).query;
        var {value,error}=GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {pageIndex,pageSize}=value;

        const get_num_sql = `select count(*) from \`user table\``;
        var [num_rows] = await Pool.query(get_num_sql);
        const get_sql = `select * from \`user table\` limit ? offset ?`;
        var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },

    'POST /api/user': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const query_string = `insert into 
                            \`user table\` 
                            set ?`;
        await Pool.query(query_string,{...value,user_Avatar:"11"});

        

        ctx.rest({
            code:"success",
            info:"success",
        });
    },

    'DELETE /api/user': async (ctx, next) => {
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {user_ID} = value;
        await Pool.query(`delete from \`user table\` where user_ID=?`,[user_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
    'PUT /api/user': async (ctx, next) => {
        ctx.rest();
    }

    
};