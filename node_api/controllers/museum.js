// const APIError = require("../rest").APIError;
// const Url = require("url");
// const Joi = require("joi");
// const Pool = require("../config");
// const MuseNameCache = require("../museum_cache");

// const GET_SCHEME = Joi.object({
//     muse_ID:Joi.number().integer(),
//     muse_Name:Joi.string().max(50),
//     pageIndex:Joi.number().integer().required(),
//     pageSize:Joi.number().integer().required()
// })
// const POST_SCHEME = Joi.object({
//     muse_Name:Joi.string().max(50).required(),
//     muse_Intro:Joi.string().required(),
//     muse_Location:Joi.number().less(10000000000).precision(6).required(),
//     muse_Address:Joi.string().max(100).required(),
//     muse_Opentime:Joi.string().max(50).required(),
//     muse_price:Joi.string().max(10).required(),
//     muse_class:Joi.string().max(50).required(),
//     muse_Ename:Joi.string().max(50).required(),
// })
// const DELETE_SCHEME = Joi.object({
//     muse_ID:Joi.number().integer().required(),
// })
// /**
//  * 用于模糊搜索，根据前端传来的中文字符串得出正则表达式。
//  */
// const getRegexpFromChinese = (museum_name)=>  museum_name.trim().split("").join("?");
// // const getRegexpFromChinese = (museum_name)=>   `%${museum_name}%`;
// //query.museum_name = new RegExp(req.query.museum_name);
// // console.log(museum_name);

// // select * from 数据库表名 where 字段名 like ' %" + req.query.字段名 + " %'；

// module.exports = {
//     'GET /api/museum/info': async (ctx, next) => {
//         var query = Url.parse(ctx.request.url,true,true).query;
//         var {value,error} = GET_SCHEME.validate(query);
//         if(Joi.isError(error)){
//             throw new APIError("参数错误",error.message);
//         }
//         var {muse_ID,muse_Name,pageIndex,pageSize} = value;
//         if(typeof muse_ID != "undefined"){//有
//             const get_num_sql = `select count(*) from \`museum info table\` where muse_ID=?`;
//             var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
//             const get_sql = `select * from \`museum info table\` where muse_ID=? limit ? offset ?`;
//             var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
            
//         }
//         else if(typeof muse_Name != "undefined"){
//             const sql_regexp = getRegexpFromChinese(muse_Name);
//             const get_num_sql = `select count(*) from \`museum info table\` where muse_Name regexp ?`;
//             var [num_rows] = await Pool.query(get_num_sql,[sql_regexp]);
//             const get_sql = `select * from \`museum info table\` where muse_Name regexp ? limit ? offset ?`;
//             var [result] = await Pool.query(get_sql,[sql_regexp,pageSize,(pageIndex-1)*pageSize]);
//         }
//         else{
//             const get_num_sql = `select count(*) from \`museum info table\``;
//             var [num_rows] = await Pool.query(get_num_sql);
//            // const get_sql = `select muse.* from \`museum info table\`muse,\`feedback table\`fed where muse.muse_ID=fed.muse_ID order by (avg(fed.env_Review) +avg(fed.exhibt_Review) +avg(fed.service_Review)) desc limit ? offset ? `;
//             const get_sort_sql= ` select \`museum info table\`.* from \`museum info table\`, \`feedback table\` where \`museum info table\`.muse_ID=\`feedback table\`.muse_ID order by (env_Review +exhibt_Review +service_Review) DESC limit ? offset ?`
//            var [result] = await Pool.query(get_sort_sql,[pageSize,(pageIndex-1)*pageSize]);
//           //var [result] = await Pool.query(get_sort_sql);
//         }
        
//         ctx.rest({
//             code:"success",
//             info:{
//                 num:Object.values(num_rows[0])[0],
//                 items:result,
//                 //items:Object.values(Muse_ID[0])[0],
//             },
//         });
//     },
//     'POST /api/museum/info': async (ctx, next) => {
//         var {value,error} = POST_SCHEME.validate(ctx.request.body);

