import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: System health check endpoint
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server health statistics and status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 memoryUsage:
 *                   type: object
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

export default router;
