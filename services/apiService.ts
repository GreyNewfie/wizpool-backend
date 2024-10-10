import { TeamData } from '../types/team';

export default async function fetchExternalData(
	url: string
): Promise<TeamData[]> {
	try {
		const response: Response = await fetch(url);
		const data: TeamData[] = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching external data: ', error);
		throw new Error('Error fetching external data');
	}
}
