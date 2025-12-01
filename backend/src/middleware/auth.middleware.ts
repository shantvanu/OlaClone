import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ msg: "No token provided" });

    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.userId = (decoded as any).userId;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
