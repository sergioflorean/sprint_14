import type { Request, Response, NextFunction } from "express";

function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    data: null,
    error: `Ruta ${req.method} ${req.path} no encontrada`,
  });
}

function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);

  const statusCode = err.statusCode ?? 500;

  const message =
    statusCode === 500
      ? "Ha ocurrido un error en el servidor"
      : err.message;

  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
  });
}

export { errorHandler, notFoundHandler };