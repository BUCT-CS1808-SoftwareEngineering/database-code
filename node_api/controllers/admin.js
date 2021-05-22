
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
const PUT_SCHEME = Joi.object({
    admin_ID:Joi.number().integer().required(),
    admin_Name:Joi.string().max(50).required(),
    admin_Passwd:Joi.string().max(20).required(),
});
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
        num_rows = typeof num_rows=="undefined"?0:Object.values(num_rows[0])[0];
        ctx.rest({
            code:"success",
            info:{
                num:num_rows,
                items:result,
            },
        });
    },

    'POST /api/admin': async (ctx, next) => {
        const {value,error} = POST_SCHEME.validate(ctx.request.body);
        var {admin_Name} = value;
        const get_ifnew_sql = `select count(*) from \`admin table\`where admin_Name=? `;
        var [num_rows] = await Pool.query(get_ifnew_sql,[admin_Name]);

        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        if(Object.values(num_rows[0])[0]==0){
            const query_string = `insert into 
                            \`admin table\` 
                            set ?`;
        await Pool.query(query_string,{...value});
        }
        else{
            throw new APIError("参数错误","用户名重复");
        }
        

        

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
    'PUT /api/admin': async (ctx, next) => {
        var {value,error} = PUT_SCHEME.validate(ctx.request.body);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {admin_ID,admin_Name,admin_Passwd} = value;
        const udpate_sql = `update \`admin table\` set admin_Name= ?, admin_Passwd = ? where admin_ID=?`;
        await Pool.execute(udpate_sql,[admin_Name,admin_Passwd,admin_ID]);
        ctx.rest({
            code:"success",
            info:"success"
        });
    }


    
};