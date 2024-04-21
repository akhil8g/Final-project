import userModel from "../models/userModel.js";
import {productModel} from "../models/productModel.js";
import {v2 as cloudinary} from 'cloudinary';


export const allProductsController = async (req, res) => {
    try {
        // Retrieve the user's ID from req.user
        const userId = req.user._id;

        // Find the corresponding user document using the user's ID
        const user = await userModel.findById(userId);

        // Extract the community ID from the user document
        const communityId = user.communityId;

        // Query the productModel for all products belonging to the community
        const products = await productModel.find({ communityId });

        // Send the retrieved products as a response
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ success: false, message: 'Error in products fetch' });
    }
};


export const postProductsController = async (req, res) => {
    try {
        const { productName, productDetails } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload image to Cloudinary
        cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
            if (error) {
                console.error('Error uploading profile picture to Cloudinary:', error);
                return res.status(500).json({ message: 'Error uploading to coloudinary products' });
            }

            const userId = req.user._id; // Assuming user data is attached to the request object
            const photoUrl = result.secure_url;

            // Create new product
            const product = await productModel.create({
                productName,
                productDetails,
                memberId: userId,
                photoUrl
            });

            res.status(200).json({
                success: true,
                message: 'New product created',
                product
            });
        }).end(req.file.buffer);
    } catch (error) {
        console.log("Error in new product", error);
        res.status(500).json({
            success: false,
            message: "Adding new product failed"
        });
    }
};
