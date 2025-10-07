import { IANotificationToInsert, IANotification } from '@/lib/db/mysql-types'

describe('Notification Types', () => {
  describe('IANotificationToInsert', () => {
    test('should create a valid notification insert object', () => {
      const notification: IANotificationToInsert = {
        user_id: 1,
        title: 'Test Notification',
        message: 'This is a test notification message',
        type: 'info',
        link: '/test-link'
      }

      expect(notification.user_id).toBe(1)
      expect(notification.title).toBe('Test Notification')
      expect(notification.message).toBe('This is a test notification message')
      expect(notification.type).toBe('info')
      expect(notification.link).toBe('/test-link')
    })

    test('should allow optional type and link', () => {
      const notification: IANotificationToInsert = {
        user_id: 1,
        title: 'Test',
        message: 'Message'
      }

      expect(notification.user_id).toBe(1)
      expect(notification.title).toBe('Test')
      expect(notification.message).toBe('Message')
      expect(notification.type).toBeUndefined()
      expect(notification.link).toBeUndefined()
    })
  })

  describe('IANotification', () => {
    test('should create a valid notification object', () => {
      const notification: IANotification = {
        id: 1,
        user_id: 1,
        title: 'Test Notification',
        message: 'This is a test notification message',
        type: 'info',
        link: '/test-link',
        is_read: false,
        created_at: new Date(),
        read_at: null
      }

      expect(notification.id).toBe(1)
      expect(notification.user_id).toBe(1)
      expect(notification.is_read).toBe(false)
      expect(notification.read_at).toBeNull()
      expect(notification.created_at).toBeInstanceOf(Date)
    })

    test('should support is_read as number (for MySQL)', () => {
      const notification: IANotification = {
        id: 1,
        user_id: 1,
        title: 'Test',
        message: 'Message',
        type: 'info',
        link: null,
        is_read: 1,
        created_at: new Date(),
        read_at: new Date()
      }

      expect(notification.is_read).toBe(1)
      expect(notification.read_at).toBeInstanceOf(Date)
    })
  })

  describe('Notification type validation', () => {
    test('should support different notification types', () => {
      const types = ['info', 'success', 'warning', 'error']
      
      types.forEach(type => {
        const notification: IANotificationToInsert = {
          user_id: 1,
          title: 'Test',
          message: 'Message',
          type
        }
        expect(notification.type).toBe(type)
      })
    })

    test('should handle null link', () => {
      const notification: IANotification = {
        id: 1,
        user_id: 1,
        title: 'Test',
        message: 'Message',
        type: 'info',
        link: null,
        is_read: false,
        created_at: new Date(),
        read_at: null
      }

      expect(notification.link).toBeNull()
    })
  })
})
