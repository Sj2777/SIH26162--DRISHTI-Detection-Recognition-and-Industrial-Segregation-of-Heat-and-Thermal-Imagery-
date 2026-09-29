"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const healthFilePath = path_1.default.join(__dirname, '../../data/asset-health.json');
const incidentsFilePath = path_1.default.join(__dirname, '../../data/historical-incidents.json');
router.get('/asset-health', (_req, res) => {
    try {
        const rawData = fs_1.default.readFileSync(healthFilePath, 'utf-8');
        const healthData = JSON.parse(rawData);
        res.status(200).json(healthData);
    }
    catch (error) {
        console.error('Error reading asset health data:', error);
        res.status(500).json({ error: 'Failed to read asset health data' });
    }
});
router.get('/historical-incidents', (_req, res) => {
    try {
        const rawData = fs_1.default.readFileSync(incidentsFilePath, 'utf-8');
        const incidentsData = JSON.parse(rawData);
        res.status(200).json(incidentsData);
    }
    catch (error) {
        console.error('Error reading historical incidents data:', error);
        res.status(500).json({ error: 'Failed to read historical incidents data' });
    }
});
exports.default = router;
