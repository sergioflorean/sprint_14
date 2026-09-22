import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500,
  },
  rating: {
    type: Number,
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;