#!/usr/bin/env node
/**
 * session-to-md.js - Extract conversation from OpenClaw session files to Markdown
 * 
 * Usage:
 *   node session-to-md.js [session-id] [options]
 * 
 * Examples:
 *   node session-to-md.js                    # Extract latest session
 *   node session-to-md.js <session-id>       # Extract specific session
 *   node session-to-md.js --today            # Extract today's sessions
 *   node session-to-md.js --all              # Extract all sessions
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = '/home/tauora/.openclaw/agents/main/sessions';
const OUTPUT_DIR = '/home/tauora/.openclaw/workspace/logs/conversations';

function formatTimestamp(ts) {
  if (!ts) return 'Unknown';
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function getDateFromTimestamp(ts) {
  if (!ts) return new Date();
  return new Date(ts);
}

function extractTextContent(content) {
  if (!content || !Array.isArray(content)) return '';
  
  return content
    .filter(item => item.type === 'text' || item.type === 'thinking')
    .map(item => {
      if (item.type === 'thinking') {
        return `<!-- Thinking: ${item.thinking?.substring(0, 100)}... -->`;
      }
      return item.text || '';
    })
    .join('\n\n')
    .trim();
}

function extractToolCalls(content) {
  if (!content || !Array.isArray(content)) return [];
  
  return content
    .filter(item => item.type === 'toolCall')
    .map(item => {
      const args = JSON.stringify(item.arguments || {}, null, 0);
      return `- **Tool:** \`${item.name}\` - \`${args.substring(0, 80)}${args.length > 80 ? '...' : ''}\``;
    });
}

function parseSessionFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  const events = [];
  const messages = [];
  
  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      events.push(event);
      
      if (event.type === 'message' && event.message) {
        messages.push({
          id: event.id,
          role: event.message.role,
          content: event.message.content,
          timestamp: event.timestamp || event.message.timestamp,
          api: event.message.api,
          model: event.message.model,
          usage: event.message.usage
        });
      }
    } catch (e) {
      // Skip malformed lines
    }
  }
  
  return { events, messages };
}

function formatConversation(messages) {
  const lines = [];
  
  for (const msg of messages) {
    const time = formatTimestamp(msg.timestamp);
    const role = msg.role === 'user' ? '**Allan**' : '**Alpha**';
    
    lines.push(`---`);
    lines.push(`### ${role} - ${time}`);
    lines.push('');
    
    const text = extractTextContent(msg.content);
    const tools = extractToolCalls(msg.content);
    
    if (text) {
      lines.push(text);
    }
    
    if (tools.length > 0) {
      lines.push('');
      lines.push('**Tools called:**');
      lines.push(...tools);
    }
    
    if (msg.model) {
      lines.push('');
      lines.push(`<sub>Model: ${msg.model}</sub>`);
    }
    
    lines.push('');
  }
  
  return lines.join('\n');
}

function getSessionFiles() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.error(`Sessions directory not found: ${SESSIONS_DIR}`);
    process.exit(1);
  }
  
  return fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'))
    .map(f => ({
      name: f,
      path: path.join(SESSIONS_DIR, f),
      id: f.replace('.jsonl', '')
    }));
}

function getLatestSession() {
  const files = getSessionFiles();
  if (files.length === 0) return null;
  
  // Sort by modification time
  files.sort((a, b) => {
    const statA = fs.statSync(a.path);
    const statB = fs.statSync(b.path);
    return statB.mtime - statA.mtime;
  });
  
  return files[0];
}

function extractSession(sessionId) {
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.jsonl`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`Session not found: ${sessionId}`);
    process.exit(1);
  }
  
  console.log(`Extracting session: ${sessionId}...`);
  
  const { messages } = parseSessionFile(filePath);
  
  if (messages.length === 0) {
    console.log('No messages found in session.');
    return;
  }
  
  // Get date from first message
  const firstMsg = messages[0];
  const date = getDateFromTimestamp(firstMsg.timestamp);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const yearMonth = dateStr.substring(0, 7); // YYYY-MM
  
  // Create output directory: conversations/2026-02/
  const monthDir = path.join(OUTPUT_DIR, yearMonth);
  if (!fs.existsSync(monthDir)) {
    fs.mkdirSync(monthDir, { recursive: true });
  }
  
  // Format the conversation
  const conversation = formatConversation(messages);
  
  // Create markdown content
  const mdContent = `# Session Conversation - ${dateStr}

**Session ID:** \`${sessionId}\`  
**Extracted:** ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })}  
**Total Messages:** ${messages.length}

---

${conversation}

---

*End of conversation*
`;
  
  // Save to file: conversations/2026-02/2026-02-01-<session-id>.md
  const outputFile = path.join(monthDir, `${dateStr}-${sessionId}.md`);
  fs.writeFileSync(outputFile, mdContent, 'utf-8');
  
  console.log(`✅ Saved to: ${outputFile}`);
  console.log(`   Messages: ${messages.length}`);
  console.log(`   Date: ${dateStr}`);
}

function main() {
  const args = process.argv.slice(2);
  
  // Create output directory if needed
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  if (args.length === 0) {
    // Extract latest session
    const latest = getLatestSession();
    if (latest) {
      extractSession(latest.id);
    } else {
      console.error('No sessions found.');
    }
  } else if (args[0] === '--all') {
    const files = getSessionFiles();
    console.log(`Found ${files.length} sessions...`);
    for (const file of files) {
      try {
        extractSession(file.id);
      } catch (e) {
        console.error(`Failed to extract ${file.id}: ${e.message}`);
      }
    }
  } else if (args[0] === '--list') {
    const files = getSessionFiles();
    console.log('Available sessions:');
    files.forEach((f, i) => {
      const stat = fs.statSync(f.path);
      console.log(`  ${i + 1}. ${f.id} (${(stat.size / 1024).toFixed(1)} KB)`);
    });
  } else {
    // Extract specific session
    extractSession(args[0]);
  }
}

main();
