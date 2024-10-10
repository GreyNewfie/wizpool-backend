export interface NBATeamData {
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

export interface MLBTeamData {
	season: number;
	seasonType: number;
	TeamID: number;
	Key: string;
	City: string;
	Name: string;
	League: string;
	Division: string;
	Wins: number;
	Losses: number;
	Percentage: number;
	DivisionWins: number;
	DivisionLosses: number;
	GamesBehind: number;
	LastTenGamesWins: number;
	LastTenGamesLosses: number;
	Streak: string;
	LeagueRank: number;
	DivisionRank: number;
	WildCardRank: number;
	WildCardGamesBehind: number;
	HomeWins: number;
	HomeLosses: number;
	AwayWins: number;
	AwayLosses: number;
	DayWins: number;
	DayLosses: number;
	NightWins: number;
	NightLosses: number;
	RunsScored: number;
	RunsAgainst: number;
	GlobalTeamID: number;
}

export interface NFLTeamData {
	SeasonType: number;
	Season: number;
	Conference: string;
	Division: string;
	Team: string; // Key for NFL
	Name: string; // Full team name
	Wins: number;
	Losses: number;
	Ties: number;
	Percentage: number;
	PointsFor: number;
	PointsAgainst: number;
	NetPoints: number;
	Touchdowns: number;
	DivisionWins: number;
	DivisionLosses: number;
	ConferenceWins: number;
	ConferenceLosses: number;
	TeamID: number;
	DivisionTies: number;
	ConferenceTies: number;
	GlobalTeamID: number;
	DivisionRank: number;
	ConferenceRank: number;
	HomeWins: number;
	HomeLosses: number;
	HomeTies: number;
	AwayWins: number;
	AwayLosses: number;
	AwayTies: number;
	Streak: number;
}
