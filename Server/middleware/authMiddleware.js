const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; 
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.userData = { userId: decoded.userId };
        next();
    } catch (error) {
        res.status(500).json(
            {
                message: 'Internal Server Error',
                error: error.message
            });
    }
}