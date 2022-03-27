const modifyResponse = (ctx, fn = v => v) => {
  const { req, res } = ctx;

  Reflect.deleteProperty(req.headers, 'accept-encoding');

  const client = req.request(svrRes => {
    let body;

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

module.exports = {
  modifyResponse
};
