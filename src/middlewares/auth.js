import jwt from 'jsonwebtoken';

export const isLoggedIn = async(req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({success: false, message:"Invalid token or No token provided"})
    }

    const token = authHeader.split(" ")[1]; 
    
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) =>{
            if(err){
                return res.status(403).json({success: false, message:"Invalid token"})
            } else {
                req.user = decoded;
                console.log({decoded});
                next();
            } 
        })
    } else{
        res.status(401).json({success: false, message:"You are not authorized"})
    }
}