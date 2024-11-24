import { Router } from 'express';
import { turso } from '../db';
import { PoolPlayersData } from '../types';
import { log } from 'console';

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
		res.status(201).json({
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

router.get('/:poolId', async (req, res) => {
	try {
		const { poolId } = req.params;

		if (!poolId)
			return res
				.status(400)
				.send('A Pool ID is required in order to get pool players');

		const result = await turso.execute({
			sql: 'SELECT * FROM pool_players WHERE pool_id = ?',
			args: [poolId],
		});

		if (result.rows.length === 0)
			return res
				.status(404)
				.json({ error: `Players for pool ${poolId} not found` });

		const poolPlayers = result.rows;
		res.status(200).json(poolPlayers);
	} catch (error) {
		console.log('Error retrieving pool players from database: ', error);
		res.status(500).json({ message: 'Failed to retrieve pool players' });
	}
});

export default router;
