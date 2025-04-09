import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IMF Gadget API",
      version: "1.0.0",
      description: "Secure API to manage IMF gadgets",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      { url: "https://api-imf.onrender.com" },
      { url: "http://localhost:3000" },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/index.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
