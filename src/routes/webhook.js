import { Router } from "express";
import verifySignature from "../middleware/verifySignature.js";
import { webhookController } from "../controllers/webhookController.js";

const router = Router();

router.post("/", verifySignature, webhookController);

export default router;
