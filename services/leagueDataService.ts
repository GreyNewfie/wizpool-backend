import { turso } from '../db';
import processData from './dataProcessor';

export default async function getLeagueData(league: string) {
	try {
		const existingData = await turso.execute({
			sql: `SELECT * FROM ${league}_data`,
			args: [],
		});

		// If there is existing data check if it was updated today
		if (existingData.rows.length > 0) {
			const lastUpdate = existingData.rows[0].date_udpated;

			// Type guard to check if lastUpdated is a string to pass to new Date
			if (typeof lastUpdate === 'string') {
				const lastUpadtedDate = new Date(lastUpdate).toLocaleDateString(
					'en-US'
				);

				const today = new Date().toLocaleDateString('en-US');

				// If the data was updated today, return the existing data
				if (lastUpadtedDate === today) {
					console.log('League data is up to date and retrieved from db');
					return existingData.rows;
				}
			}
		}

		// If reach here data doesn't exist or is outdated, fetch new data from external API and update the database
		const apiUrl = process.env[`${league.toUpperCase()}_API_URL`];
		if (!apiUrl)
			throw new Error(
				`${league.toUpperCase()}_API_URL environment variable is not set`
			);

		// Fetch and process new data
		const newData = await processData(league, apiUrl);
		if (!newData)
			throw new Error(`${league.toUpperCase()} data processing failed`);

		// Clear old data from the database
		await turso.execute({
			sql: `DELETE FROM ${league}_data`,
			args: [],
		});

		// Insert new data into the database
		for (const team of newData) {
			await turso.execute({
				sql: `INSERT INTO ${league}_data (key, city, name, conference, division, wins, losses) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
		}

		console.log(`${league.toUpperCase()} data is updated and stored in db`);
		// Return the new data
		return newData;
	} catch (error) {
		console.error(`Error in getLeagueData for ${league}:`, error);
		throw error;
	}
}
