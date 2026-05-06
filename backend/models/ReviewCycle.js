import mongoose from 'mongoose';

const reviewCycleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Completed', 'Upcoming'],
            default: 'Upcoming',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const ReviewCycle = mongoose.model('ReviewCycle', reviewCycleSchema);
export default ReviewCycle;
