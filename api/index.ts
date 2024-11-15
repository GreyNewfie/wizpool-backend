import express from 'express';
import apiNbaDataRouter from '../routers/nbaData';
import apiNflDataRouter from '../routers/nflData';
import apiMlbDataRouter from '../routers/mlbData';
import apiPoolDataRouter from '../routers/poolData';
import apiPlayerDataRouter from '../routers/playerData';
import apiPoolPlayersDataRouter from '../routers/poolPlayersData';
import apiPlayerTeamsDataRouter from '../routers/playerTeamsData';
import apiCompletePoolDataRouter from '../routers/completePoolData';
import cors from 'cors';

const app = express();
require('dotenv').config();

const corsOptions = {
	origin: ['http://localhost:5173', 'https://wizpool-backend.vercel.app/'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/nba_data', apiNbaDataRouter);
app.use('/api/nfl_data', apiNflDataRouter);
app.use('/api/mlb_data', apiMlbDataRouter);
app.use('/api/pools', apiPoolDataRouter);
app.use('/api/players', apiPlayerDataRouter);
app.use('/api/pool_players', apiPoolPlayersDataRouter);
app.use('/api/player_teams', apiPlayerTeamsDataRouter);
app.use('/api/complete_pools', apiCompletePoolDataRouter);

app.get('/api', (req, res) => {
	res.send('Exress on Vercel');
});

app.get('/', (req, res) => {
	res.send('Welcome to the Wizpool backend!');
});

// Export for Vercel
export default app;
