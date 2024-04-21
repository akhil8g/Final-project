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
