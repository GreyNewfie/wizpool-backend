import { ProcessedTeamData } from '../types';

// Static, season-agnostic catalog of NFL teams.
// Keys should match your logo keys and downstream expectations.
export const nflTeams: ProcessedTeamData[] = [
  { key: 'BUF', city: 'Buffalo', name: 'Bills', conference: 'AFC', division: 'East', wins: 0, losses: 0 },
  { key: 'MIA', city: 'Miami', name: 'Dolphins', conference: 'AFC', division: 'East', wins: 0, losses: 0 },
  { key: 'NE', city: 'New England', name: 'Patriots', conference: 'AFC', division: 'East', wins: 0, losses: 0 },
  { key: 'NYJ', city: 'New York', name: 'Jets', conference: 'AFC', division: 'East', wins: 0, losses: 0 },

  { key: 'BAL', city: 'Baltimore', name: 'Ravens', conference: 'AFC', division: 'North', wins: 0, losses: 0 },
  { key: 'CIN', city: 'Cincinnati', name: 'Bengals', conference: 'AFC', division: 'North', wins: 0, losses: 0 },
  { key: 'CLE', city: 'Cleveland', name: 'Browns', conference: 'AFC', division: 'North', wins: 0, losses: 0 },
  { key: 'PIT', city: 'Pittsburgh', name: 'Steelers', conference: 'AFC', division: 'North', wins: 0, losses: 0 },

  { key: 'HOU', city: 'Houston', name: 'Texans', conference: 'AFC', division: 'South', wins: 0, losses: 0 },
  { key: 'IND', city: 'Indianapolis', name: 'Colts', conference: 'AFC', division: 'South', wins: 0, losses: 0 },
  { key: 'JAX', city: 'Jacksonville', name: 'Jaguars', conference: 'AFC', division: 'South', wins: 0, losses: 0 },
  { key: 'TEN', city: 'Tennessee', name: 'Titans', conference: 'AFC', division: 'South', wins: 0, losses: 0 },

  { key: 'DEN', city: 'Denver', name: 'Broncos', conference: 'AFC', division: 'West', wins: 0, losses: 0 },
  { key: 'KC', city: 'Kansas City', name: 'Chiefs', conference: 'AFC', division: 'West', wins: 0, losses: 0 },
  { key: 'LV', city: 'Las Vegas', name: 'Raiders', conference: 'AFC', division: 'West', wins: 0, losses: 0 },
  { key: 'LAC', city: 'Los Angeles', name: 'Chargers', conference: 'AFC', division: 'West', wins: 0, losses: 0 },

  { key: 'DAL', city: 'Dallas', name: 'Cowboys', conference: 'NFC', division: 'East', wins: 0, losses: 0 },
  { key: 'NYG', city: 'New York', name: 'Giants', conference: 'NFC', division: 'East', wins: 0, losses: 0 },
  { key: 'PHI', city: 'Philadelphia', name: 'Eagles', conference: 'NFC', division: 'East', wins: 0, losses: 0 },
  { key: 'WAS', city: 'Washington', name: 'Commanders', conference: 'NFC', division: 'East', wins: 0, losses: 0 },

  { key: 'CHI', city: 'Chicago', name: 'Bears', conference: 'NFC', division: 'North', wins: 0, losses: 0 },
  { key: 'DET', city: 'Detroit', name: 'Lions', conference: 'NFC', division: 'North', wins: 0, losses: 0 },
  { key: 'GB', city: 'Green Bay', name: 'Packers', conference: 'NFC', division: 'North', wins: 0, losses: 0 },
  { key: 'MIN', city: 'Minnesota', name: 'Vikings', conference: 'NFC', division: 'North', wins: 0, losses: 0 },

  { key: 'ATL', city: 'Atlanta', name: 'Falcons', conference: 'NFC', division: 'South', wins: 0, losses: 0 },
  { key: 'CAR', city: 'Carolina', name: 'Panthers', conference: 'NFC', division: 'South', wins: 0, losses: 0 },
  { key: 'NO', city: 'New Orleans', name: 'Saints', conference: 'NFC', division: 'South', wins: 0, losses: 0 },
  { key: 'TB', city: 'Tampa Bay', name: 'Buccaneers', conference: 'NFC', division: 'South', wins: 0, losses: 0 },

  { key: 'ARI', city: 'Arizona', name: 'Cardinals', conference: 'NFC', division: 'West', wins: 0, losses: 0 },
  { key: 'LAR', city: 'Los Angeles', name: 'Rams', conference: 'NFC', division: 'West', wins: 0, losses: 0 },
  { key: 'SF', city: 'San Francisco', name: '49ers', conference: 'NFC', division: 'West', wins: 0, losses: 0 },
  { key: 'SEA', city: 'Seattle', name: 'Seahawks', conference: 'NFC', division: 'West', wins: 0, losses: 0 },
];

// Placeholders for future catalogs if needed
export const nbaTeams: ProcessedTeamData[] = [];
export const mlbTeams: ProcessedTeamData[] = [];
