const router = require('koa-router')();
const { google } = require('googleapis');
const { nanoid } = require('nanoid');
const jwt_decode = require('jwt-decode');

router.prefix('/api');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET,
  process.env.GOOGLE_LOGIN_REDIRECT_URL,
);

router.post('/googleOauth2Url', async (ctx, next) => {
  try {
    // 如果你有redis，可以把state缓存到redis，设置5分钟的过期时间，用户调用 /api/googleOAuth2Login 时携带state，node端判断是否过期
    // 如果不要，可以删掉state相关代码，不影响功能
    const state = nanoid();
  
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      state,
      scope: process.env.GOOGLE_SCOPE.split(','),
      include_granted_scopes: true,
    });
    ctx.body = {
      success: true,
      code: 200,
      message: 'OK',
      data: authorizationUrl
    }
  } catch (e) {
    console.log(e);
    ctx.body = {
      success: false,
      code: 400,
      message: e,
      data: null
    }
  }
});

router.post('/googleOAuthLogin', async (ctx, next) => {
  try {
    // 如果上一个接口有生成state并缓存到redis
    // const { code, state } = ctx.request.body;
    // 检查redis里state是否存在，不存在则拦截掉
    // ……
  
    const { code } = ctx.request.body;

    const result = await oauth2Client.getToken(code);
    if (!result.tokens) {
      throw new Error('谷歌登录 token 查询失败');
    }
    const googleUserInfo = jwt_decode(result.tokens.id_token);
    /** 解码结果如下：
     * {
     *    "iss":"https://accounts.google.com",
     *    "azp":"xxx",
     *    "aud":"xxx",
     *    "sub":"谷歌账号ID",
     *    "email":"邮箱",
     *    "email_verified":true,
     *    "at_hash":"xxx",
     *    "name":"用户名",
     *    "picture":"头像",
     *    "given_name":"名",
     *    "family_name":"姓",
     *    "locale":"zh-CN",
     *    "iat":1688626819,
     *    "exp":1688630419
     * }
     */

    const access_token = result.tokens.access_token;

    if (access_token) {
      // 返回信息
      const res = {
        success: true,
        message: 'OK',
        code: 200,
        data: {
          access_token: result.tokens.access_token,
          refresh_token: result.tokens.refresh_token, // refresh_token只有首次可以获得
          googleId: googleIdTokenDecoded.sub,
          username: googleIdTokenDecoded.name,
          avatar: googleIdTokenDecoded.picture,
          email: googleIdTokenDecoded.email,
        },
      };
      ctx.body = res;
    } else {
      throw new Error('谷歌授权登录获取token失败');
    }
  } catch (e) {
    console.log(e);
    ctx.body = {
      success: false,
      code: 400,
      message: '谷歌登录 token 查询失败',
      data: null
    }
  }
});

module.exports = router;
