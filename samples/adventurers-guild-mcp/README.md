# Adventurers' Guild MCP Server

A D&D-themed Model Context Protocol (MCP) server demonstrating level-based gating and authentication patterns.

## Quick Start

### Prerequisites

Install the Dev Tunnels CLI:

**Windows (using winget):**
```powershell
winget install Microsoft.devtunnel
```

**Windows (using PowerShell):**
```powershell
Invoke-WebRequest -Uri https://aka.ms/TunnelsCliDownload/win-x64 -OutFile devtunnel.exe
```

**macOS/Linux:**
```bash
curl -sL https://aka.ms/DevTunnelCliInstall | bash
```

### Setup & Run

1. **Navigate to the sample folder**
   ```bash
   cd samples/adventurers-guild-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

   You'll see the Guild Hall welcome message:
   ```
   ╔═══════════════════════════════════════════════════════════════════╗
   ║                                                                   ║
   ║   ⚔️  THE ADVENTURERS' GUILD - MCP SERVER  ⚔️                     ║
   ║                                                                   ║
   ║   🏰 Guild Hall Status: OPEN FOR BUSINESS                        ║
   ║   🌐 Portal Address: http://localhost:3000/mcp                    ║
   ║   📜 Protocol: Model Context Protocol (Streamable HTTP)          ║
   ║                                                                   ║
   ║   Available Services:                                            ║
   ║   • 📋 Quest Board (list_quests)                                 ║
   ║   • 👥 Party Roster (parties)                                    ║
   ║   • 💰 Treasury Vault (chest) - Auth Required                    ║
   ║   • 🤝 Party Hiring (hire_party)                                 ║
   ║   • 🏛️  Guild Hall Overview (guild://guildhall)                  ║
   ║                                                                   ║
   ║   Guild Ranks: Novice → Adept → Veteran → Mythic               ║
   ║                                                                   ║
   ║   "Fortune favors the bold, but wisdom favors the prepared."     ║
   ║   - Guild Master Aldric Ironquill                                ║
   ║                                                                   ║
   ╚═══════════════════════════════════════════════════════════════════╝

   🎲 The tavern is bustling with adventurers...
   🔥 The hearth is warm and inviting...
   📜 Fresh quests have been posted on the board...

   ⚡ Server ready to accept connections!
   ```

4. **Create a Dev Tunnel (in a new terminal)**
   ```bash
   # Navigate to the sample folder
   cd samples/adventurers-guild-mcp
   
   # Login to Dev Tunnels (first time only)
   devtunnel user login
   
   # Host the tunnel
   devtunnel host -p 3000 --allow-anonymous
   
   # You'll get a public URL like: https://xyz123.usw2.devtunnels.ms/
   # Use this URL + /mcp in Copilot Studio: https://xyz123.usw2.devtunnels.ms/mcp
   ```

### Validate with MCP Inspector

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test your server:

```bash
npx @modelcontextprotocol/inspector https://your-tunnel-url.devtunnels.ms/mcp
```

Try these test commands:
- List quests: Call `list_quests` tool
- View parties: Call `parties` tool
- Check balance: Call `chest` tool (requires `Authorization: Bearer <token>` header)

---

## Features

### 🎲 Level-Based Access Control
Set the `user-level` header to control what content is visible:
- **Novice**: Easy & Medium quests, parties with avg level 1-3
- **Adept**: + Hard quests, parties with avg level 1-5
- **Veteran**: + Deadly quests, parties with avg level 1-7
- **Mythic**: + Legendary quests, all parties

### 🔒 Authentication
Use `Authorization: Bearer <any-token>` header to access the treasury (chest tool).

---

## Available Tools

### `list_quests`
Lists available quests based on your guild rank (user-level header). Each quest includes:
- Quest ID, title, danger level, reward
- Ideal party classes and required capabilities

### `parties`
Lists available adventuring parties based on your guild rank. Optionally filter by class:
```json
{ "classes": ["Fighter", "Cleric"] }
```

### `chest`
Check your gold balance in the guild treasury. **Requires authorization header**.

### `hire_party`
Hire a party for a quest. Validates:
- Quest and party availability at your rank
- Quest reward vs party expectations
- Your gold balance (requires authorization)

**Example:**
```json
{
  "quest_id": "q1",
  "party_id": "p1"
}
```

---

## Resources

### `guild://guildhall`
A rich DM-style narrative describing the Adventurers' Guild Hall, including the Quest Board, Party Roster, Treasury, and guild rules.

---

## Configuration

Set environment variable to change port:
```bash
PORT=8080 npm run dev
```

## Use in Copilot Studio

1. Host the server and create a Dev Tunnel (see Quick Start)
2. In Copilot Studio, add an MCP connector
3. Configure endpoint: `https://your-tunnel-url.devtunnels.ms/mcp`
4. Optionally set default headers:
   - `user-level: Adept` (or any rank)
   - `authorization: Bearer test-token` (for chest access)

## License

MIT
