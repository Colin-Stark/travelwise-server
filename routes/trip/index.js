const express = require('express');
const router = express.Router();

// Trip routes are deprecated in favor of Flight routes (/api/flights).
router.use((req, res) => {
    res.status(410).json({ success: false, error: 'Trip routes removed — use /api/flights endpoints' });
});

// Deprecated route handlers removed; this module now only returns 410 for all requests.

module.exports = router;