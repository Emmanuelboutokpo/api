import bcrypt from "bcrypt";
import * as c from "crypto";
import prisma from '../lib/prisma';
import { Redis } from "@upstash/redis";
import {Request, Response} from "express";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../lib/jwt";
import { sendConfirmationEmail, sendOPT } from "../services/mails/emailServices";
 
const hashPassword=async (password: string)   =>  bcrypt.hashSync(password, 10);

const generateNumericOTP = () =>{
    const n = c.randomInt(0, 1000000)
    return n.toString().padStart(0, '0');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const signUpEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName} = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email }});
        if (existingUser) throw new Error('User with this email already exists');
  
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            }
        });

        if (firstName || lastName) {
            await prisma.profile.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    userId: newUser.id,
                }
            });
        }

        const otp = generateNumericOTP();
        await redis.set(`otp: ${email}`, otp, { ex: 300 }); // OTP valid for 5 minutes
        await sendOPT({email, otp, user: {name : firstName || 'User'}});
        res.status(201).json({ message: 'User created successfully. Please verify your email.' });
        return;

    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }

}

export const verifyOpt = async (req: Request, res: Response): Promise<void> => {
   const {email, otp, user} = req.body; 
   const storedOtp = await redis.get(`otp: ${email}`);
   if (storedOtp !== otp) throw new Error('Invalid OTP');

   const userRecord = await prisma.user.findUnique({ where: { email } });
   if (!userRecord) throw new Error('User not found');
   const accesToken = generateAccessToken(userRecord.id);
   const refreshToken = generateRefreshToken(userRecord.id);
    const hashRefresh = bcrypt.hashSync(refreshToken, 10);
   await prisma.user.update({
     where: {id: userRecord.id},
    data: { refreshToken : hashRefresh }
    });

    await redis.del(`otp: ${email}`);
    await sendConfirmationEmail(email, {name: user.profile.firsName || 'User'});
    res.status(200).json({ accesToken, refreshToken });
    return;
}

export const login=async (req: Request, res: Response): Promise<void> => {
    const { email, password} = req.body;  
    try {
          const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
          if (!user || !await bcrypt.compare(password, user.password)) throw new Error('Invalid credentials');
          const accesToken = generateAccessToken(user.id);
          const refreshToken = generateRefreshToken(user.id);
          const hashRefresh = bcrypt.hashSync(refreshToken, 10);
          await prisma.user.update({
            where: {id: user.id},
            data: { refreshToken : hashRefresh }
         });

         res.status(200).json({ accesToken, refreshToken });
         return;

    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
}

export const refreshTokens = async (req: Request, res: Response) => {
    const { refreshToken} = req.body; 

    let decoded;
    try {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not defined');
        decoded = verifyToken(refreshToken, secret);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !await bcrypt.compare(refreshToken, user.password)) throw new Error('Invalid refresh token');

    const newAccesToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newHashRefresh = bcrypt.hashSync(refreshToken, 10);
    
    await prisma.user.update({
      where: {id: user.id},
      data: { refreshToken : newHashRefresh }
   });

   return res.json({ accessToken: newAccesToken, refreshToken:newRefreshToken });
}

export const logoutUser = async (req: Request, res: Response) => {
    try{
         await prisma.user.update({
           where: { id: req.params.id },
           data: { refreshToken: null }
       });
    } catch (error) {
        console.error('Error during logout', error);
        return res.status(500).json({ message: 'Server error during logout' });
    }
}