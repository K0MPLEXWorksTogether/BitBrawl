const express = require("express");
const app = express();
const connectDB = require("./configs/db");
const setupSwagger = require("./swagger/swagger");

const statusRoutes = require("./routes/status.routes");
const userRoutes = require("./routes/user.routes");

require("dotenv").config();
connectDB();

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/status", statusRoutes);

setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
