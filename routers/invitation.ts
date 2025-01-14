import { Router, Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
import { turso } from '../db'
import { createClerkClient } from "@clerk/backend";

const router = Router();
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
})

router.post('/:poolId', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { poolId } = req.params;
        const { email } = req.body;
        const requestorId = authReq.auth.userId;

        if (!email) return res.status(400).json({ error: 'Email is required' })

        // Step 1: Verify the requester is the pool owner
        const pool = await turso.execute({
            sql: "SELECT * FROM user_pools WHERE pool_id = ? AND user_id = ?",
            args: [poolId, requestorId]
        })

        if (!pool.rows?.length)
            return res.status(404).json({ error: 'Pool not found or you are not the owner' });

        // Step 2: Check if the email belongs to an existing Clerk user
        let inviteeId: string | null = null;
        try {
            const users = await clerkClient.users.getUserList({ query: email })

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
            return res.status(400).json({ error: 'An invitation for this email already exists' })

        // Step 4: Create the invitation
        const result = await turso.execute({
            sql: 'INSERT INTO pool_invitations (pool_id, inviter_id, invitee_email, invitee_id, status) VALUES (?, ?, ?, ?, ?) RETURNING id',
            args: [poolId, userId, email, inviteeId, 'pending']
        })

        const invitationId = result.rows[0]?.id;

        if (!invitationId) {
            throw new Error('Failed to get invitation ID');
        }

        // Check if invitee has a Clerk account, if so add them to user pools
        if (inviteeId) {
            const transaction = await turso.transaction('write');

            try {
                await transaction.execute({
                    sql: "INSERT INTO user_pools (user_id, pool_id) VALUES (?, ?)",
                    args: [inviteeId, poolId]
                })

                await transaction.execute({
                    sql: "UPDATE pool_invitations SET status = ? WHERE pool_id = ? AND invitee_id = ?",
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
                    invitationId: invitationId,
                }
            })
        }

        res.status(200).json({
            message: 'Invitation created successfully',
            inviteeId: inviteeId
        })
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({ error: 'Failed to create invitation' })
    }
});

router.put('/:invitationId/accept', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { invitationId } = req.params;

        // Step 1: verify the invitation exists and is valid
        const invitation = await turso.execute({
            sql: 'SELECT * FROM pool_invitations WHERE id = ? and status = ?',
            args: [invitationId, 'pending']
        })

        if (!invitation.rows?.length)
            return res.status(404).json({ error: 'Invitation not found or has already been accepted' })

        const inviteData = invitation.rows[0];

        if (!inviteData?.invitee_email)
            return res.status(400).json({ error: 'Invalid invitation data' })

        // Verify this user is the invitee
        const user = await clerkClient.users.getUser(userId);
        const userEmail = user.emailAddresses[0].emailAddress.toLocaleLowerCase();

        if (typeof inviteData.invitee_email === 'string' && userEmail !== inviteData.invitee_email.toLowerCase())
            return res.status(403).json({ error: 'This invitation was not meant for you' });

        // Add user to user pool and mark invitation as accepted
        const transaction = await turso.transaction('write');

        try {
            await transaction.execute({
                sql: 'INSERT INTO user_pools (user_id, pool_id) VALUES (?, ?)',
                args: [userId, inviteData.pool_id]
            })

            await transaction.execute({
                sql: "UPDATE pool_invitations SET status = ?, invitee_id = ? WHERE id = ?",
                args: ['accepted', userId, invitationId]
            })

            await transaction.commit();

            res.status(200).json({
                message: 'Invitation accepted successfully',
                poolId: inviteData.pool_id
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
})

export default router;
