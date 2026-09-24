import { Router } from "express";
import { getGraduates, createGraduate } from "../controllers/graduates.js";

const graduatesRouter = Router();

graduatesRouter.get("/", getGraduates);
graduatesRouter.post("/", createGraduate);

export { graduatesRouter };
