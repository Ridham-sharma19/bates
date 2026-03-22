

import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from "crypto";

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET!, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'] }
  );
  
    const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET!, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'] }
  );

    return { accessToken, refreshToken };
};

export const hashPassword = async(password:string)=>{
    return await bcrypt.hash(password, 10);
}
export const comparePassword = async(password:string, hashedPassword:string)=>{
    return await bcrypt.compare(password, hashedPassword);
}
export const generateResetTokens = () => {
 
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};