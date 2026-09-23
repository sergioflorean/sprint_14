import type { RequestHandler } from 'express';

const getPosts: RequestHandler = (req, res) => {
  res.status(200).json({ success: true, data: [], error: null });
};

const createPost: RequestHandler = (req, res) => {
  const { content } = req.body as { content: string };
  res.status(201).json({ success: true, data: { content }, error: null });
};

export { getPosts, createPost };
