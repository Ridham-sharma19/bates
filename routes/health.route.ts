import { Router } from "express";
import  healthCheckService  from "../controller/healthCheck/healthCheck.service";
const router = Router();

router.get("/health", healthCheckService);

export default router;