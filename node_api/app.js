const Koa = require('koa');

const bodyParser = require('koa-bodyparser');

const controller = require('./controller');
const multer = require('@koa/multer');

const rest = require('./rest');
const koa_static = require("koa-static");
const path = require("path");

const app = new Koa();

// log request URL:
app.use(async (ctx, next) => {
    if(ctx.request.method === "OPTIONS"){
        ctx.response.status=200;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods','PUT, POST, GET, DELETE, OPTIONS');
        ctx.set('Access-Control-ALlow-Headers','X-Requested-With, Accept, Origin, Content-Type,Authorization');
        ctx.set('Access-Control-Allow-Credentials',true);
    }
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

// 静态资源目录
app.use(koa_static('static'));
app.use(bodyParser());

app.use(rest.restify());

app.use(controller());

//  const koa_jwt = require('koa-jwt')
// const verToken = require('./public/token_verify')

// app.use(async(ctx, next)=> {
//     var token = ctx.headers.authorization;
//     if(token == undefined){
//         await next();
//     }else{
//         verToken.verToken(token).then((data)=> {
//         //这一步是为了把解析出来的用户信息存入全局state中，这样在其他任一中间价都可以获取到state中的值
//             ctx.state = {
//                 data:data
//             };
//         })
//         await next();
//     }
// })

// app.use(async(ctx, next)=>{
//     return next().catch((err) => {
//         if (401 == err.status) {
//           ctx.status = 401;
//             ctx.body = {
//                 status:401,
//                 msg:'登录过期，请重新登录'
//             }
//         } else {
//             throw err;
//         }
//     });
// });

// app.use(koa_jwt({
// 	secret: "chenqi",
// }).unless({
//     path: [/^\/users\/login/]  // 自定义哪些目录忽略 jwt 验证
//   }));
let PORT = 3000;
app.listen(PORT);
console.log(`app started at port ${PORT}...`);
