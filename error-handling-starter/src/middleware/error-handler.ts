import type { Request, Response, NextFunction } from 'express';

function errorHandler(err: Error & { statusCode?: number },
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error(err);

    const statusCode = err.statusCode ?? 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;

    res.status(statusCode).json({ 
        success: false,
        data: null,
        error: message
     });
}

export { errorHandler };