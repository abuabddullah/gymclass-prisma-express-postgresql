import { Response, NextFunction, Request } from 'express';

export const catchAsyncErrorsMiddleware = (theFunc: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
};