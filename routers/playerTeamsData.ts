import { Router } from 'express';
import { turso } from '../db';
import { PlayerTeamsData } from '../types';

const router = Router();

router.post('/', async (req, res) => {
	try {
		const { player_id, team_key, pool_id } = req.body as PlayerTeamsData;

		if (!player_id || !team_key || !pool_id) {
			return res
				.status(400)
				.send('Player id, team key, and pool id are required');
		}

		await turso.execute({
			sql: 'INSERT INTO player_teams (player_id, team_key, pool_id) VALUES (?, ?, ?)',
			args: [player_id, team_key, pool_id],
		});

		res.status(200).json({
			message: `Player ${player_id} team ${team_key} was successfully stored to player_pools table`,
		});
	} catch (error) {
		console.log("Error adding player's teams to database: ", error);
		console.log("Player's teams that failed to add: ", req.body);

		res
			.status(500)
			.json({ error: 'Failed to add pool and player to database' });
	}
});

router.get('/:playerId', async (req, res) => {
	try {
		const { playerId } = req.params;

		if (!playerId) {
			return res
				.status(400)
				.send('A Player ID is required in order to get player teams');
		}

		const result = await turso.execute({
			sql: 'SELECT * FROM player_teams WHERE player_id = ?',
			args: [playerId],
		});

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Player teams not found' });
		}

		const playerTeams = result.rows;
		res.status(200).json(playerTeams);
	} catch (error) {
		console.log('Error retrieving player teams from database: ', error);
		res.status(500).json({ message: 'Failed to retrieve player teams' });
	}
});

export default router;
