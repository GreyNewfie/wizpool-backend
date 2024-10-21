import { Router } from 'express';
import { PlayerData } from '../types/pool';
import { turso } from '../db';

const router = Router();

router.post('/', async (req, res) => {
	try {
		const { id, name } = req.body as PlayerData;

		if (!id || !name) {
			return res.status(400).send('Player id and name are required');
		}

		turso.execute({
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

export default router;
