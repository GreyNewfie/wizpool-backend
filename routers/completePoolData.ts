import { Router } from 'express';
import { turso } from '../db';
import { CompletePoolData, PlayerData } from '../types/pool';

const router = Router();

interface PoolPlayer {
	id: string;
	teamName: string;
	teams: any[];
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
		const [poolResult, poolPlayersResult, playersResult, playerTeamsResult] =
			await Promise.all([
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
					const player = playersResult.rows.find(
						(p) => p.id === poolPlayer.player_id
					);

					if (!player) {
						console.error(
							`Player with id ${poolPlayer.player_id} not found in players table`
						);
						return null; // Return null to indicate missing player
					}

					return {
						id: String(player.id),
						name: String(player.name),
					};
				})
				.filter((player): player is PlayerData => player !== null), // Use type assertion to filter out null values
			teams: playerTeamsResult.rows.map((team) => ({
				key: String(team.team_key),
			})),
		};
		res.status(200).json(completePoolData);
	} catch (error) {
		console.error('Error retrieving complete pool data from database:', error);
		res.status(500).json({ message: 'Failed to retrieve complete pool data' });
	}
});

export default router;
