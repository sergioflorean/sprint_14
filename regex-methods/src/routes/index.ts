import { Router } from "express";
import { graduatesRouter } from "./graduates.js";

const router = Router();

router.use("/graduates", graduatesRouter);

export default router;
