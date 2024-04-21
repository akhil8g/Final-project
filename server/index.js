import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';
import { requestModel } from './models/requestModel.js';

//routes imports

import connectDB from './config/db.js';

//dot env config
dotenv.config();

//database connection
connectDB();

//Cloudinary config

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

const app = express();
app.set('view engine', 'ejs');

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
//Middleware


app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(cookieParser());
 

//routes
import testRoutes from './routes/testRoutes.js';
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productsRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
app.use('/api/v1',testRoutes); 
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/app',productRoutes);
app.use('/api/v1/app',requestRoutes);


const port=process.env.PORT;

app.post('/',(req,res)=>{

    
    console.log(req.body);
    res.send(req.body);

});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port} in ${process.env.NODE_ENV} mode`);
  });