// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const contractRoutes = require("./routes/contractRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", contractRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Backend running on http://localhost:${PORT}`);
  } else {
    console.log(`VoteX Backend started on port ${PORT}`);
  }
});
