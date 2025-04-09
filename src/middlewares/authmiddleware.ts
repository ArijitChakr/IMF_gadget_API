import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "MY_JWT_SECRET";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const authMiddleware: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};
