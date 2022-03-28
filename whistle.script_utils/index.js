const modifyResponse = (ctx, fn = v => v) => {
  const { req, res } = ctx;

  Reflect.deleteProperty(req.headers, 'accept-encoding');

  const client = req.request(svrRes => {
    let body;

    Reflect.deleteProperty(svrRes.headers, 'content-length');

    svrRes.on(
      'data',
      data => (body = body ? Buffer.concat([body, data]) : data)
    );

    svrRes.on('end', () => {
      const {
        statusCode = svrRes.statusCode,
        headers = svrRes.headers,
        body: newBody = body
      } = fn({
        svrRes,
        statusCode: svrRes.statusCode,
        headers: svrRes.headers,
        body
      });

      res.writeHead(statusCode, headers);
      res.end(newBody);
    });
  });

  req.pipe(client);
};

const modifyJSONResponse = (ctx, fn = v => v) => {
  modifyResponse(ctx, res => {
    res.body = JSON.parse(res.body);
    const newRes = fn(res);

    newRes.body = typeof newRes.body === 'object' ? JSON.stringify(newRes.body) : newRes.body;

    return newRes;
  });
};

module.exports = {
  modifyResponse,
  modifyJSONResponse
};
