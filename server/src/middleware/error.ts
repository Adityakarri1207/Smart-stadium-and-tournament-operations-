import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err);
  
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction 
    ? 'An unexpected error occurred on the server.' 
    : (err.message || 'Internal Server Error');

  res.status(500).json({
    success: false,
    message,
  });
};
