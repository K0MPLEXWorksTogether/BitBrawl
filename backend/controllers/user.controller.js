const User = require("../models/User");
const temporaryUser = require("../models/TemporaryUser");
const jwtUtils = require("../utils/jwtUtils");
const passwordUtils = require("../utils/password");
const sendMail = require("../utils/mailer");

const { v4: uuidv4 } = require("uuid");

exports.signupUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email, password or username is missing." });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username already taken." });
      } else if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already registered." });
      }
    }

    const passwordHash = await passwordUtils.generatePasswordHash(password);
    const uniqueIdentifier = uuidv4();

    const tempUser = new temporaryUser({
      email: email,
      passwordHash: passwordHash,
      username: username,
      uuid: uniqueIdentifier,
    });
    await tempUser.save();

    // TODO: Detect When The PORT Variable Is Not Set
    const port = process.env.PORT || 3000;
    const verificationUrl = `${process.env.DOMAIN_URL}:${port}/api/users/verify?seed=${uniqueIdentifier}`;
    try {
      await sendMail(email, verificationUrl);
      res.status(200).json({ message: "Verification Mail Sent Successfully." });
    } catch (err) {
      console.error("Could Not Send Verification Email:", err.message);
      res.status(500).json({
        message: `Verification Mail Could Not Be Sent: ${err.message}`,
      });
    }
  } catch (err) {
    console.error("Could Not Signup User:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { seed } = req.query;

    const tempUser = await temporaryUser.findOne({ uuid: seed });
    if (!tempUser) {
      return res.status(404).json({ message: "No temporary user found." });
    }

    const existingUser = await User.findOne({
      email: tempUser.email,
      username: tempUser.username,
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already verified." });
    }

    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      passwordHash: tempUser.passwordHash,
    });

    await newUser.save();
    await temporaryUser.findByIdAndDelete(tempUser._id);
    res.status(200).json({ message: "User Verified", redirect: "/login" });
  } catch (err) {
    console.error("Could Not Verify User:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const accessToken = req.headers["x-access-token"];
    const refreshToken = req.headers["x-refresh-token"];
    const { username, email, password } = req.body;

    if (accessToken) {
      try {
        const decoded = jwtUtils.verifyToken(accessToken);

        const user = await User.findOne({
          email: decoded.email,
          username: decoded.username,
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        } else if (
          !(await passwordUtils.verifyPasswordHash(password, user.passwordHash))
        ) {
          return res.status(403).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
          message: "Authenticated via access token",
          userId: user._id,
        });
      } catch (err) {
        console.error(
          `Error While Authenticating Via Access Token: ${err.message}`
        );
      }

      // TODO: Test For Refresh Token Based Authentication.
    } else if (refreshToken) {
      try {
        const decoded = jwtUtils.verifyToken(refreshToken);

        const user = await User.findOne({
          email: decoded.email,
          username: decoded.username,
          refreshToken: refreshToken,
        });

        if (!user) {
          return res.status(401).json({ message: "Refresh token invalid" });
        } else if (
          !(await passwordUtils.verifyPasswordHash(password, user.passwordHash))
        ) {
          return res.status(403).json({ message: "Invalid credentials" });
        }

        const newAccessToken = jwtUtils.generateToken({
          email: user.email,
          username: user.username,
        });
        const newRefreshToken = jwtUtils.generateToken(
          { email: user.email, username: user.username },
          (refreshToken = true)
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        res.setHeader("x-access-token", newAccessToken);
        res.setHeader("x-refresh-token", newRefreshToken);

        return res.status(200).json({
          message: "New tokens issued via refresh",
          userId: user._id,
        });
      } catch (err) {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }
    }

    if (!password || (!username && !email)) {
      return res.status(400).json({
        message:
          "Missing credentials. Provide username or email, and password.",
      });
    }

    const user =
      (username && (await User.findOne({ username }))) ||
      (email && (await User.findOne({ email })));

    if (!user) {
      return res.status(404).json({
        message: "No user found for that email or username",
        redirect: "/signup",
      });
    }

    const isPasswordValid = passwordUtils.verifyPasswordHash(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    const payload = { email: user.email, username: user.username };
    const newAccessToken = jwtUtils.generateToken(payload, "1h");
    const newRefreshToken = jwtUtils.generateToken(payload, "14d");

    user.refreshToken = newRefreshToken;
    await user.save();

    res.setHeader("x-access-token", newAccessToken);
    res.setHeader("x-refresh-token", newRefreshToken);

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
    });
  } catch (err) {
    console.error("Could Not Login User:", err.message);
    res.status(500).json({ message: err.message });
  }
};
