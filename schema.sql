-- Users Table: Tracks Privy onboarding and social links
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    privy_user_id VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    discord_handle VARCHAR(100),
    twitter_handle VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bounties Table: Tracks bounty tasks created by room owners
CREATE TABLE bounties (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reward_amount DECIMAL(18, 6) NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, voting, closed
    creator_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions Table: Tracks proof of work submitted by contributors
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    bounty_id INT REFERENCES bounties(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    proof_link TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    votes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes Table: Tracks token-weighted governance voting for submissions
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES submissions(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    voting_power DECIMAL(18, 6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, user_id)
);
