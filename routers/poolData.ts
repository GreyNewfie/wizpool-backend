import { Router, Request, Response } from 'express';
import { turso } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
	try {
		const { id, name, league } = req.body;

		if (!id || !name || !league) {
			return res.status(400).send('An id, name, and league are required');
		}

		const dateUpdated = new Date().toISOString();

		await turso.execute({
			sql: 'INSERT INTO pools (id, name, league, date_updated) VALUES (?, ?, ?, ?)',
			args: [id, name, league, dateUpdated],
		});

		console.log(`Pool ${name} added to database`);
		res.status(200).json({ message: 'Pool created successfully' });
	} catch (error) {
		console.log('Error adding pool to database: ', error);
		res.status(500).json({ error: 'Failed to add pool' });
	}
});

export default router;
