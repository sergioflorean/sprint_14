import type { Request, Response, NextFunction } from "express";
import Graduate from "../models/graduate.js";

const getGraduates = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const graduates = await Graduate.find();
    res.status(200).json(graduates);
  } catch (err) {
    next(err);
  }
};

const createGraduate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const graduate = await Graduate.create(req.body);
    res.status(201).json(graduate);
  } catch (err) {
    next(err);
  }
};

export { getGraduates, createGraduate };
