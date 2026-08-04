// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Leaderboard
 * @notice On-chain leaderboard for Survivor Royale. Stores the top 100 scores.
 * @dev Players can only submit a score if it exceeds their personal best.
 */
contract Leaderboard {
    struct ScoreEntry {
        address player;
        uint256 score;
        uint256 wave;
        string heroId;
        uint256 timestamp;
    }

    uint256 public constant MAX_TOP_SCORES = 100;

    /// @notice Ordered array of top scores (descending by score).
    ScoreEntry[] public topScores;

    /// @notice Mapping from player address to their best score entry.
    mapping(address => ScoreEntry) public playerBestScores;

    /// @notice Whether a player has submitted at least one score.
    mapping(address => bool) public hasSubmitted;

    event ScoreSubmitted(
        address indexed player,
        uint256 score,
        uint256 wave,
        string heroId,
        uint256 timestamp
    );

    event NewTopScore(
        address indexed player,
        uint256 score,
        uint256 rank
    );

    /**
     * @notice Submit a new score. Must exceed the player's previous best.
     * @param score The score achieved.
     * @param wave The wave reached.
     * @param heroId The hero identifier used in the run.
     */
    function submitScore(uint256 score, uint256 wave, string calldata heroId) external {
        require(score > 0, "Score must be greater than zero");
        require(
            !hasSubmitted[msg.sender] || score > playerBestScores[msg.sender].score,
            "Score must exceed your previous best"
        );

        ScoreEntry memory entry = ScoreEntry({
            player: msg.sender,
            score: score,
            wave: wave,
            heroId: heroId,
            timestamp: block.timestamp
        });

        // Update player's personal best
        playerBestScores[msg.sender] = entry;
        hasSubmitted[msg.sender] = true;

        emit ScoreSubmitted(msg.sender, score, wave, heroId, block.timestamp);

        // Insert into top scores if qualified
        _insertTopScore(entry);
    }

    /**
     * @notice Get the top N scores.
     * @param count Number of scores to return (capped at topScores.length).
     * @return An array of ScoreEntry structs.
     */
    function getTopScores(uint256 count) external view returns (ScoreEntry[] memory) {
        uint256 length = count < topScores.length ? count : topScores.length;
        ScoreEntry[] memory result = new ScoreEntry[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = topScores[i];
        }
        return result;
    }

    /**
     * @notice Get a player's best score.
     * @param player The player address.
     * @return The player's best ScoreEntry.
     */
    function getPlayerBestScore(address player) external view returns (ScoreEntry memory) {
        return playerBestScores[player];
    }

    /**
     * @dev Insert a score entry into the sorted top scores array.
     *      Maintains descending order and caps at MAX_TOP_SCORES.
     */
    function _insertTopScore(ScoreEntry memory entry) internal {
        // Remove existing entry for this player if present
        uint256 existingIndex = type(uint256).max;
        for (uint256 i = 0; i < topScores.length; i++) {
            if (topScores[i].player == entry.player) {
                existingIndex = i;
                break;
            }
        }

        if (existingIndex != type(uint256).max) {
            // Remove old entry by shifting
            for (uint256 i = existingIndex; i < topScores.length - 1; i++) {
                topScores[i] = topScores[i + 1];
            }
            topScores.pop();
        }

        // Find insertion point (descending order)
        uint256 insertAt = topScores.length;
        for (uint256 i = 0; i < topScores.length; i++) {
            if (entry.score > topScores[i].score) {
                insertAt = i;
                break;
            }
        }

        // Check if score qualifies for top list
        if (insertAt >= MAX_TOP_SCORES) {
            return;
        }

        // Insert the entry
        topScores.push(entry); // expand array
        // Shift elements right from the end
        for (uint256 i = topScores.length - 1; i > insertAt; i--) {
            topScores[i] = topScores[i - 1];
        }
        topScores[insertAt] = entry;

        // Trim to MAX_TOP_SCORES
        while (topScores.length > MAX_TOP_SCORES) {
            topScores.pop();
        }

        emit NewTopScore(entry.player, entry.score, insertAt + 1);
    }
}
