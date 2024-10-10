import { Router } from 'express';
import { turso } from '../db';
import processData from '../services/dataProcessor';
import { NFLTeamData } from '../types/team';

const router = Router();

router.get('/', async (req, res) => {
	try {
		// Ensure typescript knows that process.env.NFL_API_URL is a string & not undefined
		if (!process.env.NFL_API_URL)
			throw new Error('NFL_API_URL environment variable is not set');

		// Check if there is existing data in the database
		const existingData = await turso.execute({
			sql: 'SELECT * FROM nfl_data',
			args: [],
		});

		// If there is existing data check if the data was updated today
		if (existingData.rows.length > 0) {
			const lastUpdate = existingData.rows[0].date_updated;
			// Type guard to check if lastUpdate is a string to pass to new Date
			if (typeof lastUpdate === 'string') {
				const lastUpdatedDate = new Date(lastUpdate).toLocaleDateString(
					'en-US'
				);
				const today = new Date().toLocaleDateString('en-US');
				// If the data was updated today, return the existing data
				if (lastUpdatedDate === today) {
					res.status(200).json(existingData.rows);
					console.log('NFL data is up to date and retrieved from db');
					return;
				}
			} else {
				// Handle the case where lastUpdate is not a string
				console.warn('lastUpdate is not a string: ', lastUpdate);
			}
		}
		// If data doesn't exist or is outdated, fetch new data from external API and update the database
		const nflData = await processData('nfl', process.env.NFL_API_URL);
		if (!nflData) {
			res.status(500).send('NFL database query failed');
			return;
		}

		// Clear old data from the database
		await turso.execute({
			sql: 'DELETE FROM nfl_data',
			args: [],
		});

		for (const team of nflData) {
			try {
				await turso.execute({
					sql: 'INSERT INTO nfl_data (key, city, name, conference, division, wins, losses) VALUES (?, ?, ?, ?, ?, ?, ?)',
					args: [
						team.key,
						team.city,
						team.name,
						team.conference,
						team.division,
						team.wins,
						team.losses,
					],
				});
			} catch (error) {
				console.error('Database INSERT query failed for NFL data: ', error);
				res.status(500).send('NFL database INSERT query failed');
				return;
			}
		}
		console.log('NFL data is updated and stored in db');
		res.status(200).json(nflData);
	} catch (error) {
		console.error('Error fetching NFL data: ', error);
		throw new Error('Error fetching NFL data');
	}
});

export default router;
