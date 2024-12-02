import { Router, Request, Response } from 'express';
import { turso } from '../db';
import getLeagueData from '../services/leagueDataService';
import { FlatData, LeagueData, Team } from '../types';
import { AuthenticatedRequest } from '../types/auth';

interface PoolPlayer {
  id: string;
  teamName: string;
  teams: any[];
}

interface CompletePoolData {
  id: string;
  name: string;
  league: string;
  dateUpdated: string;
  dateCreated: string;
  players: {
    id: string;
    name: string;
    teamName?: string;
    teams: { key: string }[];
  }[];
  userId: string;
}

const router = Router();

router.get('/:poolId', 
  async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { userId } = authReq.auth;
  console.log('User ID:', userId);

  try {
    const { poolId } = req.params;

    if (!poolId) {
      return res
        .status(400)
        .send('A Pool ID is required in order to get complete pool data');
    }

    // Fetch all pool data from the database
    const combinedQuery = `
    SELECT 
      pools.id AS pool_id,
      pools.name AS pool_name,
      pools.league,
      pools.date_updated,
      pools.date_created,
      pool_players.player_id,
      players.name AS player_name,
      pool_players.player_team_name,
      player_teams.team_key,
      user_pools.user_id
    FROM 
      pools
    LEFT JOIN 
      pool_players ON pools.id = pool_players.pool_id
    LEFT JOIN 
      players ON pool_players.player_id = players.id
    LEFT JOIN 
      player_teams ON players.id = player_teams.player_id AND player_teams.pool_id = pools.id
    LEFT JOIN 
      user_pools ON pools.id = user_pools.pool_id
    WHERE 
      pools.id = ?;
    `;
    const result = await turso.execute({
      sql: combinedQuery,
      args: [poolId],
    });

    // Handle missing pool
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: `Pool with id ${poolId} not found` });
    }

    const flatData: FlatData[] = result.rows.map((row) => ({
      pool_id: String(row.pool_id),
      pool_name: String(row.pool_name),
      league: String(row.league),
      date_updated: String(row.date_updated),
      date_created: String(row.date_created),
      player_id: String(row.player_id),
      player_name: String(row.player_name),
      player_team_name: String(row.player_team_name),
      team_key: String(row.team_key),
      user_id: String(row.user_id),
    }));

    const transformToNestedStructure = (
      flatData: FlatData[],
      leagueData: LeagueData[]
    ) => {
      const playerMap = new Map();

      flatData.forEach((row: any) => {
        // Add player if not already in the map
        if (!playerMap.has(row.player_id)) {
          playerMap.set(row.player_id, {
            id: row.player_id,
            name: row.player_name,
            teamName: row.player_team_name,
            teams: [],
          });
        }

        // Add league data to team then add to player
        if (row.team_key) {
          const teamData = leagueData.find((data) => data.key === row.team_key);

          if (!teamData)
            console.error(`No team data for team with key ${row.team_key}`);

          playerMap.get(row.player_id)?.teams.push({
            key: row.team_key,
            wins: teamData?.wins,
            losses: teamData?.losses,
            conference: teamData?.conference,
            division: teamData?.division,
            city: teamData?.city,
            name: teamData?.name,
          });
        }
      });

      // Add total wins to player
      const playersWithTotalWinsLosses = Array.from(playerMap.values()).map(
        (player) => {
          const totalWins = player.teams.reduce(
            (total: number, team: Team) => total + team.wins,
            0
          );
          const totalLosses = player.teams.reduce(
            (total: number, team: Team) => total + team.wins,
            0
          );

          return { ...player, totalWins: totalWins, totalLosses: totalLosses };
        }
      );

      // Create the complete pool data object
      const completePoolData: CompletePoolData = {
        id: flatData[0].pool_id,
        name: flatData[0].pool_name,
        league: flatData[0].league,
        dateUpdated: flatData[0].date_updated,
        dateCreated: flatData[0].date_created,
        players: playersWithTotalWinsLosses,
        userId: flatData[0].user_id,
      };

      return completePoolData;
    };

    const leagueData = await getLeagueData(String(result.rows[0].league));

    const completePoolData = transformToNestedStructure(flatData, leagueData);

    res.status(200).json(completePoolData);
  } catch (error) {
    console.error('Error retrieving complete pool data from database:', error);
    res.status(500).json({
      error: 'Failed to retrieve complete pool data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/', async (req, res) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const poolData = req.body as CompletePoolData;

    if (
      !poolData.id ||
      !poolData.name ||
      !poolData.league ||
      !poolData.players ||
      !poolData.userId
    ) {
      return res.status(400).json({
        error: 'Pool id, name, league, players, and userId are required',
      });
    }

    // Format date for database
    const dateUpdated = new Date()
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];

    // Begin Turso transaction
    const transaction = await turso.transaction('write');

    try {
      // 1. Insert pool data
      await transaction.execute({
        sql: 'INSERT INTO pools (id, name, league, date_updated) VALUES (?, ?, ?, ?)',
        args: [poolData.id, poolData.name, poolData.league, dateUpdated],
      });

      // 2. Insert all players
      for (const player of poolData.players) {
        // Insert player if not already in database
        await transaction.execute({
          sql: 'INSERT OR IGNORE INTO players (id, name) VALUES (?, ?)',
          args: [player.id, player.name],
        });
      }

      // 3. Then create pool_player relationship and team assignments
      for (const player of poolData.players) {
        await transaction.execute({
          sql: 'INSERT INTO pool_players (pool_id, pool_name, player_id, player_team_name) VALUES (?, ?, ?, ?)',
          args: [poolData.id, poolData.name, player.id, player.teamName || ''],
        });

        // Insert each player's teams
        for (const team of player.teams) {
          await transaction.execute({
            sql: 'INSERT INTO player_teams (player_id, team_key, pool_id) VALUES (?, ?, ?)',
            args: [player.id, team.key, poolData.id],
          });
        }
      }

      // 4. Insert user_pools relationship
      await transaction.execute({
        sql: 'INSERT INTO user_pools (user_id, pool_id) VALUES (?, ?)',
        args: [poolData.userId, poolData.id],
      });

      // Commit transaction
      await transaction.commit();

      res.status(201).json({
        message: 'Complete pool data stored successfully',
        poolId: poolData.id,
      });
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      throw error;
    } finally {
      // Always close transaction
      await transaction.close();
    }
  } catch (error) {
    console.error('Error storing complete pool data:', error);
    res.status(500).json({
      error: 'failed to store complete pool data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
