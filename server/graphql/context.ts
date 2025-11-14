import { ExpressContext } from "apollo-server-express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "bonfire-demo-secret-key";

interface JwtPayload {
  userId: string;
  username: string;
}

export interface GraphQLContext {
  user?: JwtPayload;
}

export function createContext({ req }: ExpressContext): GraphQLContext {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return { user: payload };
    } catch (error) {
      // Invalid token, return context without user
      return {};
    }
  }

  return {};
}
