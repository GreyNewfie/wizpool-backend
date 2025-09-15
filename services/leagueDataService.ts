import { turso } from '../db';
import processData from './dataProcessor';
import { LeagueData, ProcessedTeamData } from '../types';
import { nflTeams, nbaTeams, mlbTeams } from '../data/teamsCatalog';

export default async function getLeagueData(
	league: string
): Promise<LeagueData[]> {
	try {
		const existingData = await turso.execute({
			sql: `SELECT * FROM ${league}_data`,
			args: [],
		});

		// Cast the rows to LeagueData[]
		const existingLeagueData: LeagueData[] = existingData.rows.map(
			(row: any) => ({
				key: row.key,
				city: row.city,
				name: row.name,
				conference: row.conference,
				division: row.division,
				wins: row.wins,
				losses: row.losses,
				date_updated: row.date_updated,
			})
		);

		// If there is existing data check if it was updated today
		if (existingLeagueData.length > 0) {
			const lastUpdate = existingLeagueData[0].date_updated;
			console.log('Last Update:', lastUpdate);

			let lastUpdatedMs: number | null = null;
			if (typeof lastUpdate === 'string') {
				// Normalize common DB timestamp format "YYYY-MM-DD HH:MM:SS" to ISO-like for parsing
				const normalized = lastUpdate.replace(' ', 'T');
				const parsed = Date.parse(normalized);
				if (!Number.isNaN(parsed)) lastUpdatedMs = parsed;
			}

			if (lastUpdatedMs !== null) {
				const now = Date.now();
				const HOUR_MS = 60 * 60 * 1000;
				if (now - lastUpdatedMs < HOUR_MS) {
					console.log('League data is fresh (<1 hour); serving from db');
					return existingLeagueData;
				}
			}
		}

		// If reach here data doesn't exist or is outdated, fetch new data from external API and update the database
		let apiUrl = process.env[`${league.toUpperCase()}_API_URL`];
		if (!apiUrl)
			throw new Error(
				`${league.toUpperCase()}_API_URL environment variable is not set`
			);

		// Determine season year using an August-July window.
		// Example: Aug 2024 - Jul 2025 => 2024; Aug 2025 - Jul 2026 => 2025
		function getSeasonYear(d: Date): number {
			const year = d.getFullYear();
			const month = d.getMonth(); // 0=Jan, 7=Aug
			return month >= 7 ? year : year - 1;
		}

		// TODO: Support past seasons by storing season-specific snapshots in DB.
		// For now, derive season year from the current date (Aug–Jul window).
		const seasonYear = getSeasonYear(new Date());

		// Allow two ways to specify the API URL:
		// 1) Use a placeholder token {SEASON} in the env url to be replaced (preferred)
		// 2) If the URL contains a concrete Standings/<year>, replace the year with the computed seasonYear
		if (apiUrl.includes('{SEASON}')) {
			apiUrl = apiUrl.replace('{SEASON}', String(seasonYear));
		} else {
			apiUrl = apiUrl.replace(/(Standings\/)\d{4}/, `$1${seasonYear}`);
		}

		// Fetch and process new data
		const newData: ProcessedTeamData[] = await processData(league, apiUrl);
		if (!newData)
			throw new Error(`${league.toUpperCase()} data processing failed`);

		// If the external API returned success but no teams (preseason/offseason),
		// return our static catalog instead of writing empties to the DB.
		if (Array.isArray(newData) && newData.length === 0) {
			const todayEmpty = new Date().toLocaleDateString('en-US');
			const catalogEmptyCase: ProcessedTeamData[] = (() => {
				switch (league.toLowerCase()) {
					case 'nfl':
						return nflTeams;
					case 'nba':
						return nbaTeams;
					case 'mlb':
						return mlbTeams;
					default:
						return [];
				}
			})();

			if (catalogEmptyCase.length > 0) {
				function mapProcessTeamDatatoLeagueData(
					processedTeamData: ProcessedTeamData[],
					dateUpdated: string
				): LeagueData[] {
					return processedTeamData.map((team) => ({
						...team,
						date_updated: dateUpdated,
					}));
				}

				console.warn(
					`External data empty for ${league.toUpperCase()}; serving fallback teams catalog.`,
				);
				return mapProcessTeamDatatoLeagueData(catalogEmptyCase, todayEmpty);
			}
		}

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

		function mapProcessTeamDatatoLeagueData(
			processedTeamData: ProcessedTeamData[],
			dateUpdated: string
		): LeagueData[] {
			return processedTeamData.map((team) => ({
				...team,
				date_updated: dateUpdated,
			}));
		}

		const today = new Date().toLocaleDateString('en-US');
		const leagueData = mapProcessTeamDatatoLeagueData(newData, today);

		console.log(`${league.toUpperCase()} data is updated and stored in db`);
		// Return the new data
		return leagueData;
	} catch (error) {
		console.error(`Error in getLeagueData for ${league}:`, error);

		// Fallback: return a static, season-agnostic teams catalog.
		// This supports the Draft page when seasonal data is unavailable (e.g., preseason).
		const today = new Date().toLocaleDateString('en-US');

		const catalog: ProcessedTeamData[] = (() => {
			switch (league.toLowerCase()) {
				case 'nfl':
					return nflTeams;
				case 'nba':
					return nbaTeams;
				case 'mlb':
					return mlbTeams;
				default:
					return [];
			}
		})();

		if (catalog.length > 0) {
			function mapProcessTeamDatatoLeagueData(
				processedTeamData: ProcessedTeamData[],
				dateUpdated: string
			): LeagueData[] {
				return processedTeamData.map((team) => ({
					...team,
					date_updated: dateUpdated,
				}));
			}

			console.warn(
				`Returning fallback ${league.toUpperCase()} teams catalog due to missing/empty seasonal data.`,
			);
			return mapProcessTeamDatatoLeagueData(catalog, today);
		}

		// If no catalog exists, rethrow to preserve error behavior
		throw error;
	}
}
