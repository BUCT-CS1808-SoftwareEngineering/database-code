
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
 
    admin_Name:Joi.string().max(50).required(),
    admin_Passwd:Joi.string().max(20).required(),
})

const DELETE_SCHEME = Joi.object({
    admin_ID:Joi.number().integer().required(),
})

module.exports = {
    'GET /api/admin': async (ctx, next) => {
        var query =Url.parse(ctx.request.url,true,true).query;
        var {value,error}=GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {pageIndex,pageSize}=value;
        const get_num_sql = `select count(*) from \`admin table\``;
        var [num_rows] = await Pool.query(get_num_sql);
        const get_sql = `select * from \`admin table\` limit ? offset ?`;
        var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                items:result,
            },
        });
    },

    'POST /api/admin': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        const query_string = `insert into 
                            \`admin table\` 
                            set ?`;
        await Pool.query(query_string,{...value});

        

        ctx.rest({
            code:"success",
            info:"success",
        });
},

    'DELETE /api/admin': async (ctx, next) => {
        var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {admin_ID} = value;
        await Pool.query(`delete from \`admin table\` where admin_ID=?`,[admin_ID]);
        ctx.rest({
            code:"success",
            info:"success",
        })
    },
    'PUT /api/user': async (ctx, next) => {
        var {value,error} = PUT_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {com_IfShow,com_ID} = value;
        const udpate_sql = `update \`comment table\` set com_IfShow=? where com_ID=?`;
        await Pool.execute(udpate_sql,[com_IfShow,com_ID]);
        ctx.rest({
            code:"success",
            info:"success"
        });
    }


    
};