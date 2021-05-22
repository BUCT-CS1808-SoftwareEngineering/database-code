const APIError = require("../rest").APIError;
const Url = require("url");
const Joi = require("joi");
const Pool = require("../config");
const fs = require('fs')
const path = require("path")
const FFMPEGOperation = require('../ffmepeg');

const GET_SCHEME = Joi.object({
    user_ID: Joi.number().integer(),
    muse_ID: Joi.number().integer(),
    muse_Name: Joi.string().max(50),
    pageIndex: Joi.number().integer().required(),
    pageSize: Joi.number().integer().required(),
    video_ID: Joi.number().integer()

})
const POST_SCHEME = Joi.object({
    muse_ID: Joi.number().integer().required(),
    user_ID: Joi.number().integer().required(),
    // video_Url:Joi.string().required(),
    // video_IfShow:Joi.boolean().required(),
    video_Name: Joi.string().max(50).required(),
    video_Time: Joi.date().required(),
    video_Description: Joi.string().required(),
})
const DELETE_SCHEME = Joi.object({
    video_ID: Joi.number().integer().required(),
})

const PUT_SCHEME = Joi.object({
    video_ID: Joi.number().integer().required(),
    video_IfShow: Joi.bool().required(),
})
const getRegexpFromChinese = (museum_name) => museum_name.trim().split("").join("?");

module.exports = {

    'GET /api/video': async (ctx, next) => {
        var query = Url.parse(ctx.request.url, true, true).query;
        var { value, error } = GET_SCHEME.validate(query);
        if (Joi.isError(error)) {
            throw new APIError("参数错误", error.message);
        }
        var { pageIndex, pageSize, muse_Name, muse_ID, user_ID, video_ID } = value;


        const get_num_sql = `select count(*) from \`review video table\``;
        var [num_rows] = await Pool.query(get_num_sql);

        var get_sql = `select * from \`review video table\`, \`museum info table\`, \`user table\`
                  where \`museum info table\`.muse_ID = \`review video table\`.muse_ID
                  and \`review video table\`.user_ID = \`user table\`.user_ID
                  `;
        var sql_params = [];
        if (muse_ID != undefined) {
            get_sql += ` and \`museum info table\`.muse_ID = ?`
            sql_params.push(muse_ID);
        }
        if (user_ID != undefined) {
            get_sql += ` and \`user table\`.user_ID = ?`
            sql_params.push(user_ID);
        }
        if (muse_Name != undefined) {
            get_sql += ` and \`museum info table\`.muse_Name regexp ?`;
            sql_params.push(getRegexpFromChinese(muse_Name));
        }
        if (video_ID != undefined) {
            get_sql += ` and \`review video table\`.video_ID = ?`
            sql_params.push(video_ID)
        }
        get_sql += " limit ? offset ?";
        sql_params.push(pageSize)
        sql_params.push((pageIndex - 1) * pageSize)
        var [result] = await Pool.query(get_sql, sql_params);
        var filteredRes = [];
        // 因为从数据库中拿出了所有的信息，需要过滤一些不需要的信息
        for (let i = 0; i < result.length; i++) {
            let obj = {};
            filteredRes.push(obj)
            for (let key in result[i]) {
                if (['user_Passwd'].indexOf(key) != -1) {
                    continue;
                }
                obj[key] = result[i][key];
            }
        }
        num_rows = typeof num_rows == "undefined" ? 0 : Object.values(num_rows[0])[0];
        ctx.rest({
            code: "success",
            info: {
                num: num_rows,
                items: filteredRes,
            },
        });
    },

    'POST /api/video': async (ctx, next) => {

        var { error } = POST_SCHEME.validate(ctx.request.body);
        if (Joi.isError(error)) {
            throw new APIError("参数错误", error.message);                      //
        }
        let staticDir = path.join(__dirname, '../static');
        let newFileName = path.join(staticDir, `${ctx.file.path}${path.extname(ctx.file.originalname)}`);
        fs.renameSync(ctx.file.path, newFileName);
        const ffmepeg = new FFMPEGOperation();
        let duration = await ffmepeg.getVideoTotalDuration(newFileName);
        console.log(duration);
        await ffmepeg.getVideoSceenshots(newFileName, path.join(__dirname, '../static/images/'), path.basename(newFileName) + '.jpg', 1, 1);
        newFileName = '/' + `${ctx.file.path}${path.extname(ctx.file.originalname)}`.replace("\\", '/');
        const insert_sql = `insert into \`review video table\` SET user_ID=${ctx.request.body.user_ID},
                                                                   muse_ID=${ctx.request.body.muse_ID},
                                                                   video_Url='${newFileName}',
                                                                   video_Name='${ctx.request.body.video_Name}',
                                                                   video_Time='${ctx.request.body.video_Time}',
                                                                   video_Description='${ctx.request.body.video_Description}'`;
        await Pool.query(insert_sql);
        ctx.rest({
            code: 'success',
            info: {
                'path': newFileName
            }
        });

    },


    'DELETE /api/video': async (ctx, next) => {

        var { value, error } = DELETE_SCHEME.validate(ctx.request.body);
        if (Joi.isError(error)) {
            throw new APIError("参数错误", error.message);
        }
        var { video_ID } = value;
        await Pool.query(`delete from \`review video table\` where video_ID=?`, [video_ID]);
        ctx.rest({
            code: "success",
            info: "success",
        })

    },

    'PUT /api/video': async (ctx, next) => {
        const { value, error } = PUT_SCHEME.validate(ctx.request.body);
        if (Joi.isError(error)) {
            throw new APIError("参数错误", error.message);
        }
        var { video_IfShow, video_ID } = value;
        const put_sql = `update \`review video table\` set video_IfShow=? where video_ID=?`;
        await Pool.query(put_sql, [video_IfShow, video_ID]);
        ctx.rest({
            code: "success",
            info: "success",
        });
    }
};
