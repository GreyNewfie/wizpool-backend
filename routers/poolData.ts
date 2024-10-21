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

export default router;
