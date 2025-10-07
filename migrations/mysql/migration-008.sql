-- Migration 008: Add user notification system

USE apoia;

CREATE TABLE ia_notification (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NULL DEFAULT 'info',
  link VARCHAR(512) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  INDEX notification_user_id_idx (user_id ASC) VISIBLE,
  INDEX notification_is_read_idx (is_read ASC, created_at DESC) VISIBLE,
  CONSTRAINT notification_user_id
    FOREIGN KEY (user_id)
    REFERENCES ia_user (id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);
