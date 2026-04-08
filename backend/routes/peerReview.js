import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import PeerReview from '../models/PeerReview.js';
import User from '../models/User.js';

const router = express.Router();

// Get valid peers (other employees)
router.get('/peers', protect, async (req, res) => {
    try {
        const peers = await User.find({ _id: { $ne: req.user._id } }).select('name department email role');
        res.json(peers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Post a peer review
router.post('/', protect, async (req, res) => {
    try {
        const { targetId, rating, comment } = req.body;
        const review = await PeerReview.create({
            reviewerId: req.user._id,
            targetId,
            rating,
            comment
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get peer reviews about a specific user (For Manager/Admin)
router.get('/:targetId', protect, async (req, res) => {
    try {
        const reviews = await PeerReview.find({ targetId: req.params.targetId })
            .populate('reviewerId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
