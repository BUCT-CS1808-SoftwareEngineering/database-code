const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const jwt = require('jsonwebtoken');
const util = require('util')
const verify = util.promisify(jwt.verify) 
const setToken = require('../public/token_verify');

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


const POST_SCHEME = Joi.object({
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
  
        const get_num_sql = `select count(*) from \`user table\`where user_ID =? and user_Name=? and user_Passwd=?`;
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
    
    'POST /api/login' :async (ctx,next) =>{
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        var {user_ID,user_Name,user_Passwd} = value ;
        const get_num_sql = `select count(*) from \`user table\`where user_ID =? and user_Name=? and user_Passwd=?`;
        var [num_rows] = await Pool.query(get_num_sql,[user_ID,user_Name,user_Passwd]);
        const get_Avatar_sql= `select user_Avatar from \`user table\`where user_ID =?`;
        var [avatar]=await Pool.query(get_Avatar_sql,[user_ID]);
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
                name: user_Name,
                id:user_ID,
                picture:Object.values(avatar[0])[0]
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
    'GET /api/login/info': async (ctx) => {
        const token = ctx.header.authorization  
        let payload
        if (token) {
            payload = await jwt.verify(token.split(' ')[1], "chenqi") 
            ctx.body = {
                payload

            }
        } else {
            ctx.body = {
                message: 'token error',
                code: -1
            }
        }
    }
    
};