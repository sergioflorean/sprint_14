import mongoose from "mongoose";
import type { Request, Response } from "express";
import Review from "../models/review.js";

export const createReview = async (req: Request, res: Response) => {
  const { text, rating, bookId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(String(bookId))) {
    return res.status(400).send({
      message: "ID inválido",
    });
  }

  const review = await Review.create({
    text,
    rating,
    book: String(bookId),
  });

  res.status(201).send(review);
};

export const getReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({}).populate("book");

  res.status(200).send(reviews);
};