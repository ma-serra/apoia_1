import { getCurrentUser } from '@/lib/user'
import { Dao } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export const maxDuration = 60

/**
 * @swagger
 * 
 * /api/v1/notifications:
 *   get:
 *     description: Retrieve user notifications
 *     tags:
 *       - notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         required: false
 *         schema:
 *           type: boolean
 *         description: If true, only unread notifications are returned
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of notifications to return
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       user_id:
 *                         type: number
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                       link:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       read_at:
 *                         type: string
 *                         format: date-time
 *                 unreadCount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *   post:
 *     description: Create a new notification
 *     tags:
 *       - notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 default: info
 *               link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification created successfully
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    
    const url = new URL(req.url)
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(url.searchParams.get('limit') || '50')

    const notifications = await Dao.retrieveNotificationsByUserId(user_id, unreadOnly, limit)
    const unreadCount = await Dao.getUnreadNotificationCount(user_id)

    return Response.json({ 
      status: 'OK', 
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('Error retrieving notifications', error)
    return NextResponse.json({ errormsg: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    const body = await req.json()
    
    const { title, message, type = 'info', link = null } = body

    if (!title || !message) {
      return Response.json({ errormsg: 'Title and message are required' }, { status: 400 })
    }

    const notification = await Dao.createNotification({
      user_id,
      title,
      message,
      type,
      link
    })

    return Response.json({ 
      status: 'OK', 
      notification
    })
  } catch (error) {
    console.error('Error creating notification', error)
    return NextResponse.json({ errormsg: error.message }, { status: 500 })
  }
}
