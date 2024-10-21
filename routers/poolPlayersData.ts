import { Router } from 'express';
import { turso } from '../db';
import { PoolPlayersData } from '../types/pool';

const router = Router();

router.post('/', async (req, res) => {
	try {
		const { pool_id, pool_name, player_id, player_team_name } =
			req.body as PoolPlayersData;

		if (!pool_id || !pool_name || !player_id || !player_team_name) {
			return res
				.status(400)
				.send(
					'Player id, player team name, pool id, and pool name are required'
				);
		}

		await turso.execute({
			sql: 'INSERT INTO pool_players (pool_id, pool_name, player_id, player_team_name ) VALUES (?, ?, ?, ?)',
			args: [pool_id, pool_name, player_id, player_team_name],
		});

		console.log(
			`Pool ${pool_name} player ${player_team_name} has been added to pool_players table`
		);
		res
			.status(201)
			.json({
				message: `Pool ${pool_name} player ${player_team_name} added successfully`,
			});
	} catch (error) {
		console.log('Error adding pool and player to database: ', error);
		console.log('Pool and player data that failed to add: ', req.body);

		res
			.status(500)
			.json({ error: 'Failed to add pool and player to database' });
	}
});

export default router;