//         if(Joi.isError(error)){
//             throw new APIError("参数错误",error.message);
//         }
//         const insert_sql = `insert into \`museum info table\` SET ?`;
//         const [row] = await Pool.query(insert_sql,value);
//         // 再解决缓存中的muse_Name匹配,插入news info table表
//         let {muse_Name} = value;
//         let waiting_array = MuseNameCache.get(muse_Name)
//         if(waiting_array != undefined){
//             waiting_array.forEach(async element =>{
//                 await Pool.query(`insert into \`${element.table}\` SET ?`,{muse_ID:row.insertId,...element.query});
//             });
//         }
//         ctx.rest({
//             code:"success",
//             info:"success",
//         });
//     },
//     'DELETE /api/museum/info': async (ctx, next) => {
//         var {value,error} = DELETE_SCHEME.validate(ctx.request.body);
//         if(Joi.isError(error)){
//             throw new APIError("参数错误",error.message);
//         }
//         var {muse_ID} = value;
//         await Pool.query(`delete from \`museum info table\` where muse_ID=?`,[muse_ID]);
//         ctx.rest({
//             code:"success",
//             info:"success",
//         })
//     },
//     'PUT /api/museum/info': async (ctx, next) => {
//         ctx.rest();
//     }
// };
const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const MuseNameCache = require("../museum_cache");

