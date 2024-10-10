require('dotenv').config();
import { Router } from 'express';
import processData from '../services/dataProcessor';
import { turso } from '../db';
import { ProcessedTeamData } from '../types/processedTeamData';

const router = Router();

router.get('/', async (req, res) => {
	try {
		// Ensure typescript knows that process.env.NBA_API_URL is a string & not undefined
		if (!process.env.NBA_API_URL)
			throw new Error('NBA_API_URL environment variable is not set');

		// Check if there is existing data in the database
		const existingData = await turso.execute({
			sql: 'SELECT * FROM nba_data',
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
					console.log('NBA data is up to date and retrieved from db');
					return;
				}
			} else {
				// Handle the case where lastUpdate is not a string
				console.warn('lastUpdate is not a string: ', lastUpdate);
			}
		}
		// If data doesn't exist or is outdated, fetch new data from external API and update the database
		const nbaData = await processData('nba', process.env.NBA_API_URL);
		if (!nbaData) {
			res.status(500).send('NBA database query failed');
			return;
		}

		// Clear old data from the database
		await turso.execute({
			sql: 'DELETE FROM nba_data',
			args: [],
		});

		// Insert new NBA data into the database
		for (const team of nbaData) {
			try {
				await turso.execute({
					sql: 'INSERT INTO nba_data (key, city, name, conference, division, wins, losses) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
				console.error('Database INSERT query failed: ', error);
				res.status(500).send('NBA database INSERT query failed');
				return;
			}
		}
		console.log('NBA data is updated and stored in db');
		res.status(200).json(nbaData);
	} catch (error) {
		console.error('Error fetching NBA data: ', error);
		throw new Error('Error fetching NBA data');
	}
});

export default router;
