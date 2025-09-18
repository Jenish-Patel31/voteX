require("dotenv").config();
const { ethers, EtherscanProvider } = require("ethers");
const CONTRACT_ABI = require("../abi.json");

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn("WARNING: RPC_URL, PRIVATE_KEY or CONTRACT_ADDRESS missing in .env");
  }
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider); // owner wallet
const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// read-only contract (no signing)
const contractRead = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);


/**
 * GET /candidates
 */

async function getCandidates(req, res) {
  try {
    const num = await contractRead.getNumCandidates();
    const count = Number(num); // BigInt -> Number (safe as candidates count will be small)
    const list = [];
    for (let i = 0; i < count; i++) {
      const [name, votes] = await contractRead.getCandidate(i);
      list.push({ id: i, name, votes: votes.toString() });
    }
    res.json(list);
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("getCandidates error:", err.message);
    }
    res.status(500).json({ error: err.message });
  }
}


/**
 * POST /add-candidate
 * body: { name: "Alice" }
 */


async function addCandidate(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing 'name' in body" });

    const tx = await contractWithSigner.addCandidate(name);
    const receipt = await tx.wait();
    return res.json({ success: true, txHash: tx.hash, receipt });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("addCandidate error:", err.message);
    }
    return res.status(500).json({ error: err.message });
  }
}


/**
 * POST /authorize
 * body: { address: "0x..." }
 */


async function authorizeVoter(req, res) {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "Missing 'address' in body" });

    const tx = await contractWithSigner.authorizeVoter(address);
    const receipt = await tx.wait();
    return res.json({ success: true, txHash: tx.hash, receipt });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("authorizeVoter error:", err.message);
    }
    return res.status(500).json({ error: err.message });
  }
}


/**
 * POST /end
 */

async function endElection(req, res) {
  try {
    const tx = await contractWithSigner.endElection();
    const receipt = await tx.wait();
    return res.json({ success: true, txHash: tx.hash, receipt });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("endElection error:", err.message);
    }
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /restart
 * body: { password: "restart_password" }
 */
async function restartElection(req, res) {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Missing 'password' in body" });

    const tx = await contractWithSigner.restartElection(password);
    const receipt = await tx.wait();
    return res.json({ success: true, txHash: tx.hash, receipt, message: "Election restarted successfully" });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("restartElection error:", err.message);
    }
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /set-restart-password
 * body: { password: "new_password" }
 */
async function setRestartPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Missing 'password' in body" });

    const tx = await contractWithSigner.setRestartPassword(password);
    const receipt = await tx.wait();
    return res.json({ success: true, txHash: tx.hash, receipt, message: "Restart password updated successfully" });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("setRestartPassword error:", err.message);
    }
    return res.status(500).json({ error: err.message });
  }
}


/**
 * GET /status
 * returns basic contract info: owner, electionName, electionEnded, totalVotes
 */


async function status(req, res) {
  try {
    const owner = await contractRead.owner();
    const name = await contractRead.electionName();
    const ended = await contractRead.electionEnded();
    const totalVotes = (await contractRead.totalVotes()).toString();
    const electionRound = (await contractRead.getElectionRound()).toString();
    const passwordSet = await contractRead.isRestartPasswordSet();
    
    res.json({ 
      owner, 
      electionName: name, 
      electionEnded: ended, 
      totalVotes,
      electionRound,
      restartPasswordSet: passwordSet
    });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("status error:", err.message);
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /results
 * returns all candidates + totalVotes + winner
 */
async function getResults(req, res) {
  try {
    const num = await contractRead.getNumCandidates();
    const count = Number(num);
    const candidates = [];

    for (let i = 0; i < count; i++) {
      const [name, votes] = await contractRead.getCandidate(i);
      candidates.push({
        index: i,
        name,
        votes: votes.toString(),
      });
    }

    let winner = null;
    if (candidates.length > 0) {
      winner = candidates.reduce((prev, curr) =>
        parseInt(curr.votes) > parseInt(prev.votes) ? curr : prev
      );
    }

    res.json({
      totalVotes: candidates.reduce((sum, c) => sum + parseInt(c.votes), 0),
      candidates,
      winner: winner ? winner.name : null,
    });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("getResults error:", err.message);
    }
    res.status(500).json({ error: err.message });
  }
}

async function hasVoted(req, res) {
  try {
    const { address } = req.params;
    if (!address) return res.status(400).json({ error: "Missing address param" });

    const voted = await contractRead.hasVoted(address);
    res.json({ address, voted });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("hasVoted error:", err.message);
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /vote
 * body: { candidateIndex: 0, voterAddress: "0x..." }
 */
async function castVote(req, res) {
  try {
    const { candidateIndex, voterAddress } = req.body;
    if (candidateIndex === undefined || !voterAddress) {
      return res.status(400).json({ error: "Missing candidateIndex or voterAddress" });
    }

    // Check if voter is authorized
    const voterInfo = await contractRead.voters(voterAddress);
    if (!voterInfo.authorized) {
      return res.status(403).json({ error: "Voter not authorized" });
    }

    if (voterInfo.voted) {
      return res.status(403).json({ error: "Voter has already voted" });
    }

    // Check if election is still active
    const electionEnded = await contractRead.electionEnded();
    if (electionEnded) {
      return res.status(403).json({ error: "Election has ended" });
    }

    // Cast the vote
    const tx = await contractWithSigner.vote(candidateIndex);
    const receipt = await tx.wait();
    
    res.json({ 
      success: true, 
      txHash: tx.hash, 
      receipt,
      message: "Vote cast successfully"
    });
  } catch (err) {
    // Log error for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error("castVote error:", err.message);
    }
    res.status(500).json({ error: err.message });
  }
}



module.exports = {
  getCandidates,
  addCandidate,
  authorizeVoter,
  endElection,
  restartElection,
  setRestartPassword,
  status,
  getResults,
  hasVoted,
  castVote
};
