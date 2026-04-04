import express from 'express';
import KPI from '../models/KPI.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create KPI
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, target, category, employeeId } = req.body;
        const id = employeeId || req.user._id;
        const kpi = await KPI.create({
            title, description, target, category: category || 'Operational Excellence', employeeId: id
        });
        res.status(201).json(kpi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get KPIs for a user
router.get('/:employeeId?', protect, async (req, res) => {
    try {
        const eid = req.params.employeeId || req.user._id;
        const kpis = await KPI.find({ employeeId: eid });
        res.json(kpis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
