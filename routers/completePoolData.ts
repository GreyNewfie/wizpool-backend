import { Router } from 'express';
import { turso } from '../db';
import { PlayerData } from '../types/pool';

const router = Router();

interface PoolPlayer {
	id: string;
	teamName: string;
	teams: any[];
}

interface CompletePoolData {
	id: string;
	name: string;
	league: string;
	date_updated: string;
	date_created: string;
	players: {
		id: string;
		name: string;
		teamName?: string;
		teams: { key: string }[];
	}[];
	userId: string;
}

router.get('/:poolId', async (req, res) => {
	try {
		const { poolId } = req.params;

		if (!poolId) {
			return res
				.status(400)
				.send('A Pool ID is required in order to get complete pool data');
		}

		// Fetch all pool data from the database
		const [
			poolResult,
			poolPlayersResult,
			playersResult,
			playerTeamsResult,
			userPoolsResult,
		] = await Promise.all([
			turso.execute({
				sql: 'SELECT * FROM pools WHERE id = ?',
				args: [poolId],
			}),
			turso.execute({
				sql: 'SELECT * FROM pool_players WHERE pool_id = ?',
				args: [poolId],
			}),
			turso.execute({
				sql: 'SELECT * FROM players WHERE id IN (SELECT player_id FROM pool_players WHERE pool_id = ?)',
				args: [poolId],
			}),
			turso.execute({
				sql: 'SELECT * FROM player_teams WHERE player_id IN (SELECT player_id FROM pool_players WHERE pool_id = ?)',
				args: [poolId],
			}),
			turso.execute({
				sql: 'SELECT * FROM user_pools WHERE pool_id = ?',
				args: [poolId],
			}),
		]);

		// Handle missing pool
		if (poolResult.rows.length === 0) {
			return res
				.status(404)
				.json({ error: `Pool with id ${poolId} not found` });
		}

		// Create the complete pool object
		const pool = poolResult.rows[0];
		const completePoolData: CompletePoolData = {
			id: String(pool.id),
			name: String(pool.name),
			league: String(pool.league),
			date_updated: String(pool.date_updated),
			date_created: String(pool.date_created),
			players: poolPlayersResult.rows
				.map((poolPlayer) => {
					console.log('Pool player: ', poolPlayer);

					const player = playersResult.rows.find(
						(p) => p.id === poolPlayer.player_id
					);

					if (!player) {
						console.error(
							`Player with id ${poolPlayer.player_id} not found in players table`
						);
						return null; // Return null to indicate missing player
					}

					const playerTeams = playerTeamsResult.rows
						.filter((team) => team.player_id === player.id)
						.map((team) => ({
							key: String(team.team_key),
						}));

					return {
						id: String(player.id),
						name: String(player.name),
						teamName: String(poolPlayer.player_team_name) ?? '',
						teams: playerTeams,
					};
				})
				// Use type assertion to filter out null values
				.filter(
					(player): player is NonNullable<typeof player> => player !== null
				),
			userId: String(userPoolsResult.rows[0].user_id),
		};
		console.log('userPoolsResult: ', userPoolsResult.rows[0]);
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
