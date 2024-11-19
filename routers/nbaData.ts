require('dotenv').config();
import { Router } from 'express';
import getLeagueData from '../services/leagueDataService';

const router = Router();

router.get('/', async (req, res) => {
	try {
		const nflData = await getLeagueData('nba');
		res.status(200).json(nflData);
	} catch (error) {
		console.error('Error fetching NFL data: ', error);
		res.status(500).send('Error fetching NFL data');
	}
});

export default router;
