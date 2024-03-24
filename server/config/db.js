import mongoose from 'mongoose';

const connectDB= async() =>{
    try {
        await mongoose.connect(process.env.CONNECTION_STRING)
        console.log(`Mongodb Connected ${mongoose.connection.host}`)
    } catch (err){
        console.log(`Mongodb Error${err}`);
    }
}

export default  connectDB;