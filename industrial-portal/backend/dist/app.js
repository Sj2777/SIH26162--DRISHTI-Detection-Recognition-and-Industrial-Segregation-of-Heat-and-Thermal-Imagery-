"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const health_1 = __importDefault(require("./routes/health"));
const facility_1 = __importDefault(require("./routes/facility"));
const assets_1 = __importDefault(require("./routes/assets"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const thermalEvents_1 = __importDefault(require("./routes/thermalEvents"));
const telemetry_1 = __importDefault(require("./routes/telemetry"));
const assetHealth_1 = __importDefault(require("./routes/assetHealth"));
const incidents_1 = __importDefault(require("./routes/incidents"));
const app = (0, express_1.default)();
// Configure CORS for local development
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// API Routes
app.use('/api', health_1.default);
app.use('/api', facility_1.default);
app.use('/api', assets_1.default);
app.use('/api', alerts_1.default);
app.use('/api', thermalEvents_1.default);
app.use('/api', telemetry_1.default);
app.use('/api', assetHealth_1.default);
app.use('/api', incidents_1.default);
exports.default = app;
