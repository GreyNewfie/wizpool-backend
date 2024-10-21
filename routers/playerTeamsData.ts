import { Router } from 'express';
import { turso } from '../db';
import { PlayerTeamsData } from '../types/pool';

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

export default router;
