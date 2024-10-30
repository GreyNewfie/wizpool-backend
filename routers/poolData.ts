import { Router } from 'express';
import { turso } from '../db';
import { PoolData } from '../types/pool';

const router = Router();

// Formate date to YYYY-MM-DD HH:MM:SS
function formatISODate(isoDateString: string) {
	return isoDateString.replace('T', ' ').split('.')[0];
}

router.post('/', async (req, res) => {
	try {
		const { id, name, league } = req.body as PoolData;

		if (!id || !name || !league) {
			return res.status(400).send('An id, name, and league are required');
		}

		const dateUpdated = formatISODate(new Date().toISOString());

		await turso.execute({
			sql: 'INSERT INTO pools (id, name, league, date_updated) VALUES (?, ?, ?, ?)',
			args: [id, name, league, dateUpdated],
		});

		console.log(`Pool ${name} added to database`);
		res.status(201).json({ message: `Pool ${name} created successfully` });
	} catch (error) {
		console.log('Error adding pool to database: ', error);
		console.log('Pool data that failed to add: ', req.body);

		res.status(500).json({ error: 'Failed to add pool' });
	}
});

router.get('/:poolId', async (req, res) => {
	try {
		const { poolId } = req.params;

		if (!poolId)
			return res.status(400).send('A pool id is required to fetch pool by ID');

		const result = await turso.execute({
			sql: 'SELECT * FROM pools WHERE id = ?',
			args: [poolId],
		});

		if (result.rows.length === 0)
			return res
				.status(404)
				.json({ error: `Pool with id ${poolId} not found` });

		const pool = result.rows[0];

		res.status(200).json(pool);
	} catch (error) {
		console.log('Error retrieving the pool from the database: ', error);
		res.status(500).json({ message: 'Failed to retrieve pool' });
	}
});

export default router;
