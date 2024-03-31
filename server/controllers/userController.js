import userModel from "../models/userModel.js";
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    //validation
    if (!name || !email || !password || !phone) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields"
      });
    }

    //check existing user
    const existingUser = await userModel.findOne({email});
    if(existingUser){
        return res.status(500).send({
            success: false,
            message: 'email already taken'
        });
    }

    const user = await userModel.create({ 
        name, 
        email, 
        password, 
        phone 
    });
    res.status(200).send({
        success:true,
        message:'Registration success, please login',
        user
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register api",
      error,
    });
  }
};


//login controller

export const loginController = async (req,res) =>{
    try{
        const {email,password} = req.body;
        //validation
        if(!email || !password){
            return res.status(500).send({
                success:false,
                message: 'Please add email or password'
            });
        }
        //check user
        const user = await userModel.findOne({email});
        //user validation
        if(!user){
            return res.status(404).send({
                success:false,
                message: 'User Not Found'
            });
        }
        //check password
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(500).send({
                success:false,
                message: 'invalid credentials'
            });
        }
        //token
        const token = user.generateToken();
        res.status(200).cookie("token",token,{
            expires: new Date(Date.now()+ 3 * 24 * 60 * 1000),
            httpOnly: process.env.NODE_ENV === "development"?true:false,
            // secure : process.env.NODE_ENV === "development"?true:false,
            sameSite : process.env.NODE_ENV === "development"?true:false
            
            
        }).send({
            success:true,
            message: 'Login successfull',
            user,
            token
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message: 'Error in Login Api',
            error
        });
    }
};

