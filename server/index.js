import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
//routes imports

import connectDB from './config/db.js';

//dot env config
dotenv.config();

//database connection
connectDB();

const app = express();

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
app.use('/api/v1',testRoutes); 
app.use('/api/v1/user',userRoutes);
app.get('/', (req, res) => {
    res.send('Hello World!');
  });

const port=process.env.PORT;

app.post('/',(req,res)=>{

    
    console.log(req.body);
    res.send(req.body);

});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port} in ${process.env.NODE_ENV} mode`);
  });