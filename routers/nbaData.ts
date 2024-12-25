require('dotenv').config();
import { Router } from 'express';
import getLeagueData from '../services/leagueDataService';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();

router.get('/', async (req, res) => {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.auth.userId) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const nflData = await getLeagueData('nba');
		res.status(200).json(nflData);
	} catch (error) {
		console.error('Error fetching NFL data: ', error);
		res.status(500).send('Error fetching NFL data');
	}
});

export default router;
