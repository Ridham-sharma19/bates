import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errorHandler";
import { verifyToken } from "../utils/authutils";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AsyncHandler } from "../utils/asyncHandler";

export const verifyJWT = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
 
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

 
  const decodedToken = verifyToken(token);

  if (!decodedToken || !decodedToken.id) {
    throw new ApiError(401, "Invalid or expired Access Token");
  }

  
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, decodedToken.id));

  if (!user) {
    throw new ApiError(401, "Invalid Access Token: User does not exist");
  }

 
  req.user = user;
  
  next(); 
});