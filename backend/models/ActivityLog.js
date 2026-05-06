import mongoose from 'mongoose';

const activityLogSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        details: {
            type: String,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
        }
    },
    {
        timestamps: true,
    }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
