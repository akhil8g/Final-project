import {userModel} from "../models/userModel.js";
import { requestModel } from "../models/requestModel.js";
import {v2 as cloudinary} from 'cloudinary';


export const allRequestsController = async (req, res) => {
    try {
        // Retrieve the user's ID from req.user
        const userId = req.user._id;

        // Find the corresponding user document using the user's ID
        const user = await userModel.findById(userId);

        // Extract the community ID from the user document
        const communityId = user.communityId;

        // Query the productModel for all products belonging to the community
        const requests = await requestModel.find({ communityId });

        // Send the retrieved products as a response
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
                await createProduct(productName, productDetails, req.user._id, photoUrl);
            }).end(req.file.buffer);
        } else {
            // Create product without image upload
            await createProduct(productName, productDetails, req.user._id, photoUrl);
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

async function createProduct(productName, productDetails, userId, photoUrl) {
    // Create new product
    await requestModel.create({
        productName,
        productDetails,
        memberId: userId,
        photoUrl
    });
}

