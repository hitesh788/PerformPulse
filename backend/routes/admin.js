import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import ReviewCycle from '../models/ReviewCycle.js';
import ActivityLog from '../models/ActivityLog.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// Get all review cycles
router.get('/cycles', protect, authorize('Admin'), async (req, res) => {
    try {
        const cycles = await ReviewCycle.find({}).sort({ startDate: -1 });
        res.json(cycles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new review cycle
router.post('/cycles', protect, authorize('Admin'), async (req, res) => {
    const { name, startDate, endDate, status } = req.body;
    try {
        const cycle = await ReviewCycle.create({
            name,
            startDate,
            endDate,
            status,
            createdBy: req.user._id
        });

        await logActivity(req.user._id, req.user.name, 'CREATE_REVIEW_CYCLE', `Created cycle: ${name}`);
        res.status(201).json(cycle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update review cycle status/details
router.put('/cycles/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const cycle = await ReviewCycle.findById(req.params.id);
        if (cycle) {
            cycle.name = req.body.name || cycle.name;
            cycle.status = req.body.status || cycle.status;
            cycle.startDate = req.body.startDate || cycle.startDate;
            cycle.endDate = req.body.endDate || cycle.endDate;
            const updated = await cycle.save();

            await logActivity(req.user._id, req.user.name, 'UPDATE_REVIEW_CYCLE', `Updated cycle: ${updated.name} (Status: ${updated.status})`);
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Cycle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get recent activity logs
router.get('/logs', protect, authorize('Admin'), async (req, res) => {
    try {
        const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
