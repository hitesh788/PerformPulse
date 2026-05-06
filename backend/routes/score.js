import express from 'express';
import Score from '../models/Score.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get organizational leaderboard
router.get('/leaderboard', protect, async (req, res) => {
    try {
        const leaderboard = await Score.aggregate([
            {
                $group: {
                    _id: "$employeeId",
                    overallScore: { $avg: "$value" }
                }
            },
            { $sort: { overallScore: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    name: "$userDetails.name",
                    score: { $round: ["$overallScore", 1] }
                }
            }
        ]);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

