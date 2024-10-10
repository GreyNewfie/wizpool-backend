import express from 'express';
import apiDataRouter from './routers/apiData';

const app = express();
require('dotenv').config();

app.use('/data', apiDataRouter);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
	console.log('Listening on port ' + process.env.PORT);
});
