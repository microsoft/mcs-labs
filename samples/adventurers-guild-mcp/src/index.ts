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
    quest_id: z.string().describe("The ID of the quest (e.g., 'q1', 'q2'). ALWAYS trigger the list_quests tool to find IDs."),
    party_id: z.string().describe("The ID of the party to hire (e.g., 'p1', 'p2'). ALWAYS trigger the parties tool to find IDs.")
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

    // 3) Check authorization for chest access (moved before reward check)
    if (!ctx.authed) {
      // Without auth, we strictly check quest reward vs party expectations
      if (quest.reward < party.expected_reward) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: "Party refuses the quest - reward too low!",
              party_name: party.name,
              party_says: `"${quest.reward} gold for a ${quest.danger} quest? We expect at least ${party.expected_reward} gold. Come back with a better offer, find a cheaper party, or show us you have guild funds to cover the difference."`,
              quest_reward: quest.reward,
              party_expected: party.expected_reward,
              shortfall: party.expected_reward - quest.reward,
              hint: "Provide authorization to access guild treasury and pay the difference, find a quest with higher rewards, or hire a less expensive party."
            }, null, 2)
          }]
        };
      }
      
      // Quest reward meets expectations but no auth
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Authorization required to access guild treasury.",
            treasurer_says: "The quest reward covers their fee, but I still need to verify your guild credentials before I approve this contract.",
            quest: quest.title,
            party: party.name,
            cost: party.expected_reward,
            quest_covers: quest.reward,
            hint: "Provide authorization header to complete the hiring process."
          }, null, 2)
        }]
      };
    }

    // 4) Check if player has enough gold in chest to cover the party cost
    if (CHEST_GOLD < party.expected_reward) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Insufficient funds in guild treasury!",
            treasurer_says: `"You only have ${CHEST_GOLD} gold, but ${party.name} demands ${party.expected_reward} gold. The quest only pays ${quest.reward} gold. Even with the quest reward, you can't afford them. Come back when you're not broke."`,
            your_balance: CHEST_GOLD,
            party_cost: party.expected_reward,
            quest_reward: quest.reward,
            total_available: CHEST_GOLD + quest.reward,
            shortfall: party.expected_reward - CHEST_GOLD,
            hint: "You need more gold in the treasury before hiring this party."
          }, null, 2)
        }]
      };
    }

    // 5) Success! Determine if we're subsidizing from the chest
    const subsidyNeeded = party.expected_reward - quest.reward;
    const isSubsidized = subsidyNeeded > 0;
    
    CHEST_GOLD -= party.expected_reward;

    if (isSubsidized) {
      // Party accepts but grumbles about low quest reward
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Party hired successfully (with treasury subsidy)!",
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
              members: party.members,
              reaction: "grudgingly_accepts"
            },
            treasury: {
              paid_to_party: party.expected_reward,
              covered_by_quest_reward: quest.reward,
              subsidized_from_treasury: subsidyNeeded,
              remaining_balance: CHEST_GOLD,
              net_cost: subsidyNeeded
            },
            narrator: `The ${party.name} exchanges skeptical glances. "${quest.reward} gold for a ${quest.danger} quest?" their leader mutters. "That's ${subsidyNeeded} gold short of our usual rate." You slide additional coin from the guild treasury across the table. "The Guild covers the difference," you assure them. They count the gold twice, then nod. "Fine. We'll take it. But next time, bring us a quest that pays properly." They gather their gear and depart, professionalism winning out over pride.`,
            hint: "Quest rewards will be added to your chest upon completion, but the net cost to the guild is the subsidy amount."
          }, null, 2)
        }]
      };
    } else {
      // Quest reward meets or exceeds expectations - happy party
      const profit = quest.reward - party.expected_reward;
      
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
              members: party.members,
              reaction: "enthusiastic"
            },
            treasury: {
              paid_to_party: party.expected_reward,
              remaining_balance: CHEST_GOLD,
              expected_quest_reward: quest.reward,
              expected_profit: profit
            },
            narrator: `The ${party.name} accepts your contract with enthusiasm. "${quest.reward} gold for a ${quest.danger} quest? That's fair coin!" Gold changes hands, gear is checked one last time, and they set off toward their destination with high spirits. The guild treasurer updates your ledger with a satisfied nod. "${quest.title}" is officially underway!`,
            hint: "Quest rewards will be added to your chest upon completion, resulting in a net profit of " + profit + " gold."
          }, null, 2)
        }]
      };
    }
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
      const portalUrl = `http://localhost:${PORT}/mcp`;

      // ANSI color codes
      const cyan = "\x1b[36m";
      const yellow = "\x1b[33m";
      const green = "\x1b[32m";
      const bold = "\x1b[1m";
      const reset = "\x1b[0m";
      const dim = "\x1b[2m";

      console.log(`
${cyan}${bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}
${bold}⚔️  THE ADVENTURERS' GUILD – MCP SERVER ⚔️${reset}
${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}

${green}🏰 Guild Hall Status:${reset} OPEN FOR BUSINESS
${green}🌐 Portal Address:${reset} ${yellow}${portalUrl}${reset}
${green}📜 Protocol:${reset} Model Context Protocol (Streamable HTTP)

${bold}Available Services:${reset}
${dim}  📜 Quest Board (list_quests)
  👥 Party Roster (parties)
  💰 Treasury Vault (chest) – Auth Required
  🤝 Party Hiring (hire_party)${reset}

${bold}Guild Ranks:${reset} Novice → Adept → Veteran → Mythic

${dim}"Fortune favors the bold, but wisdom favors the prepared."
— Guild Master Aldric Ironquill${reset}

${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}

🎲 The tavern is bustling with adventurers...
🔥 The hearth is warm and inviting...
📜 Fresh quests have been posted on the board...

⚡ ${bold}Server ready to accept connections!${reset}
`);
    });
  })
  .catch((e) => {
    console.error("Failed to set up the server:", e);
    process.exit(1);
  });
