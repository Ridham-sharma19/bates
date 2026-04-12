import { OAuth2Client } from "google-auth-library";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, or } from "drizzle-orm";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginService = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload)
    throw new Error("Verification failed: No payload received from Google");

  const {
    sub: googleId,
    email,
    name,
    picture: avatar,
    email_verified,
  } = payload;

  if (!email) throw new Error("Google account must have an email attached");

  
  const existingUser = await db
    .select()
    .from(users)
    .where(or(eq(users.googleId, googleId), eq(users.email, email)))
    .then((rows) => rows[0]);

  if (existingUser) {
    
    if (!existingUser.googleId) {
      const [updatedUser] = await db
        .update(users)
        .set({
          googleId,
          avatar: existingUser.avatar || avatar,
          isVerified: email_verified || existingUser.isVerified,
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    }
    return existingUser;
  }

  
  const baseUsername = name?.replace(/\s+/g, "").toLowerCase() || "user";
  const uniqueUsername = `${baseUsername}${Math.floor(Math.random() * 10000)}`;

 
  const [newUser] = await db
    .insert(users)
    .values({
      googleId,
      email,
      username: uniqueUsername,
      avatar,
      isVerified: true, 
    })
    .returning();

  return newUser;
};