const GET_SCHEME = Joi.object({
    muse_ID:Joi.number().integer(),
    muse_Name:Joi.string().max(50),
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
/**
 * 用于模糊搜索，根据前端传来的中文字符串得出正则表达式。
 */
const getRegexpFromChinese = (museum_name)=>  museum_name.trim().split("").join("?");


module.exports = {
    'GET /api/museum/info': async (ctx, next) => {//只看有评分的博物馆
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,muse_Name,pageIndex,pageSize} = value;
        if(typeof muse_ID != "undefined"){//用ID查，只有一条数据，所以不加排序
            const get_num_sql = `select count(*) from \`museum info table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`museum info table\` where muse_ID=? limit ? offset ?`;
            var [sortresult] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else if(typeof muse_Name != "undefined"){ //因为有模糊查询，所以要加排序
            const sql_regexp = getRegexpFromChinese(muse_Name);
            const get_num_sql = `select count(*) from \`feedback table\` fed,\`museum info table\` mus where muse_Name regexp ? and fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC`;
            var [num_rows] = await Pool.query(get_num_sql,[sql_regexp]);
            const get_sql = `select mus.* from \`feedback table\` fed,\`museum info table\` mus where muse_Name regexp ? and fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?`;
            var [sortresult] = await Pool.query(get_sql,[sql_regexp,pageSize,(pageIndex-1)*pageSize]);
           
        }
        else{
            // const get_num_sql = `select count(*) from \`museum info table\``;
            // var [num_rows] = await Pool.query(get_num_sql);
            const get_num_sql = `select count(*) from \`feedback table\``;
            var [num_rows] = await Pool.query(get_num_sql);
            // const get_sql = `select * from \`museum info table\` limit ? offset ?`;
            // var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
            const get_sort_sql = `select mus.* from \`feedback table\` fed,\`museum info table\` mus where fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?`;
            var [sortresult] = await Pool.query(get_sort_sql,[pageSize,(pageIndex-1)*pageSize]);

            // const get_zero_sql = `select muse_ID from  \`feedback table\`fed  group by muse_ID where (env_Review=? and service_Review=? and exhibt_Review=?)`;
            // var [zeroresult] = await Pool.query(get_zero_sql,["undefined","undefined","undefined"]);
            
            // const get_zero_sql = `select mus.muse_ID from \`feedback table\` fed,\`museum info table\` mus where fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?`;
            // var [zeroresult] = await Pool.query(get_zero_sql,[pageSize,(pageIndex-1)*pageSize]);


            // const get_sql = `select * from \`museum info table\`where muse_ID !=(select mus.muse_ID from \`feedback table\` fed,\`museum info table\` mus where fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?) limit ? offset ?`;
            // var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
            // Result=[...sortresult,...result];
            // console.log(zeroresult)
            // zeroresult.forEach(e=>console.log(e.muse_ID));
        }
        ctx.rest({
            code:"success",
            info:{
                num:Object.values(num_rows[0])[0],
                // numn:Object.values(zeroresult[0]),
                items:sortresult,
                
            },
        });
    },

    'GET /api/museum/infoAll': async (ctx, next) => {//不管有没有分，都输出
        var query = Url.parse(ctx.request.url,true,true).query;
        var {value,error} = GET_SCHEME.validate(query);
        if(Joi.isError(error)){
            throw new APIError("参数错误",error.message);
        }
        var {muse_ID,muse_Name,pageIndex,pageSize} = value;
        if(typeof muse_ID != "undefined"){
            const get_num_sql = `select count(*) from \`museum info table\` where muse_ID=?`;
            var [num_rows] = await Pool.query(get_num_sql,[muse_ID]);
            const get_sql = `select * from \`museum info table\` where muse_ID=? limit ? offset ?`;
            var [result] = await Pool.query(get_sql,[muse_ID,pageSize,(pageIndex-1)*pageSize]);
        }
        else if(typeof muse_Name != "undefined"){
            const sql_regexp = getRegexpFromChinese(muse_Name);
            const get_num_sql = `select count(*) from \`museum info table\` where muse_Name regexp ?`;
            var [num_rows] = await Pool.query(get_num_sql,[sql_regexp]);
            const get_sql = `select * from \`museum info table\` where muse_Name regexp ? limit ? offset ?`;
            var [Result] = await Pool.query(get_sql,[sql_regexp,pageSize,(pageIndex-1)*pageSize]);

            const get_sort_sql = `select fed.muse_ID from \`feedback table\` fed,\`museum info table\` mus where fed.muse_ID=mus.muse_ID and muse_Name regexp ? group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?`;
            var [sortresult] = await Pool.query(get_sort_sql,[sql_regexp,pageSize,(pageIndex-1)*pageSize]);

            result=[...sortresult,...Result];
            //因为有模糊查询，所以要加排序
        }
        else{
            const get_num_sql = `select count(*) from \`museum info table\``;
            var [num_rows] = await Pool.query(get_num_sql);
            const get_sql = `select * from \`museum info table\` limit ? offset ?`;
            var [Result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
            // const get_sort_sql = `select mus.* from \`feedback table\` fed,\`museum info table\` mus where fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?`;
            // var [sortresult] = await Pool.query(get_sort_sql,[pageSize,(pageIndex-1)*pageSize]);

            // const get_zero_sql = `select muse_ID from  \`feedback table\`fed  group by muse_ID where (env_Review=? and service_Review=? and exhibt_Review=?)`;
            // var [zeroresult] = await Pool.query(get_zero_sql,["undefined","undefined","undefined"]);
            
            const get_sort_sql = `select mus.muse_ID from \`feedback table\` fed,\`museum info table\` mus where fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?`;
            var [sortresult] = await Pool.query(get_sort_sql,[pageSize,(pageIndex-1)*pageSize]);

            // 若想让ID按顺序排序，请把以上两句换成：
                                // const get_sort_sql = `select muse_ID from \`feedback table\``;
                                // var [sortresult] = await Pool.query(get_sort_sql);

            // const get_sql = `select * from \`museum info table\`where muse_ID !=(select mus.muse_ID from \`feedback table\` fed,\`museum info table\` mus where fed.muse_ID=mus.muse_ID group by fed.muse_ID order by (avg(fed.env_Review)+avg(fed.service_Review)+avg(exhibt_Review)) DESC limit ? offset ?) limit ? offset ?`;
            // var [result] = await Pool.query(get_sql,[pageSize,(pageIndex-1)*pageSize]);
            // Result=[...sortresult,...result];
            // console.log(zeroresult)
            // zeroresult.forEach(e=>console.log(e.muse_ID));
            result=[...sortresult,...Result];
        }
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
