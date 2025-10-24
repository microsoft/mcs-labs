# Lab Authoring Guide

This guide ensures consistency across all Microsoft Copilot Studio Labs, regardless of who authors them.

## 📋 Quick Reference

| Element                    | Format                              | Example                             |
| -------------------------- | ----------------------------------- | ----------------------------------- |
| Code (syntax highlighting) | ` ```language `                     | ` ```javascript `, ` ```python `    |
| Plain text (copy-paste)    | ` ```text ` or ` ```plaintext `     | Instructions, configuration text    |
| Inline code                | Single backticks                    | `variableName`, `FileName.ts`       |
| UI elements                | **Bold**                            | **Save**, **Next**, **Create**      |
| Field names                | _Italics_                           | _Display Name_, _Description_       |
| Headings                   | h2 for sections, h3 for subsections | `## Use Case 1`, `### Step-by-step` |

## 🎯 Core Principles

### 1. Use the Lab Template

**ALWAYS** start with `/labs/lab-template.md` - it provides:
- Consistent structure across all labs
- Required sections and formatting
- Author guidance in HTML comments
- Tested user experience patterns

### 2. Follow the Two-Use-Case Pattern

All labs must follow this structure:
- Exactly 2 use cases (no more, no less)
- Progressive complexity (Use Case 2 builds on Use Case 1)
- Clear value proposition for each
- Realistic time estimates (tested with actual users)

### 3. Write for Your Audience

**Know your persona:**
- **Maker**: Business users, no-code/low-code focus
- **Developer**: Technical users, code-heavy content
- **Admin**: IT professionals, governance focus

**Adjust tone and depth accordingly** - a lab for Makers should avoid technical jargon, while a Developer lab can dive deeper into implementation details.

## 💻 Code Block Standards

### Default Behavior: Plain Text

**By default, all code blocks are treated as plain text** unless you explicitly specify a language.

This is because most lab content consists of:
- Instructions to copy and paste
- Configuration text
- Sample data
- User prompts and responses

### When to Use Syntax Highlighting

**Only use language tags for actual code** that benefits from syntax highlighting:

````markdown
```javascript
function deriveCtxFromHeaders(headers: Record<string, string>): Context {
  const rawLevel = headers["user-level"] || "Novice";
  return { level };
}
```
````

````markdown
```python
def calculate_total(items):
    return sum(item.price for item in items)
```
````

````markdown
```json
{
  "name": "My Agent",
  "version": "1.0"
}
```
````

**Supported languages for syntax highlighting:**
JavaScript, TypeScript, Python, C#, JSON, YAML, Bash, PowerShell, SQL, XML, HTML, CSS

### When to Use Plain Text (Default)

**For everything else, use no language tag or explicitly use `text`:**

Simple fenced block (no language - treated as plain text):
````markdown
```
Extract Contract Number, Customer name, Vendor name and Date from {ContractInput}
Customer Name: Adventure Works
Vendor Name: Contoso Solutions Inc.
Date (Effective Date): March 10, 2024
```
````

Explicit plain text tag (optional):
````markdown
```text
New Contract Available for Review:
Contract Number: AW2024-003
Customer Name: Adventure Works
```
````

**Use plain text for:**
- Copy-paste instructions for users
- Configuration values
- Sample prompts and outputs
- Data to be entered into forms
- Natural language content
- Anything that isn't actual code

### Quick Decision Guide

Ask yourself: **"Would syntax highlighting make this easier to read?"**

- ✅ **YES** - Function definitions, API calls, JSON configs, SQL queries → Use language tag
- ❌ **NO** - Instructions, plain text, sample data, user prompts → Use no tag or `text`

**Why this matters:**
- Plain text blocks are rendered without syntax highlighting (cleaner for instructions)
- No confusing syntax highlighting on non-code content
- Users understand they should copy text exactly as-is
- Cleaner, more readable lab content
- Better performance (server-side highlighting only for actual code)

### Examples from Real Labs

**❌ Don't do this (unnecessary highlighting):**
````markdown
```javascript
Extract Contract Number, Customer name, and Vendor name from {ContractInput}
```
````

**✅ Do this instead:**
````markdown
```
Extract Contract Number, Customer name, and Vendor name from {ContractInput}
```
````

**✅ Syntax highlighting for actual code:**
````markdown
```typescript
export function visibleQuests(level: Level) {
  const allowed = new Set(QUEST_VIS_BY_LEVEL[level]);
  return QUESTS.filter(q => allowed.has(q.danger));
}
```
````

