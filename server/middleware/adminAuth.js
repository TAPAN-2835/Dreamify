import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.token || req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin Access Denied' });
        }

        req.body.userId = decoded.id;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
    }
};

export default adminAuth;
