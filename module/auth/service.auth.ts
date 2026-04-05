import { db } from "../../db";
import { refreshTokens } from "../../db/schema";
import { eq, and, gt } from "drizzle-orm";
import { ApiError } from "../../utils/errorHandler"; 
import { verifyToken, generateTokens } from "../../utils/authutils";
import ApiResponse from "../../utils/apiResponse";

export const refreshAccessTokenService = async (oldRefreshToken: string) => {
  
 
  const decoded = verifyToken(oldRefreshToken);
  
  if (!decoded || !decoded.id) {
    throw new ApiError(401, "Refresh token is invalid or has expired.");
  }

  
  
  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token, oldRefreshToken),
        gt(refreshTokens.expiresAt, new Date()) 
      )
    );

  
  if (!storedToken) {
   
    await db.delete(refreshTokens).where(eq(refreshTokens.token, oldRefreshToken));
    
    throw new ApiError(401, "Session expired. Please log in again.");
  }

 
  
  const { accessToken } = generateTokens(decoded.id);

  
  const responseData = {
    accessToken,
    refreshToken: oldRefreshToken, 
  };

  return new ApiResponse(200, responseData, "Access token refreshed successfully", true);
};