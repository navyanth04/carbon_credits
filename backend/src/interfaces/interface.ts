import { Request } from "express";

interface CustomRequest extends Request {
    userName?: string;
    email?: string
}

export default CustomRequest;