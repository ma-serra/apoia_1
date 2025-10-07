import { getCurrentUser } from '@/lib/user'
import { Dao } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export const maxDuration = 60

/**
 * @swagger
 * 
 * /api/v1/notifications/{id}:
 *   patch:
 *     description: Mark a notification as read
 *     tags:
 *       - notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *   delete:
 *     description: Delete a notification
 *     tags:
 *       - notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    const notificationId = parseInt(params.id)

    const success = await Dao.markNotificationAsRead(notificationId, user_id)

    if (!success) {
      return Response.json({ errormsg: 'Notification not found' }, { status: 404 })
    }

    return Response.json({ status: 'OK' })
  } catch (error) {
    console.error('Error marking notification as read', error)
    return NextResponse.json({ errormsg: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    const notificationId = parseInt(params.id)

    const success = await Dao.deleteNotification(notificationId, user_id)

    if (!success) {
      return Response.json({ errormsg: 'Notification not found' }, { status: 404 })
    }

    return Response.json({ status: 'OK' })
  } catch (error) {
    console.error('Error deleting notification', error)
    return NextResponse.json({ errormsg: error.message }, { status: 500 })
  }
}
