import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { AsyncLocalStorage } from 'async_hooks';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Request-scoped context (derived from headers each /mcp call)
 * ──────────────────────────────────────────────────────────────────────────────
 */
type Level = "Novice" | "Adept" | "Veteran" | "Mythic";
interface ReqContext {
  level: Level;
  authed: boolean;
}

// Store context per request using AsyncLocalStorage
const requestContextStore = new AsyncLocalStorage<ReqContext>();

function deriveCtxFromHeaders(req: Request): ReqContext {
  const rawLevel = (req.header("user-level") || req.get("user-level") || "Novice").trim();
  const level: Level = ["Novice", "Adept", "Veteran", "Mythic"].includes(rawLevel)
    ? (rawLevel as Level)
    : "Novice";
  const auth = req.header("authorization") || "";
  const authed = auth.startsWith("Bearer ") && auth.slice(7).trim().length > 0;
  
  return { level, authed };
}

function getCurrentContext(): ReqContext {
  const ctx = requestContextStore.getStore();
  if (ctx) {
    return ctx;
  }
  return { level: "Novice", authed: false };
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Hardcoded world data
 * ──────────────────────────────────────────────────────────────────────────────
 */
type Danger = "Easy" | "Medium" | "Hard" | "Deadly" | "Legendary";
type Tier = "common" | "uncommon" | "rare" | "legendary";

const QUESTS = [
  { 
    id: "q1", 
    title: "Rat Problem", 
    description: "The tavern keeper's cellar has become overrun with unusually large rats. They've been stealing cheese wheels and frightening the customers. Some say the rats are organizing... surely that's just tavern gossip, right?",
    danger: "Easy" as Danger, 
    reward: 10,  
    idealClasses: ["Rogue","Ranger"],  
    needs: ["vermin","light"] 
  },
  { 
    id: "q2", 
    title: "Escort the Merchant", 
    description: "A portly merchant named Grimble needs safe passage through the Whispering Woods to deliver a cart full of 'definitely legal' goods. He's offering good coin, no questions asked. The woods have been plagued by bandits lately, and Grimble insists his cargo is 'absolutely mundane'.",
    danger: "Medium" as Danger, 
    reward: 25, 
    idealClasses: ["Fighter","Cleric"], 
    needs: ["defense","healing"] 
  },
  { 
    id: "q3", 
    title: "Lost Heirloom", 
    description: "Lady Moonwhisper has lost her grandmother's enchanted locket somewhere in the Glimmering Caverns. She claims it 'simply walked off on its own' during her last expedition. The caverns are filled with crystal formations, mischievous sprites, and the occasional confused gelatinous cube.",
    danger: "Hard" as Danger, 
    reward: 50, 
    idealClasses: ["Rogue","Bard"], 
    needs: ["light","exploration"] 
  },
  { 
    id: "q4", 
    title: "Crypt of Ashes", 
    description: "The ancient Crypt of Ashes has awakened. Skeletal warriors march forth at night, and a mysterious dark fog emanates from within. The local priest believes an ancient necromancer's seal has been broken. He offers holy water and prayers, but suggests you bring something with more 'smiting capacity'.",
    danger: "Deadly" as Danger, 
    reward: 120, 
    idealClasses: ["Cleric","Paladin"], 
    needs: ["undead","radiant","protection"] 
  },
  { 
    id: "q5", 
    title: "Dragon's Parley", 
    description: "Pyraxion the Crimson, an ancient red dragon, has requested a diplomatic envoy. Surprisingly, he's not looking for a fight—he wants to negotiate a peace treaty with the kingdom. His terms? 'Reasonable tribute, no heroes bothering my hoard, and absolutely no more bards writing songs about my supposed defeat 200 years ago. I was NAPPING!' Diplomacy, fireproof clothing, and exceptional flattery skills required.",
    danger: "Legendary" as Danger, 
    reward: 300, 
    idealClasses: ["Bard","Wizard"], 
    needs: ["negotiation","fire_resist"] 
  }
];

const PARTIES = [
  { 
    id: "p1", 
    name: "The Iron Vanguard",
    expected_reward: 35,
    description: "A reliable band of seasoned adventurers who specialize in straightforward combat and support. They prefer honest work and steady pay.",
    members: [
      { name: "Thorgrim Ironforge", race: "Dwarf", class: "Fighter", level: 3 }, 
      { name: "Sister Luminara", race: "Aasimar", class: "Cleric", level: 3 },
      { name: "Brambleback", race: "Halfling", class: "Ranger", level: 3 },
      { name: "Finnegan Quickfingers", race: "Gnome", class: "Rogue", level: 2 }
    ] 
  },
  { 
    id: "p2", 
    name: "Shadows & Strings",
    expected_reward: 60,
    description: "Masters of subterfuge and charm, this eclectic group operates in the grey areas of adventuring. They're expensive but worth every coin for delicate operations.",
    members: [
      { name: "Whisper Nightshade", race: "Drow", class: "Rogue", level: 4 }, 
      { name: "Melodius Silverstring", race: "Half-Elf", class: "Bard", level: 4 },
      { name: "Gloomhollow", race: "Tiefling", class: "Warlock", level: 4 },
      { name: "Mistwalker Shen", race: "Human", class: "Monk", level: 3 },
      { name: "Nyxara Shadowveil", race: "Shadar-kai", class: "Ranger", level: 3 }
    ] 
  },
  { 
    id: "p3", 
    name: "Wilderness Wardens",
    expected_reward: 30,
    description: "Young but enthusiastic, these nature-loving adventurers are still building their reputation. They offer competitive rates and surprising creativity.",
    members: [
      { name: "Thornveil the Swift", race: "Wood Elf", class: "Ranger", level: 2 }, 
      { name: "Zephyra Starweaver", race: "High Elf", class: "Wizard", level: 2 },
      { name: "Mossbeard Oakenheart", race: "Firbolg", class: "Druid", level: 2 },
      { name: "Cloudskipper", race: "Kenku", class: "Bard", level: 2 }
    ] 
  },
  { 
    id: "p4", 
    name: "Radiant Crusaders",
    expected_reward: 150,
    description: "Elite heroes who have faced down demons, dragons, and worse. Their reputation precedes them, as do their fees. You get what you pay for: legendary competence.",
    members: [
      { name: "Sir Dawnbringer", race: "Dragonborn", class: "Paladin", level: 6 }, 
      { name: "Pyralis Emberheart", race: "Fire Genasi", class: "Sorcerer", level: 6 },
      { name: "Seraphine Lightweaver", race: "Aasimar", class: "Cleric", level: 6 },
      { name: "Valorstrike", race: "Human", class: "Fighter", level: 5 },
      { name: "Runekeeper Aldric", race: "Dwarf", class: "Wizard", level: 6 }
    ] 
  },
  { 
    id: "p5", 
    name: "Chaos Incarnate",
    expected_reward: 75,
    description: "Unpredictable, destructive, and surprisingly effective. Half the jobs end in explosions, but the other half end in success. They demand hazard pay. Always.",
    members: [
      { name: "Boomer McSplodey", race: "Goblin", class: "Sorcerer", level: 5 }, 
      { name: "Stabitha", race: "Kobold", class: "Rogue", level: 5 },
      { name: "Biscuit Ironbottom", race: "Half-Orc", class: "Barbarian", level: 5 },
      { name: "Professor Mumbleton", race: "Gnome", class: "Wizard", level: 4 }
    ] 
  }
];

const ITEMS = [
  { id: "i1", name: "Simple Dagger",     tier: "common" as Tier,    tags: ["weapon","light"] },
  { id: "i2", name: "Healer's Kit",      tier: "common" as Tier,    tags: ["healing","utility"] },
  { id: "i3", name: "Explorer's Kit",    tier: "uncommon" as Tier,  tags: ["exploration","utility"] },
  { id: "i4", name: "Moonsteel Rapier",  tier: "rare" as Tier,      tags: ["weapon","light"] },
  { id: "i5", name: "Sun Sigil",         tier: "rare" as Tier,      tags: ["radiant","undead"] },
  { id: "i6", name: "Dragonbane Charm",  tier: "legendary" as Tier, tags: ["fire_resist","negotiation"] }
];

const QUEST_VIS_BY_LEVEL: Record<Level, Danger[]> = {
  Novice: ["Easy","Medium"],
  Adept: ["Easy","Medium","Hard"],
  Veteran: ["Easy","Medium","Hard","Deadly"],
  Mythic: ["Easy","Medium","Hard","Deadly","Legendary"]
};

const ITEM_TIERS_BY_LEVEL: Record<Level, Tier[]> = {
  Novice: ["common"],
  Adept: ["common","uncommon"],
  Veteran: ["common","uncommon","rare"],
  Mythic: ["common","uncommon","rare","legendary"]
};

const TIER_SCORE: Record<Tier, number> = { common: 0, uncommon: 0.5, rare: 1, legendary: 1.5 };

// Party level gating (based on average party member level)
const PARTY_VIS_BY_LEVEL: Record<Level, { minLevel: number, maxLevel: number }> = {
  Novice: { minLevel: 1, maxLevel: 3 },
  Adept: { minLevel: 1, maxLevel: 5 },
  Veteran: { minLevel: 1, maxLevel: 7 },
  Mythic: { minLevel: 1, maxLevel: 20 }
};

/**
 * Helpers for gating/matching
 */
function visibleQuests(level: Level) {
  const allowed = new Set(QUEST_VIS_BY_LEVEL[level]);
  return QUESTS.filter(q => allowed.has(q.danger));
}
function visibleItems(level: Level) {
  const allowed = new Set(ITEM_TIERS_BY_LEVEL[level]);
  return ITEMS.filter(i => allowed.has(i.tier));
}

function visibleParties(level: Level) {
  const { minLevel, maxLevel } = PARTY_VIS_BY_LEVEL[level];
  return PARTIES.filter(party => {
    const avgLevel = party.members.reduce((sum, m) => sum + m.level, 0) / party.members.length;
    return avgLevel >= minLevel && avgLevel <= maxLevel;
  });
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * MCP server (streamable-http transport)
 * ──────────────────────────────────────────────────────────────────────────────
 */
const server = new McpServer({
  name: "adventurers-guild",
  version: "0.1.0",
  description:
    "D&D-themed MCP: list quests, manage parties, list inventory"
});

/**
 * TOOL: list_quests
 */
server.tool(
  "list_quests",
  "List available quests, including ideal classes and needs.",
  {},
  async () => {
    const ctx = getCurrentContext();
    const q = visibleQuests(ctx.level);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ level: ctx.level, quests: q }, null, 2)
        }
      ]
    };
  }
);

