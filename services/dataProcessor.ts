import fetchExternalData from './externalApiService';
import { NBATeamData, NFLTeamData, MLBTeamData } from '../types/team';
import { ProcessedTeamData } from '../types/processedTeamData';

export default async function processData(
	league: string,
	apiUrl: string
): Promise<ProcessedTeamData[]> {
	const rawData: NBATeamData[] | NFLTeamData[] | MLBTeamData[] =
		await fetchExternalData(apiUrl);
	let processedData: ProcessedTeamData[] = [];

	// Process data based on league
	switch (league) {
		case 'nba':
			const nbaData = rawData as NBATeamData[];
			processedData = nbaData.map((team) => {
				return {
					key: team.Key,
					city: team.City,
					name: team.Name,
					conference: team.Conference,
					division: team.Division,
					wins: team.Wins,
					losses: team.Losses,
				};
			});
			break;
		case 'nfl':
			const nflData = rawData as NFLTeamData[];
			processedData = nflData.map((team) => {
				const lastSpaceIndex = team.Name.lastIndexOf(' ');
				const city = team.Name.substring(0, lastSpaceIndex);
				const name = team.Name.substring(lastSpaceIndex + 1);
				return {
					key: team.Team,
					city: city,
					name: name,
					conference: team.Conference,
					division: team.Division,
					wins: team.Wins,
					losses: team.Losses,
				};
			});
			break;
		case 'mlb':
			const mlbData = rawData as MLBTeamData[];
			processedData = mlbData.map((team) => {
				return {
					key: team.Key,
					city: team.City,
					name: team.Name,
					conference: team.League,
					division: team.Division,
					wins: team.Wins,
					losses: team.Losses,
				};
			});
			break;
		default:
			console.warn('Unable to process data for the specified league: ', league);
	}

	return processedData;
}
