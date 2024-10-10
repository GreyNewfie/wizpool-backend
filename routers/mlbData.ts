import { Router } from 'express';
import { turso } from '../db';
import processData from '../services/dataProcessor';

const router = Router();

router.get('/', async (req, res) => {
	try {
		// Ensure typescript knows that process.env.MLB_API_URL is a string & not undefined
		if (!process.env.MLB_API_URL)
			throw new Error('MLB_API_URL environment variable is not set');

		// Check if there is existing data in the database
		const existingData = await turso.execute({
			sql: 'SELECT * FROM mlb_data',
			args: [],
		});

		// If there is existing data, check if the data was updated today
		if (existingData.rows.length > 0) {
			const lastUpdate = existingData.rows[0].date_updated;

			// Type guard to check if lastUpdate is a string to pass to new Date
			if (typeof lastUpdate === 'string') {
				const lastUpdatedDate = new Date(lastUpdate).toLocaleDateString(
					'en-US'
				);
				const today = new Date().toLocaleDateString('en-US');
				// If the data was updated today, return the existing data
				if (lastUpdatedDate) {
					res.status(200).json(existingData.rows);
					console.log('MLB data is up to date and retrieved from db');
					return;
				}
			} else {
				// Handle the case where lastUpdate is not a string
				console.warn('lastUpdate is not a string: ', lastUpdate);
			}
		}
		// If data doesn't exist or was updated yesterday, fetch new data
		const mlbData = await processData('mlb', process.env.MLB_API_URL);
		if (!mlbData) {
			res.status(500).send('MLB database query failed');
			return;
		}

		// Clear old data from the database
		await turso.execute({
			sql: 'DELETE FROM mlb_data',
			args: [],
		});

		// Inser new MlB data into the database
		for (const team of mlbData) {
			try {
				await turso.execute({
					sql: 'INSERT INTO mlb_data (key, city, name, conference, division, wins, losses) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
				res.status(500).send('MLB database INSERT query failed');
				return;
			}
		}
		console.log('MLB data is updated and stored in db');
		res.status(200).json(mlbData);
	} catch (error) {
		console.error('Error fetching MLB data: ', error);
		throw new Error('Error fetching MLB data');
	}
});

export default router;
