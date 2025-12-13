import jwt from 'jsonwebtoken';
const generateAccessToken = (data : any): string => {
    return jwt.sign({ id: data[0].id,role:data[0].role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '9h'
    });
};

const generateRefreshToken = (data: any): string => {
    return jwt.sign({ id: data[0].id,role:data[0].role }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
};

const verifyToken = (token: string, secret : string): any => {
    try {
        return jwt.verify(token, secret);    
    } catch (error) {
        throw new Error('Invalid access token');
    }       
};

export { generateAccessToken, generateRefreshToken, verifyToken };