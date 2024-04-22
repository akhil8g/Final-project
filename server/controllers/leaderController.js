import { userModel } from "../models/userModel.js";
import nodemailer from 'nodemailer';

export const joinRequestController = async (req, res) => {
    try {
        // Fetch the leader's id
        const userId = req.user._id;
        
        // Find the leader user
        const user = await userModel.findById(userId);
        
        // Check if the user is a leader
        if (!user || !user.isLeader) {
            return res.status(404).json({ success: false, message: 'User not found or not a leader' });
        }

        // Populate the joinRequest array with user details
        const joinRequests = await userModel.find({ _id: { $in: user.joinRequest } }, '_ id name email phone');

        res.status(200).json({
            success: true,
            message: "Join requests fetched successfully",
            joinRequests
        });
    } catch (error) {
        console.error('Error fetching join requests:', error);
        res.status(500).json({ success: false, message: 'Error fetching join requests' });
    }
};

//approve join request
export const grantRequestController = async (req, res) => {
    try {
        // Fetch the leader's id
        const leaderId = req.user._id;

        // Check if the user is a leader
        const leader = await userModel.findById(leaderId);
        if (!leader || !leader.isLeader) {
            return res.status(404).json({ success: false, message: 'User not found or not a leader' });
        }

        // Fetch the userId from the request body
        const { userId } = req.body;

        // Check if the user is in the joinRequest array
        const isRequested = leader.joinRequest.includes(userId);
        if (!isRequested) {
            return res.status(404).json({ success: false, message: 'User has not requested to join the community' });
        }

        // Remove the userId from the joinRequest array
        await userModel.findByIdAndUpdate(leaderId, { $pull: { joinRequest: userId } });

        // Set joined status of the user to true
        await userModel.findByIdAndUpdate(userId, { joined: true, communityId: leader.communityId });

        // Send email to the user
        const user = await userModel.findById(userId);
        if (user) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.VERIFY_EMAIL, // Enter your email address
                    pass: process.env.VERIFY_PASS // Enter your email password
                }
            });

            const mailOptions = {
                from: process.env.VERIFY_EMAIL, // Enter your email address
                to: user.email,
                subject: 'Join Request Approved',
                text: `Hi ${user.name},\n\nYour join request to join the community has been approved. You may now login`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending approval email:', error);
                } else {
                    console.log('Approval email sent to user');
                }
            });
        }

        res.status(200).json({ success: true, message: 'Join request approved successfully' });
    } catch (error) {
        console.error('Error granting join request:', error);
        res.status(500).json({ success: false, message: 'Error approving join request' });
    }
};
 

//view community members
export const fetchCommunityUsersController = async (req, res) => {
    try {
        // Get the community ID from the request user object
        const communityId = req.user.communityId;

        // Find all users with the same community ID
        const users = await userModel.find({ communityId });

        // Extract name and phone from each user
        const userDetails = users.map(user => ({ name: user.name, phone: user.phone }));

        res.status(200).json({ success: true, users: userDetails });
    } catch (error) {
        console.error('Error fetching community users:', error);
        res.status(500).json({ success: false, message: 'Error fetching community users' });
    }
};

//view reports
export const fetchUserReportsController = async (req, res) => {
    try {
        // Get the user ID from the request object
        const userId = req.user._id;

        // Find the user document by ID
        const user = await userModel.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Extract the reports array from the user document
        const reports = user.reports;

        res.status(200).json({ success: true, reports });
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({ success: false, message: 'Error fetching user reports' });
    }
};


//remove user
export const deleteUserController = async (req, res) => {
    try {
        // Get the userId from the request body
        const { userId } = req.body;

        // Find the user by ID and delete it
        const deletedUser = await userModel.findByIdAndDelete(userId);

        // Check if the user was found and deleted
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
};
