-- Migration 008: Add user notification system

CREATE TABLE ia_notification (
  id SERIAL PRIMARY KEY,
  user_id integer NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  type varchar(32) DEFAULT 'info',
  link varchar(512),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at timestamp NULL,
  CONSTRAINT notification_user_id FOREIGN KEY (user_id)
    REFERENCES ia_user (id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

-- Create indexes for efficient querying
CREATE INDEX notification_user_id_idx ON ia_notification (user_id);
CREATE INDEX notification_is_read_idx ON ia_notification (is_read, created_at DESC);
