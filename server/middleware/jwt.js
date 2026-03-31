import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You are not authenticated!");

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) return res.status(403).json("Token is not valid!");
    req.userId = user.id;
    req.isSeller = user.isSeller;
    req.role = user.role;       // ← ADD role to request
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("You are not authenticated!");

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return res.status(403).json("Token is not valid!");
    req.userId = decoded.id;
    req.isSeller = decoded.isSeller;
    req.isAdmin = decoded.isAdmin;
    req.role = decoded.role;    // ← ADD role to request
    if (!decoded.isAdmin) return res.status(403).json("Access denied. Admin only.");
    next();
  });
};