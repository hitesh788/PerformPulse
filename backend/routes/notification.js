import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { logActivity } from '../utils/logger.js';


const router = express.Router();

// Get personal notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send broadcast notification to all employees (Manager/Admin only)
router.post('/broadcast', protect, authorize('Manager', 'Admin'), async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const io = req.app.get('io');
        // Find all users with 'Employee' role
        const employees = await User.find({ role: 'Employee' }).select('_id');

        if (employees.length === 0) {
            return res.status(200).json({ message: 'No employees found to notify' });
        }

        // Create notification objects
        const notificationsData = employees.map(emp => ({
            userId: emp._id,
            message: `${message} (from ${req.user.name})`
        }));

        // Batch insert for better performance
        const savedNotifs = await Notification.insertMany(notificationsData);

        // Notify via sockets in real-time
        savedNotifs.forEach(notif => {
            io.to(notif.userId.toString()).emit('newNotification', notif);
        });

        // Audit Log
        await logActivity(req.user._id, req.user.name, 'BROADCAST_NOTIFICATION', `Sent to ${employees.length} employees: ${message.substring(0, 50)}...`);

        res.status(201).json({ message: 'Notification sent to all employees' });

    } catch (error) {

        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json({ message: 'Marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

