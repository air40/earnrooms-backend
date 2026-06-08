const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Test Route
app.get('/', (req, res) => {
    res.send('EarnRooms Backend API is running successfully!');
});

// API 1: Onboard and Sync User Data via Privy Wallet
app.post('/api/users/onboard', async (req, res) => {
    const { privy_user_id, wallet_address, discord_handle, twitter_handle } = req.body;
    
    if (!privy_user_id || !wallet_address) {
        return res.status(400).json({ error: 'Missing required Privy fields' });
    }

    try {
        const query = `
            INSERT INTO users (privy_user_id, wallet_address, discord_handle, twitter_handle)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (privy_user_id) 
            DO UPDATE SET wallet_address = EXCLUDED.wallet_address, discord_handle = EXCLUDED.discord_handle, twitter_handle = EXCLUDED.twitter_handle
            RETURNING *;
        `;
        const values = [privy_user_id, wallet_address, discord_handle, twitter_handle];
        const result = await pool.query(query, values);
        
        res.status(200).json({ message: 'User successfully sync’d with Privy', user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Database error during onboarding' });
    }
});

// API 2: Create a New Bounty (Room Owners)
app.post('/api/bounties/create', async (req, res) => {
    const { room_id, title, description, reward_amount, creator_address } = req.body;

    if (!room_id || !title || !reward_amount || !creator_address) {
        return res.status(400).json({ error: 'Missing core bounty parameters' });
    }

    try {
        const query = `
            INSERT INTO bounties (room_id, title, description, reward_amount, creator_address)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [room_id, title, description, reward_amount, creator_address];
        const result = await pool.query(query, values);
        
        res.status(201).json({ message: 'Bounty created successfully', bounty: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Database error during bounty creation' });
    }
});

// API 3: Submit Task Proof (Contributors)
app.post('/api/submissions/submit', async (req, res) => {
    const { bounty_id, user_id, proof_link } = req.body;

    try {
        const query = `
            INSERT INTO submissions (bounty_id, user_id, proof_link)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [bounty_id, user_id, proof_link];
        const result = await pool.query(query, values);
        
        res.status(201).json({ message: 'Submission recorded', submission: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Database error during submission' });
    }
});

// API 4: Cast Token-Weighted Governance Vote
app.post('/api/votes/cast', async (req, res) => {
    const { submission_id, user_id, voting_power } = req.body;

    try {
        const voteQuery = `
            INSERT INTO votes (submission_id, user_id, voting_power)
            VALUES ($1, $2, $3);
        `;
        await pool.query(voteQuery, [submission_id, user_id, voting_power]);

        const updateSubmissionQuery = `
            UPDATE submissions 
            SET votes_count = votes_count + $1
            WHERE id = $2
            RETURNING *;
        `;
        const updatedSubmission = await pool.query(updateSubmissionQuery, [voting_power, submission_id]);

        res.status(200).json({ message: 'Vote casted and weighted power added!', submission: updatedSubmission.rows[0] });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'You have already voted on this submission' });
        }
        res.status(500).json({ error: 'Database error during voting' });
    }
});

// Server Listen
app.listen(PORT, () => {
    console.log(`EarnRooms backend service running on port ${PORT}`);
});