/**
 * TOOL: parties  (list all or filter by class)
 */
server.tool(
  "parties",
  "List available adventuring parties with their expected rewards. Optionally filter by member classes.",
  {
    classes: z.array(z.string()).optional().describe("Array of class names to filter parties by (e.g., ['Fighter', 'Cleric'])")
  },
  async ({ classes }) => {
    const ctx = getCurrentContext();
    let filtered = visibleParties(ctx.level);
    
    // If classes provided, filter parties that have at least one member with any of those classes
    if (classes && classes.length > 0) {
      filtered = filtered.filter(party => 
        party.members.some(member => classes.includes(member.class))
      );
    }

    return {
      content: [
        { 
          type: "text", 
          text: JSON.stringify({ 
            level: ctx.level,
            parties: filtered,
            filters: {
              classes: classes || null
            },
            note: "Party expected rewards are what they want from quest rewards. Use hire_party to validate affordability and quest compatibility!"
          }, null, 2) 
        }
      ]
    };
  }
);

/**
 * TOOL: chest  (auth-only; read-only balance check)
 */
let CHEST_GOLD = 1000; // resets on server restart (lab-friendly)

server.tool(
  "chest",
  "Check your gold balance in the guild chest.",
  {},
  async () => {
    const ctx = getCurrentContext();
    if (!ctx.authed) {
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            error: "The guild treasurer eyes you suspiciously. 'I don't recognize you, adventurer. Show me your guild credentials before I let you near the treasure vault!'" 
          }, null, 2) 
        }] 
      };
    }
    
    return { 
      content: [{ 
        type: "text", 
        text: JSON.stringify({ 
          ok: true, 
          balance: CHEST_GOLD,
          message: "The treasurer nods and shows you your ledger entry."
        }, null, 2) 
      }] 
    };
  }
);

