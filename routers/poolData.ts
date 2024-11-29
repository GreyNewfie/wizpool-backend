import { Router, Request, Response } from 'express';
import { turso } from '../db';
import { PoolData } from '../types';
import { AuthenticatedRequest } from '../types/index';

const router = Router();

// Formate date to YYYY-MM-DD HH:MM:SS
function formatISODate(isoDateString: string) {
	return isoDateString.replace('T', ' ').split('.')[0];
}

router.post('/', async (req, res) => {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.auth.userId) {
	  return res.status(401).json({ error: 'Unauthorized' });
	}

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

router.get('/:poolId', async (req: Request, res: Response) => {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.auth.userId) {
	  return res.status(401).json({ error: 'Unauthorized' });
	}

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

router.get('/user/:userId', async (req: Request, res: Response) => {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.auth.userId) {
	  return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const { userId } = req.params;

		if (!userId)
			return res.status(400).send('A user ID is required to get user pools');

		// Get all pools for the user
		const userPoolsResult = await turso.execute({
			sql: 'SELECT * FROM pools WHERE id IN (SELECT pool_id FROM user_pools WHERE user_id = ?)',
			args: [userId],
		});

		// If no pools are found for the user, return an empty array
		if (userPoolsResult.rows.length === 0)
			return res
				.status(200)
				.json({ message: 'No pools found for user', pools: [] });

		// Get all pools for the user
		const pools = await userPoolsResult.rows.map((pool) => ({
			id: String(pool.id),
			name: String(pool.name),
			league: String(pool.league),
			dateUpdated: String(pool.date_updated),
			dateCreated: String(pool.date_created),
		}));

		res.status(200).json(pools);
	} catch (error) {
		console.error('Error retrieving user pools from database: ', error);
		res.status(500);
	}
});

export default router;
