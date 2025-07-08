const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user (temporary, requires email verification)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification mail sent successfully
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email or Username already exists
 */
router.post("/signup", userController.signupUser);

/**
 * @swagger
 * /verify:
 *   get:
 *     summary: Verify a temporary user account using a UUID seed
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: uuid
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique UUID sent to email
 *     responses:
 *       200:
 *         description: User verified and registered
 *       404:
 *         description: Temporary user not found
 *       409:
 *         description: User already verified
 */
router.get("/verify", userController.verifyUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user (supports access and refresh tokens)
 *     tags: [User]
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         schema:
 *           type: string
 *         required: false
 *       - in: header
 *         name: x-refresh-token
 *         schema:
 *           type: string
 *         required: false
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success or tokens refreshed
 *       403:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/login", userController.loginUser);

module.exports = router;