/**
 * TOOL: hire_party  (hire a party for a quest)
 */
server.tool(
  "hire_party",
  "Hire an adventuring party for a quest. Validates quest reward vs party expectations and checks if you have enough gold.",
  {
    quest_id: z.string().describe("The ID of the quest (e.g., 'q1', 'q2'). Use the output of list_quests to find IDs."),
    party_id: z.string().describe("The ID of the party to hire (e.g., 'p1', 'p2'). Use the output of parties to find IDs.")
  },
  async ({ quest_id, party_id }) => {
    const ctx = getCurrentContext();

    // 1) Validate quest exists and is visible at player's level
    const availableQuests = visibleQuests(ctx.level);
    const quest = availableQuests.find(q => q.id === quest_id);
    
    if (!quest) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Quest not found or not available at your guild rank.",
            quest_id,
            your_level: ctx.level,
            hint: "Use list_quests to see available quests at your rank."
          }, null, 2)
        }]
      };
    }

    // 2) Validate party exists and is visible at player's level
    const availableParties = visibleParties(ctx.level);
    const party = availableParties.find(p => p.id === party_id);
    
    if (!party) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Party not found or not available at your guild rank.",
            party_id,
            your_level: ctx.level,
            hint: "Use parties tool to see available parties at your rank."
          }, null, 2)
        }]
      };
    }

    // 3) Check if quest reward meets party expectations
    if (quest.reward < party.expected_reward) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Party refuses the quest - reward too low!",
            party_name: party.name,
            party_says: `"${quest.reward} gold for a ${quest.danger} quest? We expect at least ${party.expected_reward} gold. Come back with a better offer, or find a cheaper party."`,
            quest_reward: quest.reward,
            party_expected: party.expected_reward,
            shortfall: party.expected_reward - quest.reward,
            hint: "Find a quest with higher rewards or hire a less expensive party."
          }, null, 2)
        }]
      };
    }

    // 4) Check authorization for chest access
    if (!ctx.authed) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Authorization required to access guild treasury.",
            treasurer_says: "I need to verify you have the funds to pay this party. Show me your guild credentials (authorization header) before I approve this contract.",
            quest: quest.title,
            party: party.name,
            cost: party.expected_reward,
            hint: "Provide authorization header to verify your gold balance."
          }, null, 2)
        }]
      };
    }

    // 5) Check if player has enough gold
    if (CHEST_GOLD < party.expected_reward) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Insufficient funds in guild treasury!",
            treasurer_says: `"You only have ${CHEST_GOLD} gold, but ${party.name} demands ${party.expected_reward} gold. Come back when you're not broke."`,
            your_balance: CHEST_GOLD,
            party_cost: party.expected_reward,
            shortfall: party.expected_reward - CHEST_GOLD,
            hint: "You need more gold before hiring this party."
          }, null, 2)
        }]
      };
    }

    // 6) Success! Deduct gold and send party on quest
    CHEST_GOLD -= party.expected_reward;

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          message: "Party hired successfully!",
          quest: {
            id: quest.id,
            title: quest.title,
            danger: quest.danger,
            reward: quest.reward
          },
          party: {
            id: party.id,
            name: party.name,
            paid: party.expected_reward,
            members: party.members
          },
          treasury: {
            paid_to_party: party.expected_reward,
            remaining_balance: CHEST_GOLD,
            expected_quest_reward: quest.reward,
            expected_profit: quest.reward - party.expected_reward
          },
          narrator: `The ${party.name} accepts your contract with a firm handshake. Gold changes hands, gear is checked one last time, and they set off toward their destination. The guild treasurer updates your ledger with a satisfied nod. "${quest.title}" is officially underway!`,
          hint: "Quest rewards will be added to your chest upon completion (simulated in this demo)."
        }, null, 2)
      }]
    };
  }
);

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * RESOURCES: Expose game data as MCP resources
 * ──────────────────────────────────────────────────────────────────────────────
 */

