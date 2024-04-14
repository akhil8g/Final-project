import multer from 'multer';

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// Multer instance
export const upload = multer({ storage: storage });




