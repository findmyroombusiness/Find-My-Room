const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) return res.status(401).json({ message: 'No token provided' });

	const token = authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'Malformed token' });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.id;
		next();
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token has expired. Please log in again.' });
		} else if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token. Please log in again.' });
		}
		res.status(401).json({ message: 'Failed to authenticate token' });
	}
};