**✅ No highlighting for user instructions:**
````markdown
```
Copilot Studio adds header → user-level: Mythic (from connector input)
MCP server receives request with the user-level header
```
````

## 💻 Code Block Standards

Use single backticks for:
- Variable names: `customerId`, `userName`
- File names: `index.ts`, `config.json`
- API endpoints: `/api/contracts`
- Short code snippets: `const result = await fetch(url)`

```markdown
Navigate to the `samples/adventurers-guild-mcp/src/` directory and open `index.ts`.
```

## 🎨 Formatting Standards

### Screenshots

**File naming convention:**
```
images/[step-number]-[descriptive-name].png
```

Examples:
- `images/01-create-agent.png`
- `images/02-configure-settings.png`
- `images/03-test-response.png`

**Alt text:**
Always include descriptive alt text for accessibility:
```markdown
![Screenshot showing the Create Agent dialog with Name and Description fields filled in](images/01-create-agent.png)
```

**When to use screenshots:**
- Complex UI navigation
- Configuration screens with multiple options
- Verification of expected results
- First-time user flows

**When NOT to use screenshots:**
- Simple button clicks
- Self-explanatory steps
- Rapidly changing UI elements

### UI Elements

| Element Type | Format    | Example                                     |
| ------------ | --------- | ------------------------------------------- |
| Buttons      | **Bold**  | Click **Save**                              |
| Tabs         | **Bold**  | Select the **Settings** tab                 |
| Menu items   | **Bold**  | **File** > **New** > **Agent**              |
| Field names  | _Italics_ | Enter your name in the _Display Name_ field |
| Field values | `Code`    | Set _Level_ to `Mythic`                     |

### Callout Boxes

Use GitHub-flavored markdown alerts:

```markdown
> [!TIP]
> Pro tip: Use connection references to make your solution portable across environments.
```

```markdown
> [!IMPORTANT]
> This step cannot be undone. Make sure to backup your configuration first.
```

```markdown
> [!NOTE]
> The agent may take 2-3 minutes to deploy. You can continue to the next step while waiting.
```

```markdown
> [!WARNING]
> Do not share API keys in screenshots or configuration files.
```

## 📝 Content Guidelines

### Step-by-Step Instructions

**Good:**
```markdown
1. In Copilot Studio, click **Create** in the left navigation.

2. Select **New agent** and enter the following details:
   - _Name_: `Sales Admin Assistant`
   - _Description_: `Helps with sales data analysis`

3. Click **Create** to initialize your agent.
```

**Bad:**
```markdown
1. Create an agent
2. Fill in the details
3. Save it
```

**Why?** The good example:
- Specifies exact locations ("in the left navigation")
- Uses consistent formatting for UI elements
- Provides actual values to enter
- Includes clear action verbs

### Fenced Code Blocks in Lists

**CRITICAL:** When placing code blocks inside numbered lists, indent them with 4 spaces:

```markdown
1. Create a new file called `index.ts`:

    ```typescript
    export function greet(name: string) {
      return `Hello, ${name}!`;
    }
    ```

2. Save the file and continue.
```

**Common mistake:**
```markdown
1. Create a new file called `index.ts`:
```typescript
export function greet(name: string) {
  return `Hello, ${name}!`;
}
```
2. Save the file and continue.
```

