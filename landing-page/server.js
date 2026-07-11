const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Create new-sign-ups directory if it doesn't exist
const signupsDir = path.join(__dirname, 'new-sign-ups');
if (!fs.existsSync(signupsDir)) {
    fs.mkdirSync(signupsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Store phone number endpoint
app.post('/api/signup', (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber || !/^[\d\+\-\(\)\s]{10,20}$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    const timestamp = new Date().toISOString();
    const signupData = {
        phone: phoneNumber,
        timestamp: timestamp,
        ip: req.ip
    };
    
    // Create a unique filename
    const filename = `signup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.json`;
    const filepath = path.join(signupsDir, filename);
    
    // Save to file
    fs.writeFileSync(filepath, JSON.stringify(signupData, null, 2));
    
    console.log(`New signup saved: ${phoneNumber}`);
    
    res.json({ 
        success: true, 
        message: 'Signup successful',
        timestamp: timestamp 
    });
});

// Get all signups endpoint (for admin viewing)
app.get('/api/signups', (req, res) => {
    try {
        const files = fs.readdirSync(signupsDir);
        const signups = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const content = fs.readFileSync(path.join(signupsDir, file), 'utf8');
                return JSON.parse(content);
            });
        
        res.json({
            count: signups.length,
            signups: signups
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read signups' });
    }
});

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Landing page server running on http://0.0.0.0:${PORT}`);
    console.log(`Accessible at: http://212.227.93.74:${PORT}`);
    console.log(`Domain should point to: thenewworldorder.io`);
    console.log(`Signups will be saved to: ${signupsDir}`);
});