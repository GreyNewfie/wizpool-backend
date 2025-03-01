import 'dotenv/config';
import express, { Request, Response } from 'express';
import apiNbaDataRouter from '../routers/nbaData';
import apiNflDataRouter from '../routers/nflData';
import apiMlbDataRouter from '../routers/mlbData';
import apiPoolDataRouter from '../routers/poolData';
import apiCompletePoolDataRouter from '../routers/completePoolData';
import apiInvitationRouter from '../routers/invitation'
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';

const app = express();
require('dotenv').config();

app.use(clerkMiddleware());

const corsOptions = {
	origin: [
		'http://localhost:5173',
		'https://wizpool-backend.vercel.app/',
		'https://wizpool-app-git-staging-greynewfies-projects.vercel.app',
		'https://d3tm2i9s4796wg.cloudfront.net'
	],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,  // For aws deployment practice
	exposedHeaders: ['Authorization'],  // For aws deployment practice
	maxAge: 86400  // add this to cache preflight requests for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/nba_data', apiNbaDataRouter);
app.use('/api/nfl_data', apiNflDataRouter);
app.use('/api/mlb_data', apiMlbDataRouter);
app.use('/api/pools', apiPoolDataRouter);
app.use('/api/complete_pools', apiCompletePoolDataRouter);
app.use('/api/invitations', apiInvitationRouter);

app.get('/api', (req, res) => {
	res.send('Welcome to the Wizpool backend on vercel!');
});

app.get('/', (req, res) => {
	res.send('Welcome to the Wizpool backend!');
});

// Export for Vercel
export default app;

// Start the server when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
	const port = process.env.PORT || 3030;
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}
