import { Request, Response, NextFunction, RequestHandler } from "express";


const printRed = (text: string) => {
    console.log('\x1b[31m%s\x1b[0m', `${text}\n`);
};

const handleError = (res: Response, message: String, statusCode: number = 400) => {
    return res.status(statusCode).json({ status: false, message })
};

const handleSuccess = (res: Response, message: string, data = {}, statusCode: number = 200) => {
    return res.status(statusCode).json({ status: true, message, data: { ...data } })
};

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

const generateCode = (num: number = 15) => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    let result = randomness + dateString;
    result = result.length > num ? result.substring(0, num) : result ;
    return result.toUpperCase();
}

const Utility = {
    printRed,
    handleError,
    handleSuccess,
    asyncHandler,
    generateCode
};

export default Utility;