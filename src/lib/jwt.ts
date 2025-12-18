import jwt from 'jsonwebtoken';
const generateAccessToken =(user: {
  id: string;
  role: string;
}): string => {
    return jwt.sign({ id: user.id, role : user.role}, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '8h'
    });
};

const generateRefreshToken = (user : {id : string}): string => {
    return jwt.sign({ id: user.id}, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
};

const verifyToken = (token: string, secret : string): any => {
    try {
        return jwt.verify(token, secret);    
    } catch (error) {
        throw new Error('Invalid access token');
    }       
};

export { generateAccessToken, generateRefreshToken, verifyToken };