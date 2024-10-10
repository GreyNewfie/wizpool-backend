// types.ts or teamTypes.ts

export interface TeamData {
	Season: number;
	SeasonType: number;
	TeamID: number;
	Key: string;
	City: string;
	Name: string;
	Conference: string;
	Division: string;
	Wins: number;
	Losses: number;
	Percentage: number;
	ConferenceWins: number;
	ConferenceLosses: number;
	DivisionWins: number;
	DivisionLosses: number;
	HomeWins: number;
	HomeLosses: number;
	AwayWins: number;
	AwayLosses: number;
	LastTenWins: number;
	LastTenLosses: number;
	PointsPerGameFor: number;
	PointsPerGameAgainst: number;
	Streak: number;
	GamesBack: number;
	StreakDescription: string;
	GlobalTeamID: number;
	ConferenceRank: number;
	DivisionRank: number;
}