This breaks the numbered list! See [DEVELOPMENT.md - Markdown Authoring Notes](DEVELOPMENT.md#markdown-authoring-notes--fenced-code-blocks-in-lists) for details.

### Time Estimates

**Be realistic and test with actual users:**
- First-time users take longer than authors
- Include time for reading and understanding
- Account for environment setup and loading times
- Round to 5-minute increments

**Examples:**
- Simple configuration: 5-10 minutes
- Building an agent: 15-20 minutes
- Complex integration: 30-40 minutes

### Learning Outcomes

Use the **SMART framework:**
- **S**pecific: "Create a Copilot agent with SharePoint knowledge source"
- **M**easurable: "Configure and test 3 different prompts"
- **A**chievable: Realistic for the skill level
- **R**elevant: Aligned with business value
- **T**ime-bound: Fits within the lab duration

## ✅ Quality Checklist

Before submitting a lab, verify:

### Structure
- [ ] Uses lab-template.md as foundation
- [ ] Has exactly 2 use cases
- [ ] Includes all required sections
- [ ] Table of contents links work
- [ ] Progressive complexity (Use Case 2 builds on 1)

### Code Blocks
- [ ] Syntax highlighting for actual code
- [ ] `text` or `plaintext` for copy-paste instructions
- [ ] Code blocks indented in numbered lists
- [ ] Language specified for all code blocks
- [ ] No sensitive data (API keys, passwords) in code

### Formatting
- [ ] Screenshots follow naming convention
- [ ] Alt text on all images
- [ ] UI elements use correct formatting (bold/italic/code)
- [ ] Callout boxes use correct syntax
- [ ] Consistent heading levels (h2 for sections, h3 for subsections)

### Content
- [ ] Steps tested with fresh environment
- [ ] Time estimates realistic
- [ ] Prerequisites complete and accurate
- [ ] Links working and pointing to official docs
- [ ] No broken images
- [ ] Spelling and grammar checked

### Accessibility
- [ ] Alt text describes image content
- [ ] Color not the only way to convey information
- [ ] Code blocks have language labels
- [ ] Clear instructions without "click here" or "see below"

## 🔍 Validation Tools

### Local Testing

Before pushing changes:

```powershell
# Generate labs locally
pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs

# Start development server
docker-compose up -d

# View at: http://localhost:4000/mcs-labs/
```

### Markdown Linting

Check for markdown issues:

```powershell
# Run markdown detection for fenced blocks in lists
pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs -MarkdownDetectOnly
```

Fix any reported issues before committing.

### Screenshot Guidelines

**Size and resolution:**
- Max width: 1200px (scales well on all devices)
- Format: PNG for UI, JPG for photos
- Optimize file size (use tools like TinyPNG)

**Content:**
- Hide personal information (email, names, IDs)
- Use light theme for consistency
- Highlight relevant UI elements with arrows/boxes if needed
- Crop to show only relevant content

## 🚀 Publishing Workflow

1. **Create lab in `labs/[lab-name]/` directory**
   - Use `labs/lab-template.md` as starting point
   - Create `images/` subdirectory for screenshots

2. **Update `lab-config.yml`**
   - Add lab to appropriate journey(s)
   - Set correct metadata (duration, level, persona)
   - Assign bootcamp order if applicable

3. **Test locally**
   - Generate content: `pwsh scripts/Generate-Labs.ps1 -SkipPDFs`
   - Verify in browser at `http://localhost:4000/mcs-labs/`
   - Test all links and images
   - Check code block rendering

4. **Run validation**
   - Markdown lint check
   - Screenshot optimization
   - Link validation
   - Spell check

5. **Submit PR**
   - Include before/after screenshots
   - Describe learning outcomes
   - Tag relevant reviewers
   - Wait for CI/CD validation

6. **After merge**
   - PDFs auto-generate via GitHub Actions
   - Site deploys to GitHub Pages
   - Lab appears in portal within 5-10 minutes

## 📚 Additional Resources

- [Lab Template](../labs/lab-template.md) - Starting point for all labs
- [Development Guide](DEVELOPMENT.md) - Technical setup and architecture
- [Theme System](THEME_SYSTEM.md) - Understanding themes and styling
- [Markdown Guide](https://www.markdownguide.org/basic-syntax/) - Markdown basics
- [GitHub Flavored Markdown](https://github.github.com/gfm/) - Alert syntax reference

## 💡 Tips from Experienced Authors

### Start with the End in Mind
"I always write the learning outcomes and test questions first. It helps me focus on what really matters." - *Senior Lab Author*

### Test, Test, Test
"Have someone unfamiliar with the topic try your lab. You'll discover assumptions you didn't know you made." - *Lab Content Lead*

### Screenshots Age Quickly
"Only screenshot what's absolutely necessary. UI changes constantly and broken screenshots confuse users more than no screenshots." - *Technical Writer*

### Plain Text vs Code
"When in doubt, ask: 'Is this something a user would want syntax highlighting for?' If not, use `text` blocks." - *Developer Advocate*

### Time Estimates
"Double your initial time estimate, then add 5 minutes. First-time users are slower than you think." - *Workshop Facilitator*

---

**Questions or suggestions?** Open an issue or contribute to this guide via PR.

**Version:** 1.0  
**Last Updated:** October 2025  
**Maintainers:** MCS Labs Team
