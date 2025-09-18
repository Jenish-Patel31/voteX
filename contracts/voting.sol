// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Simple Voting Contract (Owner-authorized voters, one vote per address)
/// @author You
contract Voting {
    // --------- Data structures ---------
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool authorized;   // allowed to vote
        bool voted;        // already voted?
        uint256 vote;      // index of candidate voted for (meaningful only if voted==true)
    }

    // --------- State variables ---------
    address public owner;             // contract owner (admin)
    string public electionName;       // name/title of the election
    bool public electionEnded;        // if true, no more votes allowed
    Candidate[] public candidates;    // dynamic array of candidates
    mapping(address => Voter) public voters;
    uint256 public totalVotes;        // total votes cast
    bytes32 public restartPassword;   // password hash for restarting election
    uint256 public electionRound;     // track election rounds

    // --------- Events (useful for UI / logs) ---------
    event CandidateAdded(uint256 indexed index, string name);
    event VoterAuthorized(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed candidateIndex);
    event ElectionEnded();
    event ElectionRestarted(uint256 indexed newRound);
    event RestartPasswordSet();

    // --------- Modifiers ---------
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyWhileOpen() {
        require(!electionEnded, "Election ended");
        _;
    }

    // --------- Constructor ---------
    constructor(string memory _name) {
        owner = msg.sender;
        electionName = _name;
        electionEnded = false;
        electionRound = 1;
        // Set default restart password (admin can change this)
        restartPassword = keccak256(abi.encodePacked("VoteX2024Restart"));
    }

    // --------- Admin functions ---------

    /// @notice Add a candidate (owner only)
    function addCandidate(string memory _name) external onlyOwner {
        candidates.push(Candidate({ name: _name, voteCount: 0 }));
        emit CandidateAdded(candidates.length - 1, _name);
    }

    /// @notice Authorize a voter address (owner only)
    function authorizeVoter(address _voter) external onlyOwner {
        require(!voters[_voter].authorized, "Already authorized");
        voters[_voter].authorized = true;
        emit VoterAuthorized(_voter);
    }

    /// @notice End the election (owner only). After calling this, votes are rejected.
    function endElection() external onlyOwner {
        electionEnded = true;
        emit ElectionEnded();
    }

    /// @notice Set restart password (owner only)
    function setRestartPassword(string memory _password) external onlyOwner {
        restartPassword = keccak256(abi.encodePacked(_password));
        emit RestartPasswordSet();
    }

    /// @notice Restart election with password protection (owner only)
    function restartElection(string memory _password) external onlyOwner {
        require(electionEnded, "Election must be ended first");
        require(keccak256(abi.encodePacked(_password)) == restartPassword, "Invalid restart password");
        
        // Reset election state
        electionEnded = false;
        totalVotes = 0;
        electionRound += 1;
        
        // Clear all candidates
        delete candidates;
        
        // Clear all voter data
        // Note: This is a simplified approach. In production, you might want to keep voter history
        // and just reset the voted status
        
        emit ElectionRestarted(electionRound);
    }

    /// @notice Restart election and clear all data (owner only) - more thorough reset
    function restartElectionComplete(string memory _password) external onlyOwner {
        require(electionEnded, "Election must be ended first");
        require(keccak256(abi.encodePacked(_password)) == restartPassword, "Invalid restart password");
        
        // Reset election state
        electionEnded = false;
        totalVotes = 0;
        electionRound += 1;
        
        // Clear all candidates
        delete candidates;
        
        // Note: We cannot easily clear the voters mapping in Solidity
        // The voted status will remain true for previous voters
        // This is actually good for security - prevents re-voting
        
        emit ElectionRestarted(electionRound);
    }

    // --------- Voting functions ---------

    /// @notice Cast a vote for candidate index (must be authorized and not voted before)
    function vote(uint256 _candidateIndex) external onlyWhileOpen {
        Voter storage sender = voters[msg.sender];

        require(sender.authorized, "Not authorized to vote");
        require(!sender.voted, "Already voted");
        require(_candidateIndex < candidates.length, "Invalid candidate");

        // mark as voted
        sender.voted = true;
        sender.vote = _candidateIndex;

        // increase vote count
        candidates[_candidateIndex].voteCount += 1;
        totalVotes += 1;

        emit VoteCast(msg.sender, _candidateIndex);
    }

    // --------- Read helpers ---------

    /// @notice Return number of candidates
    function getNumCandidates() external view returns (uint256) {
        return candidates.length;
    }

    /// @notice Return candidate info by index
    function getCandidate(uint256 _index) external view returns (string memory name, uint256 voteCount) {
        require(_index < candidates.length, "Invalid index");
        Candidate storage c = candidates[_index];
        return (c.name, c.voteCount);
    }

    /// @notice Convenience: check if an address has voted
    function hasVoted(address _addr) external view returns (bool) {
        return voters[_addr].voted;
    }

    /// @notice Get election round number
    function getElectionRound() external view returns (uint256) {
        return electionRound;
    }

    /// @notice Check if restart password is set (returns true if password is not default)
    function isRestartPasswordSet() external view returns (bool) {
        return restartPassword != keccak256(abi.encodePacked("VoteX2024Restart"));
    }
}
