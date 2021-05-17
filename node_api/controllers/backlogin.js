const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const jwt = require('jsonwebtoken');
const util = require('util')
const verify = util.promisify(jwt.verify) 
// const setToken = require('../public/token_verify')
const GET_SCHEME = Joi.object({
    
   // admin_ID:Joi.number().integer(),
    admin_Name:Joi.string().max(50).required(),
    admin_Passwd:Joi.string().max(20).required(),
    // pageIndex:Joi.number().integer().required(),
    // pageSize:Joi.number().integer().required()
})
const POST_SCHEME = Joi.object({
    
   // admin_ID:Joi.number().integer(),
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
        // var {admin_ID,admin_Name,admin_Passwd} = value;
        var {admin_Name,admin_Passwd} = value;
  
        // const get_num_sql = `select count(*) from \`admin table\`where admin_ID =? and admin_Name=? and admin_Passwd=?`;
        const get_num_sql = `select count(*) from \`admin table\`where admin_Name=? and admin_Passwd=?`;
        var [num_rows] = await Pool.query(get_num_sql,[admin_Name,admin_Passwd]);
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
    'POST /api/backlogin' :async (ctx,next) =>{
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        var {admin_Name,admin_Passwd} = value ;
        const get_num_sql = `select count(*) from \`admin table\`where admin_Name=? and admin_Passwd=?`;
        var [num_rows] = await Pool.query(get_num_sql,[admin_Name,admin_Passwd]);
        // const get_Avatar_sql= `select admin_Avatar from \`admin table\`where admin_ID =?`;
        // var [avatar]=await Pool.query(get_Avatar_sql,[admin_ID]);
        
        const get_ID_sql= `select admin_ID from \`admin table\`where admin_Name =?`;
        var  [admin_ID]=await Pool.query(get_ID_sql,[admin_Name]);
        
        if(Object.values(num_rows[0])[0]!=0){
            // ctx.rest({
            //     code:"success",
            //     info:"success",
            // });
            // setToken.setToken(user_Name, user_Passwd).then((data)=>{
            //     ctx.body = {
            //         msg:'登录成功',
            //         token:data
            //     }
            // })
            // await next();
            let userToken = {
                name: admin_Name,
                id:Object.values(admin_ID[0])[0],
               // picture:Object.values(avatar[0])[0]//(admin没有头像！！！！！)
            }
            const token = jwt.sign(userToken, "chenqi", {expiresIn: '0.5h'})
            ctx.body = {
                message: '获取token成功',
                code: 1,
                token
            }
        }
        // else{
        //     ctx.rest({
        //         code:"error",
        //         info:"用户名密码不匹配",
        //     });
        // }
        else {
            ctx.body = {
                message: '参数错误',
                code: -1
            }
        }

    },
    'GET /api/backlogin/info': async (ctx) => {
        const token = ctx.header.authorization  
        let payload
        if (token) {
            payload = await jwt.verify(token.split(' ')[1], "chenqi") 
            ctx.rest({
                code:"success",
                info:payload,
            });
            // ctx.body = {
            //     payload

            // }
        } else {
            ctx.body = {
                message: 'token error',
                code: -1
            }
        }
    }

   


    
};