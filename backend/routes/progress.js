import express from 'express';
import KPI from '../models/KPI.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Update Progress on a KPI
router.put('/:id', protect, async (req, res) => {
    try {
        const kpi = await KPI.findById(req.params.id);
        if (!kpi) return res.status(404).json({ message: 'KPI not found' });

        if (kpi.employeeId.toString() !== req.user._id.toString() && req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: 'Not authorized to update this KPI' });
        }

        kpi.progress = req.body.progress !== undefined ? req.body.progress : kpi.progress;
        await kpi.save();
        res.json(kpi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
