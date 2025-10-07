import { getCurrentUser } from '@/lib/user'
import { Dao } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export const maxDuration = 60

/**
 * @swagger
 * 
 * /api/v1/notifications/mark-all-read:
 *   post:
 *     description: Mark all user notifications as read
 *     tags:
 *       - notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 count:
 *                   type: number
 *                   description: Number of notifications marked as read
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    
    const count = await Dao.markAllNotificationsAsRead(user_id)

    return Response.json({ 
      status: 'OK',
      count
    })
  } catch (error) {
    console.error('Error marking all notifications as read', error)
    return NextResponse.json({ errormsg: error.message }, { status: 500 })
  }
}
