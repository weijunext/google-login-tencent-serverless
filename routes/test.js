const router = require('koa-router')();

router.prefix('/api');

router.post('/test1', async (ctx, next) => {
  const { } = ctx.request.body;

  const result = 'test1';
  ctx.body = result;
});

router.get('/test2', async (ctx, next) => {
  const { } = ctx.request.query;

  const result = 'test2';
  ctx.body = result;
});

module.exports = router;
