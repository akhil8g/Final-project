import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';

//routes imports


//dot env config
dotenv.config();

//Cloudinary config

// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_NAME, 
//   api_key: process.env.CLOUDINARY_KEY, 
//   api_secret: process.env.CLOUDINARY_SECRET 
// });

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
// app.use(morgan('tiny'));
app.use(cors());
app.use(cookieParser());
 

//routes

import userRoutes from './routes/userRoutes.js'
import deviceRoutes from './routes/deviceRoutes.js'

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/device', deviceRoutes)




const port=process.env.PORT;

app.post('/',(req,res)=>{

    
    console.log(req.body);
    res.send(req.body);

});

app.listen(port, () => {
    console.log(`Server is running at http://${process.env.IP}:${port} in ${process.env.NODE_ENV} mode`);
  });