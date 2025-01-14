import admin from "../config/firebase.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Authorization token is missing or invalid.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || "",
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).send({
      success: false,
      message: "Unauthorized access. Invalid or expired token.",
    });
  }
};
