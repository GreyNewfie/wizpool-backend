import express from 'express';
import apiNbaDataRouter from './routers/nbaData';
import apiNflDataRouter from './routers/nflData';

const app = express();
require('dotenv').config();

app.use('/api/nba_data', apiNbaDataRouter);
app.use('/api/nfl_data', apiNflDataRouter);

app.get('/api', (req, res) => {
	res.send("You've reached the Wizpool backend!");
});

app.listen(process.env.PORT, () => {
	console.log('Listening on port ' + process.env.PORT);
});
