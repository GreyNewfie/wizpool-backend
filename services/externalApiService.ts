import { NBATeamData, NFLTeamData, MLBTeamData } from '../types/team';

export default async function fetchExternalData(
	url: string
): Promise<NBATeamData[] | NFLTeamData[] | MLBTeamData[]> {
	try {
		const response: Response = await fetch(url);

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(
				`External API responded with ${response.status} ${response.statusText}: ${text?.slice(0, 200)}`,
			);
		}

		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			const snippet = (await response.text().catch(() => ''))?.slice(0, 200);
			throw new Error(
				`External API returned non-JSON content-type: ${contentType}. Body: ${snippet}`,
			);
		}

		const raw = (await response.json()) as unknown;

		// Normalize common shapes: either an array or wrapped under a property
		let data: unknown = raw;
		if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
			const obj = raw as Record<string, unknown>;
			// Try common wrappers
			if (Array.isArray(obj.data)) data = obj.data;
			else if (Array.isArray(obj.teams)) data = obj.teams;
			else if (Array.isArray(obj.Teams)) data = obj.Teams;
		}

		if (!Array.isArray(data)) {
			const sample = typeof raw === 'object' ? JSON.stringify(raw).slice(0, 200) : String(raw);
			throw new Error(
				`External API payload is not an array. Received type=${typeof raw}. Sample=${sample}`,
			);
		}

		return data as NBATeamData[] | NFLTeamData[] | MLBTeamData[];
	} catch (error) {
		console.error('Error fetching external data: ', error);
		throw new Error('Error fetching external data');
	}
}
