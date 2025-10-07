# User Notification System

This document describes the user notification system added to the ApoIA application.

## Overview

The notification system allows the application to send notifications to users. Notifications can be used to inform users about:
- Completed analysis processes
- System updates
- Important alerts
- Custom messages

## Database Schema

A new table `ia_notification` has been added with the following structure:

- `id`: Unique identifier
- `user_id`: Foreign key to the user
- `title`: Notification title
- `message`: Notification message (text)
- `type`: Notification type (info, success, warning, error)
- `link`: Optional URL link
- `is_read`: Whether the notification has been read
- `created_at`: Creation timestamp
- `read_at`: Timestamp when marked as read

## Migration

To apply the database schema changes:

### MySQL
```sql
source migrations/mysql/migration-008.sql
```

### PostgreSQL
```sql
\i migrations/postgres/migration-008.sql
```

## API Endpoints

### GET /api/v1/notifications
Retrieve user notifications.

**Query Parameters:**
- `unreadOnly` (boolean, optional): If true, only returns unread notifications
- `limit` (integer, optional, default: 50): Maximum number of notifications to return

**Response:**
```json
{
  "status": "OK",
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Analysis Complete",
      "message": "Your process analysis has been completed",
      "type": "success",
      "link": "/process/12345",
      "is_read": false,
      "created_at": "2025-01-15T10:30:00Z",
      "read_at": null
    }
  ],
  "unreadCount": 3
}
```

### POST /api/v1/notifications
Create a new notification for the current user.

**Request Body:**
```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info",
  "link": "/optional/link"
}
```

**Response:**
```json
{
  "status": "OK",
  "notification": {
    "id": 1,
    "user_id": 1,
    "title": "Notification Title",
    "message": "Notification message",
    "type": "info",
    "link": "/optional/link",
    "is_read": false,
    "created_at": "2025-01-15T10:30:00Z",
    "read_at": null
  }
}
```

### PATCH /api/v1/notifications/{id}
Mark a specific notification as read.

**Response:**
```json
{
  "status": "OK"
}
```

### DELETE /api/v1/notifications/{id}
Delete a specific notification.

**Response:**
```json
{
  "status": "OK"
}
```

### POST /api/v1/notifications/mark-all-read
Mark all user notifications as read.

**Response:**
```json
{
  "status": "OK",
  "count": 5
}
```

## Usage Examples

### Creating a notification when an analysis completes

```typescript
import { Dao } from '@/lib/db/mysql'

// After completing an analysis
const user_id = await Dao.assertIAUserId(username)
await Dao.createNotification({
  user_id,
  title: 'Análise Concluída',
  message: `A análise do processo ${processNumber} foi concluída com sucesso`,
  type: 'success',
  link: `/process/${processNumber}`
})
```

### Retrieving unread notifications

```typescript
// In a React component or API route
const response = await fetch('/api/v1/notifications?unreadOnly=true')
const { notifications, unreadCount } = await response.json()
```

### Marking a notification as read

```typescript
const response = await fetch(`/api/v1/notifications/${notificationId}`, {
  method: 'PATCH'
})
```

## Notification Types

Recommended notification types:
- `info`: General information (blue)
- `success`: Success messages (green)
- `warning`: Warning messages (yellow/orange)
- `error`: Error messages (red)

## Security

All notification endpoints require authentication via NextAuth or Bearer token. Users can only access their own notifications.
