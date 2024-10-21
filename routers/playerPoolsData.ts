import { Router } from 'express';
import { turso } from '../db';
import { PlayerPoolData } from '../types/pool';

const router = Router();

router.post('/', async (req, res) => {
	try {
		const { player_id, player_team_name, pool_id, pool_name } =
			req.body as PlayerPoolData;

		if (!player_id || !player_team_name || !pool_id || !pool_name) {
			return res
				.status(400)
				.send(
					'Player id, player team name, pool id, and pool name are required'
				);
		}

		await turso.execute({
			sql: 'INSERT INTO player_pools (player_id, player_team_name, pool_id, pool_name) VALUES (?, ?, ?, ?)',
			args: [player_id, player_team_name, pool_id, pool_name],
		});

		console.log(
			`Player's team ${player_team_name} in pool ${pool_name} added to database`
		);
		res
			.status(201)
			.json({ message: `Player's team and pool added successfully` });
	} catch (error) {
		console.log('Error adding player and pool to database: ', error);
		console.log('Player and pool data that failed to add: ', req.body);

		res
			.status(500)
			.json({ error: 'Failed to add player and pool to database' });
	}
});

export default router;
