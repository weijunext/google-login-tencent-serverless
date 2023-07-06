const Koa = require('koa')
const KoaRouter = require('koa-router')
const path = require('path')
const fs = require('fs');
const bodyParser = require("koa-bodyparser");
const dotenv = require("dotenv");

const app = new Koa()
const router = new KoaRouter()

console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(__dirname, `.env.${env}`) });
dotenv.config({ path: path.join(__dirname, `.env`) });

app.use(bodyParser());

/* 注册路由 */
const registerRouters = path => {
  let files = fs.readdirSync(path);
  files.forEach(file_name => {
    let file_dir = path + '/' + file_name;
    let file_stat = fs.statSync(file_dir);

    if (file_stat.isDirectory()) {
      registerRouters(file_dir);
    }
    if (file_stat.isFile()) {
      let router = require(file_dir);
      for (let i = 0; i < router.stack.length; i++) {
        const path = router.stack[i].path;
        app.use(router.routes(), router.allowedMethods());
        console.log('已注册 ' + path);
      }
    }
  });
};
registerRouters('./routes');

app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
})

