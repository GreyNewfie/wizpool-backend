import express from 'express';
import apiNbaDataRouter from './routers/nbaData';
import apiNflDataRouter from './routers/nflData';
import apiMlbDataRouter from './routers/mlbData';
import apiPoolDataRouter from './routers/poolData';
import apiPlayerDataRouter from './routers/playerData';
import apiPlayerPoolsDataRouter from './routers/playerPoolsData';
import cors from 'cors';

const app = express();
require('dotenv').config();

const corsOptions = {
	origin: 'http://localhost:5173',
	methods: 'GET,POST',
	allowHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/nba_data', apiNbaDataRouter);
app.use('/api/nfl_data', apiNflDataRouter);
app.use('/api/mlb_data', apiMlbDataRouter);
app.use('/api/pools', apiPoolDataRouter);
app.use('/api/players', apiPlayerDataRouter);
app.use('/api/player_pools', apiPlayerPoolsDataRouter);
app.get('/api', (req, res) => {
	res.send("You've reached the Wizpool backend!");
});

app.listen(process.env.PORT, () => {
	console.log('Listening on port ' + process.env.PORT);
});

module.exports = app;
