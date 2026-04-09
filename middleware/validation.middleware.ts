import type { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ApiError } from "../utils/errorHandler";

export const validate = (schema: ZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const validatedData = await schema.parseAsync(req.body);
      
     
      req.body = validatedData; 
      next();
    } catch (error) {
      if (error instanceof ZodError) {
     
        const errorMessages = error.issues.map((err) => err.message);
        return next(new ApiError(400, "Validation Failed", errorMessages));
      }
      next(error);
    }
  };