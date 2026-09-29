"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const dataFilePath = path_1.default.join(__dirname, '../../data/telemetry.json');
router.get('/telemetry', (_req, res) => {
    try {
        const rawData = fs_1.default.readFileSync(dataFilePath, 'utf-8');
        const telemetryData = JSON.parse(rawData);
        res.status(200).json(telemetryData);
    }
    catch (error) {
        console.error('Error reading telemetry data:', error);
        res.status(500).json({ error: 'Failed to read telemetry data' });
    }
});
exports.default = router;
