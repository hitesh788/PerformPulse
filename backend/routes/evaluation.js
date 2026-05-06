import express from 'express';
import Score from '../models/Score.js';
import ManagerFeedback from '../models/ManagerFeedback.js';
import User from '../models/User.js';
import KPI from '../models/KPI.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/score', protect, authorize('Manager', 'Admin'), async (req, res) => {
    const { employeeId, kpiId, value } = req.body;
    if (value < 1 || value > 5) return res.status(400).json({ message: 'Score must be between 1 and 5' });
    try {
        let score = await Score.findOne({ employeeId, kpiId });
        if (score) {
            score.value = value;
            await score.save();
        } else {
            score = await Score.create({ employeeId, kpiId, value });
        }
        res.json(score);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/feedback', protect, authorize('Manager', 'Admin'), async (req, res) => {
    const { employeeId, feedback, rating, potentialRating, performanceRating } = req.body;
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    try {
        // Upsert feedback so we only have one current evaluation per user for the demo
        let fb = await ManagerFeedback.findOne({ employeeId, managerId: req.user._id });
        if (fb) {
            fb.feedback = feedback;
            fb.rating = rating;
            fb.potentialRating = potentialRating || fb.potentialRating;
            fb.performanceRating = performanceRating || fb.performanceRating;
            await fb.save();
        } else {
            fb = await ManagerFeedback.create({
                employeeId, managerId: req.user._id, feedback, rating, potentialRating, performanceRating
            });
        }
        res.json(fb);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/feedback/:employeeId', protect, async (req, res) => {
    try {
        const feedback = await ManagerFeedback.find({ employeeId: req.params.employeeId }).populate('managerId', 'name');
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/all-feedback', protect, authorize('Manager', 'Admin'), async (req, res) => {
    try {
        const feedback = await ManagerFeedback.find().populate('employeeId', 'name email').populate('managerId', 'name');
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/analytics-combined', protect, authorize('Manager', 'Admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const feedbacks = await ManagerFeedback.find();
        const kpis = await KPI.find();
        const scores = await Score.find();
        res.json({ users, feedbacks, kpis, scores });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
