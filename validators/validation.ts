import { z } from "zod";


export const userRegisterValidator = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Email is invalid"),
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .toLowerCase()
    .min(3, "Username must be at least 3 characters long"),
  password: z
    .string()
    .trim()
    .min(1, "Password is required"),
  fullname: z.string().trim().optional(),
});


export const userLoginValidator = z.object({
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Email is invalid",
  }),
  password: z.string().min(1, "Password is required"),
});


export const userChangeCurrentPasswordValidator = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(1, "New password is required"),
});


export const userForgotPasswordValidator = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Email is invalid"),
});


export const userResetForgotPasswordValidator = z.object({
  newPassword: z.string().min(1, "New password is required"),
});



