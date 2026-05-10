CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  username         VARCHAR(50)  UNIQUE NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  email_2fa_enabled BOOLEAN     DEFAULT FALSE,
  status           VARCHAR(20)  DEFAULT 'active',
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL,
  email       VARCHAR(255) NOT NULL,
  token       TEXT         NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  used        BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_otps (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  otp         VARCHAR(6)   NOT NULL,
  expires_at  TIMESTAMPTZ  NOT NULL,
  used        BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_resets_token   ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_otps_email     ON email_otps(email);
