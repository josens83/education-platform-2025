-- Add password reset fields to users table
-- Migration: 003_add_password_reset_fields

ALTER TABLE users
ADD COLUMN password_reset_token VARCHAR(255),
ADD COLUMN password_reset_expires TIMESTAMP;

-- Add index for faster token lookup
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);

-- Add stripe_customer_id for payment integration
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
