const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");

const GET_SCHEME = Joi.object({
    
    admin_ID:Joi.number().integer(),
    admin_Name:Joi.string().max(50).required(),
    admin_Passwd:Joi.string().max(20).required(),
    // pageIndex:Joi.number().integer().required(),
    // pageSize:Joi.number().integer().required()
})


module.exports = {
    'GET /api/backlogin': async (ctx, next) => {
       // const {value,error} = GET_SCHEME.validate(ctx.request.body);
        var query =Url.parse(ctx.request.url,true,true).query;
        var {value,error}=GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {admin_ID,admin_Name,admin_Passwd} = value;
  
        const get_num_sql = `select count(*) from \`admin table\`where admin_ID =? and admin_Name=? and admin_PassWd=?`;
        var [num_rows] = await Pool.query(get_num_sql,[admin_ID,admin_Name,admin_Passwd]);
        if(Object.values(num_rows[0])[0]!=0){
            ctx.rest({
                code:"success",
                info:"success",
            });
        }
        else{
            ctx.rest({
                code:"error",
                info:"管理员密码不匹配",
            });
        }
    },
    


    
};