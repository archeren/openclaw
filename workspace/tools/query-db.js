#!/usr/bin/env node
/**
 * query-db.js - Query the conversations database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../logs/conversations/conversations.db');

const db = new sqlite3.Database(DB_PATH);

// Get count and sample
db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log('========================================');
  console.log('Conversations Database');
  console.log('========================================');
  console.log(`Total messages: ${row.count}`);
  console.log('');
  
  // Show first 5 messages
  db.all('SELECT timestamp, role, substr(content, 1, 60) as preview FROM messages ORDER BY timestamp LIMIT 5', (err2, rows) => {
    if (err2) {
      console.error('Error:', err2);
      db.close();
      return;
    }
    
    console.log('First 5 messages (sorted by UTC):');
    console.log('----------------------------------------');
    rows.forEach((row, i) => {
      const utc = new Date(row.timestamp).toISOString();
      const shanghai = new Date(row.timestamp).toLocaleString('en-US', {
        timeZone: 'Asia/Shanghai',
        hour12: false
      });
      console.log(`[${i}] UTC: ${utc}`);
      console.log(`    Shanghai: ${shanghai}`);
      console.log(`    Role: ${row.role}`);
      console.log(`    Preview: ${row.preview}...`);
      console.log('');
    });
    
    // Show last 5 messages
    db.all('SELECT timestamp, role, substr(content, 1, 60) as preview FROM messages ORDER BY timestamp DESC LIMIT 5', (err3, rows2) => {
      if (err3) {
        console.error('Error:', err3);
        db.close();
        return;
      }
      
      console.log('Last 5 messages (sorted by UTC):');
      console.log('----------------------------------------');
      rows2.reverse().forEach((row, i) => {
        const utc = new Date(row.timestamp).toISOString();
        const shanghai = new Date(row.timestamp).toLocaleString('en-US', {
          timeZone: 'Asia/Shanghai',
          hour12: false
        });
        console.log(`[${rows2.length - 5 + i}] UTC: ${utc}`);
        console.log(`    Shanghai: ${shanghai}`);
        console.log(`    Role: ${row.role}`);
        console.log('');
      });
      
      console.log('========================================');
      console.log('Database location:');
      console.log(DB_PATH);
      console.log('========================================');
      
      db.close();
    });
  });
});
