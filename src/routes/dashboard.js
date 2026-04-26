import { Router } from "express";
import { getStats, getDashboard, getInstallSuccess } from "../controllers/dashboardController.js";

const router = Router();

// Stats API — returns total reviews + active installations
router.get("/api/stats", getStats);

// Install success redirect page
router.get("/install/success", getInstallSuccess);

// Dashboard UI — serves index.html
router.get("/", getDashboard);
router.get("/dashboard", getDashboard);

export default router;
