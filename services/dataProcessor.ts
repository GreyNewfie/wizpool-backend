import fetchExternalData from './externalApiService';
import { NBATeamData, NFLTeamData } from '../types/team';
import { ProcessedTeamData } from '../types/processedTeamData';

export default async function processData(
	league: string,
	apiUrl: string
): Promise<ProcessedTeamData[]> {
	const rawData: NBATeamData[] | NFLTeamData[] =
		await fetchExternalData(apiUrl);
	let processedData: ProcessedTeamData[] = [];

	if (league === 'nba') {
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
	}

	if (league === 'nfl') {
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
	}

	return processedData;
}
