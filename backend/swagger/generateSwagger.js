const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const generateSwaggerSpec = (tagName, routeFilePaths, basePath = "") => {
  return swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: `Coding Ring API – ${tagName}`,
        version: "1.0.0",
        description: `Auto-generated Swagger docs for ${tagName} APIs.`,
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}${basePath}`,
        },
      ],
    },
    apis: routeFilePaths,
  });
};

module.exports = generateSwaggerSpec;
