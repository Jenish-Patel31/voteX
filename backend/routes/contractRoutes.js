// routes/contractRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/contractController");

// GET list
router.get("/candidates", ctrl.getCandidates);

// admin actions (these create on-chain txs)
router.post("/add-candidate", ctrl.addCandidate);
router.post("/authorize", ctrl.authorizeVoter);
router.post("/end", ctrl.endElection);
router.post("/vote", ctrl.castVote);
router.get("/results", ctrl.getResults); 
router.get("/has-voted/:address", ctrl.hasVoted);

// info
router.get("/status", ctrl.status);

module.exports = router;
