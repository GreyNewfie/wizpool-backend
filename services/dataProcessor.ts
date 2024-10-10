import fetchExternalData from './apiService';
import { TeamData } from '../types/team';
import { ProcessedTeamData } from '../types/processedTeamData';

export default async function processData(
	league: string,
	apiUrl: string
): Promise<ProcessedTeamData[]> {
	const rawData: TeamData[] = await fetchExternalData(apiUrl);
	let processedData: ProcessedTeamData[] = [];
	if (league === 'nba') {
		processedData = rawData.map((team) => {
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
	}

	return processedData;
}
