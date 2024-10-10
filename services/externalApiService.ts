import { NBATeamData, NFLTeamData, MLBTeamData } from '../types/team';

export default async function fetchExternalData(
	url: string
): Promise<NBATeamData[] | NFLTeamData[] | MLBTeamData[]> {
	try {
		const response: Response = await fetch(url);
		const data: NBATeamData[] | NFLTeamData[] | MLBTeamData[] =
			await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching external data: ', error);
		throw new Error('Error fetching external data');
	}
}
