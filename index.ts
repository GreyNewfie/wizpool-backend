import express from 'express';
import apiNbaDataRouter from './routers/nbaData';

const app = express();
require('dotenv').config();

app.use('/data', apiNbaDataRouter);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
	console.log('Listening on port ' + process.env.PORT);
});
