import '@clerk/express'; // Ensures Clerk's types are loaded

declare global {
	namespace Express {
		interface Request {
			auth: import('@clerk/express').AuthObject; // Ensure Clerk's AuthObject type is used
		}
	}
}