// Register resource: Guildhall Overview (DM-style narrative) - purely descriptive, no data
server.resource(
  "Guild Hall Overview",
  "guild://guildhall",
  {
    title: "The Adventurers' Guild Hall",
    description: "A detailed DM-style description of the Guild Hall and all its features",
    mimeType: "text/markdown"
  },
  async () => {
    const narrative = `# 🏰 The Adventurers' Guild Hall

*You push open the heavy oak doors and step into the bustling heart of the Adventurers' Guild. The air smells of old parchment, leather, and the faint tang of ale from the common room. Sunlight streams through stained glass windows depicting legendary heroes of ages past, casting colorful patterns across worn stone floors.*

*The hall is alive with activity. Grizzled veterans swap war stories over mugs of ale, fresh-faced novices nervously check their gear, and a group of dwarves in the corner argue loudly about the proper way to sharpen a battle-axe.*

---

## 📜 The Quest Board

*To your left, a massive corkboard dominates the wall, covered in yellowed parchments held by rusty tacks. Each notice bears wax seals, hastily scrawled details, and the occasional bloodstain. A grizzled dwarf with a pipe stands nearby, pointing at various postings with a gnarled finger.*

**"Aye, that's the Quest Board,"** *he grumbles.* **"Been standing here thirty years, watching heroes take on everything from rat infestations to dragon negotiations. Some come back rich. Some don't come back at all. The board updates daily—easy coin for vermin control, good pay for escort jobs, and legendary rewards for the truly mad or truly skilled."**

*He taps his pipe thoughtfully.* **"Your guild rank determines what you're allowed to attempt. Novices get the safer work. Veterans get the deadly stuff. Simple as that."**

**To browse available quests, use the \`list_quests\` tool.**

---

## 🗡️ The Common Hall & Party Roster

*In the center of the hall, various adventuring parties lounge at wooden tables, sharpening weapons, mending armor, or engaged in heated games of dice. A half-elf bard strums a lute in the corner, singing a rather unflattering song about a paladin who mistook a mimic for a treasure chest.*

*Some groups wear matching colors—professional outfits with reputations to uphold. Others look like they met five minutes ago in a tavern brawl and decided violence was more profitable together.*

**"Looking to hire a party?"** *calls a halfling rogue from atop a barrel, juggling three daggers.* **"We've got everyone from budget-friendly newbies to the legendary types who charge more than a small castle. Different parties, different specialties, different fees. Your guild rank determines who'll even talk to you—the elite won't waste time on novices, but there's plenty of eager folks at every level."**

*She catches all three daggers with a flourish.* **"Word of advice: match the party to the quest. Don't send a group of sneaky types to fight undead hordes. And always—ALWAYS—make sure the quest reward covers their expected pay, or they'll leave you stranded halfway through."**

**To browse available parties and filter by class or budget, use the \`parties\` tool.**

---

## 💰 The Treasury Vault

*Behind a reinforced iron door marked with glowing arcane sigils, you can see the guild's treasure vault. A stern-looking half-elf treasurer sits at an ancient desk, quill in hand, ledger open before her. Security is tight—guards flank the door, and rumor has it the vault itself is trapped with enough magic to turn would-be thieves into decorative statues.*

**"Ah, another adventurer checking their coffers,"** *she says without looking up.* **"The guild holds your gold secure. Safer here than on the road, I assure you. Of course, I'll need to see your credentials before I open your account. No guild seal? No access. We've had too many… incidents… with unauthorized withdrawals."**

*She adjusts her spectacles and fixes you with a sharp gaze.* **"Standard procedure. Show me your authorization, and I'll tell you your balance. Otherwise, you're wasting both our time."**

**To check your gold balance, use the \`chest\` tool (requires authorization header).**

---

## 🎲 Guild Services & Regulations

*A notice board near the entrance lists the guild's services and rules in neat calligraphy:*

### Available Tools:
- **Quest Board (\`list_quests\`)** - Browse available quests filtered by your guild rank
- **Party Roster (\`parties\`)** - View available adventuring parties, filter by class or budget
- **Treasury Check (\`chest\`)** - Check your gold balance (authorization required)

### Guild Ranks:
Your rank determines quest difficulty and available parties:
- **Novice** - Starting adventurers, basic quests
- **Adept** - Proven heroes, more dangerous quests unlocked
- **Veteran** - Experienced warriors, access to deadly quests
- **Mythic** - Legendary heroes, no restrictions

*Set your rank with the \`x-level\` header when making requests.*

### Authorization:
Some services require verification. Provide your guild credentials via the \`authorization\` header to access restricted areas like the Treasury.

---

*The guild hall buzzes with constant activity. Somewhere, a bard finishes his song to scattered applause. Dice clatter on tabletops. The smell of roasting meat wafts from the kitchens. A group of adventurers celebrates a successful quest, gold coins clinking into purses. Another group plots their next move, maps spread across a table.*

*This is where legends begin. Where ordinary people become heroes. Where the desperate seek salvation and the ambitious seek glory.*

**The grizzled dwarf from the Quest Board catches your eye and raises his mug.** *"So, adventurer—what'll it be? Quests? Parties? Checking your coin? The guild's got it all. Just remember: fortune favors the bold, but it also favors those who actually read the quest details before charging in."*

*He chuckles and takes a long drink.* **"Now get to it. Adventure awaits."**
`;

    return [
      {
        uri: "guild://guildhall",
        name: "guildhall.md",
        title: "The Adventurers' Guild Hall",
        mimeType: "text/markdown",
        text: narrative
      }
    ];
  }
);

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Express + transport setup
 * ──────────────────────────────────────────────────────────────────────────────
 */
