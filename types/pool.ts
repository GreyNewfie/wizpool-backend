export interface PoolData {
	id: string;
	name: string;
	league: string;
}

export interface PlayerData {
	id: string;
	name: string;
}

export interface PoolPlayersData {
	pool_id: string;
	pool_name: string;
	player_id: string;
	player_team_name: string;
}
