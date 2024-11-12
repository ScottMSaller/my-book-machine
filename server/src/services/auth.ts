import jwt from 'jsonwebtoken';
import { Request } from 'express';
const expiration = '2h';

export const signToken = (user: { _id: any; email: any; username: any; }) => {
  const payload = { _id: user._id, email: user.email, username: user.username };
  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not defined');
  }
  return jwt.sign({ data: payload }, secretKey, { expiresIn: expiration });
};

export const authMiddleware = ({ req }: { req: Request }) => {

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error("No token found in request headers");
    return req;
  }

  try {

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      throw new Error('JWT_SECRET_KEY is not defined');
    }
    const decoded = jwt.verify(token, secretKey);
    if (typeof decoded !== 'string' && 'data' in decoded) {
      req.user = decoded.data;
    }
  } catch (err) {
    console.error("Invalid token:", err);
  }

  return req;
};


