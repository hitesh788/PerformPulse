import express from 'express';
import Score from '../models/Score.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get final score for an employee
router.get('/:employeeId', protect, async (req, res) => {
    try {
        const scores = await Score.find({ employeeId: req.params.employeeId }).populate('kpiId');
        if (scores.length === 0) return res.json({ averageScore: 0, scores: [] });

        const total = scores.reduce((acc, curr) => acc + curr.value, 0);
        const average = total / scores.length;
        res.json({ averageScore: average.toFixed(2), scores });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
