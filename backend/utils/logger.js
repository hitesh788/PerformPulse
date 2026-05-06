import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, userName, action, details, targetId = null) => {
    try {
        await ActivityLog.create({
            userId,
            userName,
            action,
            details,
            targetId
        });
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
};
