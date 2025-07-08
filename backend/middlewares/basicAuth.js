const auth = require("basic-auth");

const basicAuthMiddleware = (req, res, next) => {
  const user = auth(req);

  const username = process.env.SWAGGER_USER;
  const password = process.env.SWAGGER_PASSWORD;

  if (!user || user.name !== username || user.pass !== password) {
    res.set("WWW-Authenticate", 'Basic realm="Swagger Docs"');
    return res.status(401).send("Authentication required.");
  }

  next();
};

module.exports = basicAuthMiddleware;
