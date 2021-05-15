const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");

const GET_SCHEME = Joi.object({
    user_ID:Joi.number().integer(),
    user_Name:Joi.string().max(50).required(),
    user_Passwd:Joi.string().max(20).required(),
    // admin_ID:Joi.number().integer(),
    // admin_Name:Joi.string().max(50).required(),
    // admin_Passwd:Joi.string().max(20).required(),
    // pageIndex:Joi.number().integer().required(),
    // pageSize:Joi.number().integer().required()
})


module.exports = {
    'GET /api/login': async (ctx, next) => {
       // const {value,error} = GET_SCHEME.validate(ctx.request.body);
        var query =Url.parse(ctx.request.url,true,true).query;
        var {value,error}=GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {user_ID,user_Name,user_Passwd} = value;
  
        const get_num_sql = `select count(*) from \`user table\`where user_ID =? and user_Name=? and user_PassWd=?`;
        var [num_rows] = await Pool.query(get_num_sql,[user_ID,user_Name,user_Passwd]);
        if(Object.values(num_rows[0])[0]!=0){
            ctx.rest({
                code:"success",
                info:"success",
            });
        }
        else{
            ctx.rest({
                code:"error",
                info:"用户名密码不匹配",
            });
        }
    },
    


    
};