const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns basic information about the API status and uptime.
 *     tags:
 *       - Status
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 service:
 *                   type: string
 *                   example: Coding Ring API
 *                 uptime:
 *                   type: number
 *                   format: float
 *                   example: 123.45
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-06T12:34:56.789Z
 *                 message:
 *                   type: string
 *                   example: API is running smoothly
 */

// TODO: Write A Proper Status Check.
router.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Coding Ring API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "API is running smoothly",
  });
});

module.exports = router;