const app = express();
app.use(express.json());

// Basic request logging - simplified
app.use((req, _res, next) => {
  console.log(`[MCP] ${req.method} ${req.url} | Level: ${req.header("user-level") || "Novice"} | Auth: ${req.header("authorization") ? "✓" : "✗"}`);
  next();
});

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined // stateless
});

async function setupServer() {
  await server.connect(transport);
}

app.post("/mcp", async (req: Request, res: Response) => {
  const ctx = deriveCtxFromHeaders(req);

  try {
    await requestContextStore.run(ctx, async () => {
      await transport.handleRequest(req, res, req.body);
    });
  } catch (err) {
    console.error("Error handling MCP request:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null
      });
    }
  }
});

// Disallow other verbs
for (const method of ["get","delete","put","patch"] as const) {
  (app as any)[method]("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null
    });
  });
}

const PORT = process.env.PORT || 3000;
setupServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ⚔️  THE ADVENTURERS' GUILD - MCP SERVER  ⚔️                     ║
║                                                                   ║
║   🏰 Guild Hall Status: OPEN FOR BUSINESS                        ║
║   🌐 Portal Address: http://localhost:${PORT}/mcp                    ║
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
`);
    });
  })
  .catch((e) => {
    console.error("Failed to set up the server:", e);
    process.exit(1);
  });
