import {userModel} from "../models/userModel.js";
import { requestModel } from "../models/requestModel.js";
import {v2 as cloudinary} from 'cloudinary';

//get all request
export const allRequestsController = async (req, res) => {
    try {
        // Retrieve the user's ID from req.user
        const userId = req.user._id;

        // Find the corresponding user document using the user's ID
        const user = await userModel.findById(userId);

        // Extract the community ID from the user document
        const communityId = user.communityId;

        // Query the requestModel for all requests belonging to the community
        const requests = await requestModel.find({ 
            communityId,
            memberId: { $ne: userId } // Exclude requests where memberId is same as userId
        }).populate({
            path: 'memberId', // Populate the memberId field
            select: 'name phone karma', // Select the fields to include
        });

        // Send the retrieved requests as a response
        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error('Error retrieving requests:', error);
        res.status(500).json({ success: false, message: 'Error in requests fetch' });
    }
};



// post request

export const postRequestsController = async (req, res) => {
    try {
        const { productName, productDetails } = req.body;
        let photoUrl = null;

        const user = await userModel.findById(req.user._id);
        const communityId = user.communityId;

        if (req.file) {
            // Upload image to Cloudinary if it exists
            cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
                if (error) {
                    console.error('Error uploading profile picture to Cloudinary:', error);
                    return res.status(500).json({ message: 'Error uploading to coloudinary products' });
                }

                photoUrl = result.secure_url;
                await createProduct(productName, productDetails, req.user._id, photoUrl,communityId);
            }).end(req.file.buffer);
        } else {
            // Create product without image upload
            await createProduct(productName, productDetails, req.user._id, photoUrl, communityId);
        }

        res.status(200).json({
            success: true,
            message: 'New product created',
            product: {
                productName,
                productDetails,
                photoUrl,
                communityId
            }
        });
    } catch (error) {
        console.log("Error in new product", error);
        res.status(500).json({
            success: false,
            message: "Adding new product failed"
        });
    }
};

async function createProduct(productName, productDetails, userId, photoUrl,communityId) {
    // Create new product
    await requestModel.create({
        productName,
        productDetails,
        memberId: userId,
        photoUrl,
        communityId
    });
}

// myitems get requests

export const myItemsRequestsController = async (req, res) => {
    try {
        const memberId = req.user._id; // Get the current user's ID from req.user

        // Find all requests where memberId matches req.user._id
        const requests = await requestModel.find({ memberId: memberId });

        res.status(200).json({ success: true, requests: requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Error fetching requests' });
    }
};


//grant-req
import nodemailer from 'nodemailer';

export const grantRequestController = async (req, res) => {
    try {
        // Retrieve memberId and productName from the request body
        const { memberId, productName } = req.body;

        // Find the user with memberId
        const user = await userModel.findById(memberId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get the current user's ID from req.user
        const currentUserId = req.user._id;

        // Find the current user details
        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'Current user not found' });
        }

        // Compose email content
        const mailContent = `${currentUser.name} has the ${productName} you need. Contact them at ${currentUser.phone}.`;

        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.VERIFY_EMAIL, // Enter your email address
                pass: process.env.VERIFY_PASS // Enter your email password
            }
        });

        // Define email options
        const mailOptions = {
            from: process.env.VERIFY_EMAIL, // Enter your email address
            to: user.email,
            subject: 'Item Availability Notification',
            text: mailContent
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ success: false, message: 'Error sending email' });
            } else {
                console.log('Email sent:', info.response);
                res.status(200).json({ success: true, message: 'Email sent successfully' });
            }
        });
    } catch (error) {
        console.error('Error granting request:', error);
        res.status(500).json({ success: false, message: 'Error granting request' });
    }
};

//remover req
export const removeRequestController = async (req, res) => {
    try {
        const { requestId } = req.body;

        // Find the request by its ID and delete it
        await requestModel.findByIdAndDelete(requestId);

        res.status(200).json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error removing request:', error);
        res.status(500).json({ success: false, message: 'Error removing request' });
    }
};
