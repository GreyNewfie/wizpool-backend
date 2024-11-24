import { ProcessedTeamData } from './processedTeamData';

// Core pool data
export interface PoolData {
	id: string;
	name: string;
	league: string;
}

// Basic player data
export interface PlayerData {
	id: string;
	name: string;
}

// Represent a single team with league data
export interface Team {
	key: string;
	wins: number;
	losses: number;
	conference: string;
	division: string;
	city: string;
	name: string;
}

// Represents a player in a pool with all associated teams
export interface Player {
	id: string;
	name: string;
	teamName: string;
	teams: Team[];
	totalWins: number;
	totalLosses: number;
}

// Compelete pool with players and their teams with league data
export interface CompletePoolData {
	id: string;
	name: string;
	league: string;
	dateUpdated: string;
	dateCreated: string;
	players: Player[];
	userId: string;
}
