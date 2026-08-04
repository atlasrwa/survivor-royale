// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RankedLeaderboard
 * @notice On-chain ranked ELO leaderboard for Survivor Royale.
 * @dev Stores ELO ratings per player per season. Only the owner (server)
 *      can update ratings after server-side validation.
 */
contract RankedLeaderboard {
    // ═══════════════════════════════════════════════════════
    // Types
    // ═══════════════════════════════════════════════════════

    struct PlayerRating {
        uint256 rating;
        uint256 peakRating;
        uint256 gamesPlayed;
        uint256 lastUpdated;
    }

    struct SeasonEntry {
        address player;
        uint256 rating;
    }

    // ═══════════════════════════════════════════════════════
    // State
    // ═══════════════════════════════════════════════════════

    address public owner;
    uint256 public currentSeason;

    /// @notice Current rating data per player (across all seasons).
    mapping(address => PlayerRating) public playerRatings;

    /// @notice Season-specific ratings: season => player => rating.
    mapping(uint256 => mapping(address => uint256)) public seasonRatings;

    /// @notice Sorted array of top players per season (descending by rating).
    mapping(uint256 => SeasonEntry[]) public seasonTopList;

    /// @notice Maximum entries stored in the season top list.
    uint256 public constant MAX_SEASON_TOP = 100;

    /// @notice Default starting rating for new players.
    uint256 public constant BASE_RATING = 1000;

    // ═══════════════════════════════════════════════════════
    // Events
    // ═══════════════════════════════════════════════════════

    event RatingUpdated(
        address indexed player,
        uint256 oldRating,
        uint256 newRating,
        uint256 season
    );

    event SeasonAdvanced(uint256 oldSeason, uint256 newSeason);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ═══════════════════════════════════════════════════════
    // Modifiers
    // ═══════════════════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "RankedLeaderboard: caller is not the owner");
        _;
    }

    // ═══════════════════════════════════════════════════════
    // Constructor
    // ═══════════════════════════════════════════════════════

    constructor() {
        owner = msg.sender;
        currentSeason = 1;
    }

    // ═══════════════════════════════════════════════════════
    // Owner Functions
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Transfer ownership to a new address.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RankedLeaderboard: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Advance to a new season.
     * @param newSeason The new season ID.
     */
    function advanceSeason(uint256 newSeason) external onlyOwner {
        require(newSeason > currentSeason, "RankedLeaderboard: season must advance");
        uint256 oldSeason = currentSeason;
        currentSeason = newSeason;
        emit SeasonAdvanced(oldSeason, newSeason);
    }

    /**
     * @notice Update a player's ELO rating. Only callable by the owner (server).
     * @param player The player's address.
     * @param newRating The new ELO rating after server-side validation.
     * @param season The season in which this update occurs.
     */
    function updateRating(
        address player,
        uint256 newRating,
        uint256 season
    ) external onlyOwner {
        require(player != address(0), "RankedLeaderboard: player is zero address");
        require(season == currentSeason, "RankedLeaderboard: invalid season");

        PlayerRating storage pr = playerRatings[player];
        uint256 oldRating = pr.rating;

        // Initialize new player
        if (pr.gamesPlayed == 0 && pr.rating == 0) {
            pr.rating = BASE_RATING;
            oldRating = BASE_RATING;
        }

        pr.rating = newRating;
        pr.gamesPlayed += 1;
        pr.lastUpdated = block.timestamp;

        // Track peak rating
        if (newRating > pr.peakRating) {
            pr.peakRating = newRating;
        }

        // Update season rating
        seasonRatings[season][player] = newRating;

        // Update season top list
        _updateSeasonTopList(season, player, newRating);

        emit RatingUpdated(player, oldRating, newRating, season);
    }

    // ═══════════════════════════════════════════════════════
    // View Functions
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Get a player's current ELO rating.
     * @param player The player's address.
     * @return The player's current rating (BASE_RATING if never played).
     */
    function getPlayerRating(address player) external view returns (uint256) {
        PlayerRating storage pr = playerRatings[player];
        if (pr.gamesPlayed == 0 && pr.rating == 0) {
            return BASE_RATING;
        }
        return pr.rating;
    }

    /**
     * @notice Get a player's full rating data.
     * @param player The player's address.
     * @return rating Current rating
     * @return peakRating Highest rating achieved
     * @return gamesPlayed Total ranked games
     * @return lastUpdated Timestamp of last rating update
     */
    function getPlayerRatingFull(address player)
        external
        view
        returns (
            uint256 rating,
            uint256 peakRating,
            uint256 gamesPlayed,
            uint256 lastUpdated
        )
    {
        PlayerRating storage pr = playerRatings[player];
        if (pr.gamesPlayed == 0 && pr.rating == 0) {
            return (BASE_RATING, 0, 0, 0);
        }
        return (pr.rating, pr.peakRating, pr.gamesPlayed, pr.lastUpdated);
    }

    /**
     * @notice Get the top players by ELO for a specific season.
     * @param season The season ID to query.
     * @param count Number of top entries to return (capped at stored length).
     * @return An array of SeasonEntry structs (player, rating).
     */
    function getSeasonTopRatings(uint256 season, uint256 count)
        external
        view
        returns (SeasonEntry[] memory)
    {
        SeasonEntry[] storage topList = seasonTopList[season];
        uint256 length = count < topList.length ? count : topList.length;
        SeasonEntry[] memory result = new SeasonEntry[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = topList[i];
        }
        return result;
    }

    /**
     * @notice Get the number of entries in a season's top list.
     * @param season The season ID.
     * @return The count of players in the season top list.
     */
    function getSeasonTopCount(uint256 season) external view returns (uint256) {
        return seasonTopList[season].length;
    }

    // ═══════════════════════════════════════════════════════
    // Internal Functions
    // ═══════════════════════════════════════════════════════

    /**
     * @dev Update the sorted season top list for a player.
     *      Maintains descending order by rating, capped at MAX_SEASON_TOP.
     */
    function _updateSeasonTopList(
        uint256 season,
        address player,
        uint256 newRating
    ) internal {
        SeasonEntry[] storage topList = seasonTopList[season];

        // Remove existing entry for this player if present
        uint256 existingIndex = type(uint256).max;
        for (uint256 i = 0; i < topList.length; i++) {
            if (topList[i].player == player) {
                existingIndex = i;
                break;
            }
        }

        if (existingIndex != type(uint256).max) {
            // Remove by shifting
            for (uint256 i = existingIndex; i < topList.length - 1; i++) {
                topList[i] = topList[i + 1];
            }
            topList.pop();
        }

        // Find insertion point (descending order)
        uint256 insertAt = topList.length;
        for (uint256 i = 0; i < topList.length; i++) {
            if (newRating > topList[i].rating) {
                insertAt = i;
                break;
            }
        }

        // Check if rating qualifies for top list
        if (insertAt >= MAX_SEASON_TOP) {
            return;
        }

        // Insert the entry
        SeasonEntry memory entry = SeasonEntry({
            player: player,
            rating: newRating
        });

        topList.push(entry); // expand array
        // Shift elements right from the end
        for (uint256 i = topList.length - 1; i > insertAt; i--) {
            topList[i] = topList[i - 1];
        }
        topList[insertAt] = entry;

        // Trim to MAX_SEASON_TOP
        while (topList.length > MAX_SEASON_TOP) {
            topList.pop();
        }
    }
}
