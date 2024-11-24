import { Router } from 'express';
import { PlayerData } from '../types';
import { turso } from '../db';

const router = Router();

router.post('/', async (req, res) => {
	try {
		const { id, name } = req.body as PlayerData;

		if (!id || !name) {
			return res.status(400).send('Player id and name are required');
		}

		await turso.execute({
			sql: 'INSERT INTO players (id, name) VALUES (?, ?)',
			args: [id, name],
		});

		console.log(`Player ${name} added to database`);
		res.status(201).json({ message: `Player ${name} created successfully` });
	} catch (error) {
		console.log('Error adding player to database: ', error);
		console.log('Player data that failed to add: ', req.body);

		res.status(500).json({ error: 'Failed to add player' });
	}
});

router.get('/:playerId', async (req, res) => {
	try {
		const { playerId } = req.params;

		if (!playerId) return res.status(400).send('A player ID is required');

		const result = await turso.execute({
			sql: 'SELECT * FROM players WHERE id = ?',
			args: [playerId],
		});

		if (result.rows.length === 0)
			return res
				.status(404)
				.json({ error: `Player with ID ${playerId} not found` });

		const resultData = result.rows;
		res.status(200).json(resultData);
	} catch (error) {
		console.log(`Error trying to get player: `, error);
		res.status(500).json({ message: 'Failed to retrieve player' });
	}
});

export default router;
