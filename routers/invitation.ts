import { Router, Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
import {turso } from '../db'
import { createClerkClient } from "@clerk/backend";

const router = Router();
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
})

// Create pool invitation route
router.post('/:poolId', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth.userId;
    
    if (!userId) return res.status(401).json({error: 'Unauthorized'});

    try {
        const {poolId} = req.params;
        const {email} = req.body;
        const requestorId = authReq.auth.userId;

        if (!email) return res.status(400).json({error: 'Email is required'})

        // Step 1: Verify the requester is the pool owner
        const pool =  await turso.execute({
            sql: "SELECT * FROM user_pools WHERE pool_id = ? AND user_id = ?",
            args: [poolId, requestorId]
        })

        if (!pool.rows?.length)
            return res.status(404).json({error: 'Pool not found or you are not the owner'});
        
        // Step 2: Check if the email belongs to an existing Clerk user
        let inviteeId: string | null = null; 
        try {
            const users = await clerkClient.users.getUserList({ query: email})

            if (users.data.length > 0) 
                inviteeId = users.data[0].id;
        } catch (error) {
            console.error('Error checking if invitee is an existing Clerk user:', error);
        }

        // Step 3: Check if invitation already exists
        const existingInvitation = await turso.execute({
            sql: 'SELECT * FROM pool_invitations WHERE pool_id = ? AND invitee_email = ? AND status = ?',
            args: [poolId, email, 'pending']
        })

        if (existingInvitation.rows?.length)
            return res.status(400).json({error: 'An invitation for this email already exists'})

        // Step 4: Create the invitation
        await turso.execute({
            sql: 'INSERT INTO pool_invitations (pool_id, inviter_id, invitee_email, invitee_id, status) VALUES (?, ?, ?, ?, ?)',
            args:[poolId, userId, email, inviteeId, 'pending']
        })

            if (inviteeId) {
                const transaction = await turso.transaction('write');

                try {
                    await transaction.execute({
                        sql: "INSERT INTO user_pools (user_id, pool_id) VALUES (?, ?)",
                        args: [inviteeId, poolId]
                    })

                    await transaction.execute({
                        sql: "UPDATE pool_invitations SET status = ? WHERE pool_id = ? AND inviteeId = ?",
                        args: ['accepted', poolId, inviteeId]
                    })

                    await transaction.commit()
                } catch (error) {
                    await transaction.rollback();
                    throw error;
            }
            } else {
                await clerkClient.invitations.createInvitation({
                    emailAddress: email,
                    redirectUrl: 'https://wizpool-app.vercel.app/accept-invite',
                    publicMetadata: {
                        poolId: poolId,
                    }    
                })
            }
            
        res.status(200).json({
            message: 'Invitation created successfully',
            inviteeId: inviteeId
        })
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({error: 'Failed to create invitation'})
    }
});

export default router;
