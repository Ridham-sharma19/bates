import { OAuth2Client } from "google-auth-library";
import { db } from "../../db"
import { users } from "../../db/schema";

import { eq } from "drizzle-orm";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginService = async (token: string) => {

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token");
  }

  const googleId = payload.sub!;
  const email = payload.email!;
  const name = payload.name;
  const avatar = payload.picture;

 
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.googleId, googleId));

  if (existingUser.length > 0) {
    return existingUser[0]; 
  }

  
  const newUser = await db
    .insert(users)
    .values({
      googleId,
      email,
      username: name,
      avatar,
      isVerified: true
    })
    .returning();

  return newUser[0];
};