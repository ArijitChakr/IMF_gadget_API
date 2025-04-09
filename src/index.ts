import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import gadgetRoutes from "./routes/gadgetRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./apiDocs";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/gadgets", gadgetRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome to the IMF Gadget API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 */

app.get("/", (req, res) => {
  res.send("Welcome to the IMF Gadget API");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
