const swaggerUi = require("swagger-ui-express");
const path = require("path");
const generateSwaggerSpec = require("./generateSwagger");
const basicAuthMiddleware = require("../middlewares/basicAuth");

const setupSwagger = (app) => {
  // User API Docs
  const userSpec = generateSwaggerSpec(
    "User",
    [path.join(__dirname, "../routes/user.routes.js")],
    "/api/user"
  );
  app.use(
    "/api-docs/user",
    basicAuthMiddleware,
    swaggerUi.serveFiles(userSpec),
    (req, res) => {
      res.send(swaggerUi.generateHTML(userSpec));
    }
  );

  // Status API docs
  const statusSpec = generateSwaggerSpec("Status", [
    path.join(__dirname, "../routes/status.routes.js"),
    "api/status",
  ]);
  app.use(
    "/api-docs/status",
    basicAuthMiddleware,
    swaggerUi.serveFiles(statusSpec),
    (req, res) => {
      res.send(swaggerUi.generateHTML(statusSpec));
    }
  );
};

module.exports = setupSwagger;
