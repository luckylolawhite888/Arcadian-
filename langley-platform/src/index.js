#!/usr/bin/env node
/**
 * Langley Solar Engine — Entry Point
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

// Run DB init
require('./database/init');

// Start dashboard
require('./dashboard/server');
