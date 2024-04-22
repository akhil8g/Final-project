import mongoose from 'mongoose';

const logsSchema = new mongoose.Schema(
    {
        RenterID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        RenteeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export const logsModel = mongoose.model('Logs', logsSchema);


