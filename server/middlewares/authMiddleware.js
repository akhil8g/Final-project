export const authMiddleware = async (req, res, next) => {
    try {
      // Extract token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({
          success: false,
          message: 'Authorization token is missing or invalid.',
        });
      }
  
      const token = authHeader.split(' ')[1];
  
      // Verify the token with Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
  
      // Add user info to the request for downstream handlers
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || '',
      };
  
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).send({
        success: false,
        message: 'Unauthorized access. Invalid or expired token.',
      });
    }
  };
  