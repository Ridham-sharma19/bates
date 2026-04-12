import { db } from "../../db";
import { users, refreshTokens } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/errorHandler"; 
import { hashPassword, comparePassword, generateTokens } from "../../utils/authutils";
import ApiResponse from "../../utils/apiResponse"; 
import  AsyncHandler  from "../../utils/asyncHandler";
import { COOKIE_OPTIONS } from "../../consant";

const getExpiryDate = (expiryStr: string): Date => {
  const value = parseInt(expiryStr);
  const now = new Date();
  if (expiryStr.endsWith("m")) return new Date(now.getTime() + value * 60000);
  if (expiryStr.endsWith("d")) return new Date(now.getTime() + value * 24 * 60000); 
  return new Date(now.getTime() + 3600000); 
};



export const registerService = AsyncHandler(async (req, res) => {
  const { email, password, username } = req.body;
  const userAgent = req.headers["user-agent"] || "unknown device";

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then((rows) => rows[0]);

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const hashedPassword = await hashPassword(password);
  const baseUsername = (email.split("@")[0] ?? "user").toLowerCase();
  const finalUsername = username || `${baseUsername}${Math.floor(Math.random() * 10000)}`;

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      username: finalUsername,
    })
    .returning();

  if (!newUser) throw new ApiError(500, "Failed to create user account.");

  const { accessToken, refreshToken } = generateTokens(newUser.id);

  await db.insert(refreshTokens).values({
    userId: newUser.id,
    token: refreshToken,
    userAgent: userAgent,
    expiresAt: getExpiryDate(process.env.REFRESH_TOKEN_EXPIRY!),
  });

  const responseData = {
    user: { 
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar || newUser.username?.charAt(0).toUpperCase()
    },
    accessToken
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS!)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(201, responseData, "User registered successfully", true));
});

export const loginService = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers["user-agent"] || "unknown device";

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then((rows) => rows[0]);

  if (!existingUser || !existingUser.password) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await comparePassword(password, existingUser.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password.");

  const { accessToken, refreshToken } = generateTokens(existingUser.id);

  await db.insert(refreshTokens).values({
    userId: existingUser.id,
    token: refreshToken,
    userAgent: userAgent,
    expiresAt: getExpiryDate(process.env.REFRESH_TOKEN_EXPIRY!),
  });

  const responseData = {
    user: { 
      id: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
      avatar: existingUser.avatar || existingUser.username?.charAt(0).toUpperCase() || "U"
    },
    accessToken
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(200, responseData, "Login successful", true));
});

export const logoutUser = AsyncHandler(async (req, res) => {

  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.userId, userId));
  return res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(new ApiResponse(200, {}, "User logged out successfully", true));
});