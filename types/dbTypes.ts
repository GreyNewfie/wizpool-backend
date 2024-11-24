// Represents raw SQL result for pool-players relationship
export interface PoolPlayersData {
	pool_id: string;
	pool_name: string;
	player_id: string;
	player_team_name: string;
}

// Represents raw SQL result for player-teams relationship
export interface PlayerTeamsData {
	player_id: string;
	team_key: string;
	pool_id: string;
}

// Type for flat data returned by the SQL query
export interface FlatData {
	pool_id: string;
	pool_name: string;
	league: string;
	date_updated: string;
	date_created: string;
	player_id: string;
	player_name: string;
	player_team_name: string;
	team_key: string;
	user_id: string;
}

// Type for extra league data
export interface LeagueData {
	key: string;
	wins: number;
	losses: number;
	conference: string;
	division: string;
	city: string;
	name: string;
	date_updated: string;
}
