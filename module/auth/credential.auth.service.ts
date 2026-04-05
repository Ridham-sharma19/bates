import { db } from "../../db";
import { users, refreshTokens } from "../../db/schema";
import { eq } from "drizzle-orm";
import { ApiError } from "../../utils/errorHandler"; 
import { hashPassword, comparePassword, generateTokens } from "../../utils/authutils";
import ApiResponse from "../../utils/apiResponse"; // Import your class

const getExpiryDate = (expiryStr: string): Date => {
  const value = parseInt(expiryStr);
  const now = new Date();
  if (expiryStr.endsWith("m")) return new Date(now.getTime() + value * 60000);
  if (expiryStr.endsWith("d")) return new Date(now.getTime() + value * 24 * 60000); 
  return new Date(now.getTime() + 3600000); 
};

export const registerService = async (
  email: string,
  password: string,
  username?: string,
  userAgent?: string,
) => {
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
  const expiresAt = getExpiryDate(process.env.REFRESH_TOKEN_SECRET_EXPIRY!);

  await db.insert(refreshTokens).values({
    userId: newUser.id,
    token: refreshToken,
    userAgent: userAgent || "unknown device",
    expiresAt: expiresAt,
  });

 
  const responseData = {
    user: { 
      ...newUser, 
      avatar: newUser.avatar || (newUser.username ? newUser.username.charAt(0).toUpperCase() : "U") 
    },
    accessToken,
    refreshToken
  };


  return new ApiResponse(201, responseData, "User registered successfully", true);
};

export const loginService = async (email: string, password: string, userAgent?: string) => {
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
  const expiresAt = getExpiryDate(process.env.REFRESH_TOKEN_SECRET_EXPIRY!);

  await db.insert(refreshTokens).values({
    userId: existingUser.id,
    token: refreshToken,
    userAgent: userAgent || "unknown device",
    expiresAt: expiresAt,
  });

  const responseData = {
    user: { 
      ...existingUser, 
      avatar: existingUser.avatar || (existingUser.username ? existingUser.username.charAt(0).toUpperCase() : "U") 
    },
    accessToken,
    refreshToken
  };

  return new ApiResponse(200, responseData, "Login successful", true);
};