CREATE TABLE email_otp_codes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT        NOT NULL,
    code       CHAR(6)     NOT NULL,
    role       TEXT        NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX email_otp_codes_email_idx     ON email_otp_codes(email);
CREATE INDEX email_otp_codes_email_exp_idx ON email_otp_codes(email, expires_at)
    WHERE used_at IS NULL;
