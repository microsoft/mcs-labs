# Deploy and Monitor Your Copilot Studio Agents

Learn how to deploy your agents across multiple channels and use analytics to measure performance, identify issues, and continuously improve user experiences.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 30 minutes | After completing this lab, participants will be able to configure and deploy agents to multiple channels including web, Teams, and custom applications, understand channel-specific configuration options and security settings, access and interpret agent analytics including conversation metrics and user satisfaction, and use analytics insights to identify improvement opportunities and optimize agent performance. |

---

## 📚 Table of Contents

- [Why This Matters](#-why-this-matters)
- [Introduction](#-introduction)
- [Core Concepts Overview](#-core-concepts-overview)
- [Documentation and Additional Training Links](#-documentation-and-additional-training-links)
- [Prerequisites](#-prerequisites)
- [Summary of Targets](#-summary-of-targets)
- [Use Cases Covered](#-use-cases-covered)
- [Instructions by Use Case](#️-instructions-by-use-case)
  - [Use Case #1: Configure and Deploy Channels](#-use-case-1-configure-and-deploy-channels)
  - [Use Case #2: Monitor with Analytics](#-use-case-2-monitor-with-analytics)

---

## 🤔 Why This Matters

**An agent that no one can access is useless, and an agent you can't measure is impossible to improve.**

Think of channels and analytics like a retail store:
- **Without channels**: Your perfectly designed store (agent) has no doors or windows - customers can't get in, no matter how great the products are
- **Without analytics**: You have no idea how many customers visit, what they're looking for, or whether they leave satisfied - you're running a business blindfolded

**With channels and analytics**: Your agent is accessible where users already work (Teams, web, mobile), and you have data-driven insights to continuously improve performance and user satisfaction.

**Common challenges solved by this lab:**
- "My agent is ready but I don't know how to make it available to users"
- "I need my agent in Teams, on our website, and in our mobile app"
- "I can't tell if my agent is actually helping users"
- "I don't know which topics are failing or which questions users can't get answered"

**In 30 minutes, you'll learn how to deploy your agent everywhere users need it and measure its performance to drive continuous improvement.**

---

## 🌐 Introduction

Channels and analytics are the bridge between agent development and real-world impact. Channels determine where and how users interact with your agent - whether through Teams chat, embedded web widgets, mobile apps, or custom applications. Each channel has unique capabilities, configuration options, and security requirements. Analytics provide visibility into agent performance - tracking conversation volumes, resolution rates, user satisfaction, and failure patterns. Together, they enable you to deploy agents strategically and optimize them based on real user behavior.

**Real-world example:** A company builds a Copilot Studio agent for IT support. They deploy it to three channels: (1) Microsoft Teams for employee chat, (2) the internal company website for quick access without switching apps, and (3) a mobile app for field workers. Analytics reveal that Teams has the highest conversation volume, but the website channel has the lowest satisfaction scores. Digging deeper, they discover that website users frequently ask about VPN setup, but the agent lacks knowledge on this topic. They add VPN documentation to the agent's knowledge sources, and satisfaction scores increase by 40%. Without channels, users couldn't access the agent where they work. Without analytics, the VPN knowledge gap would remain invisible.

This lab teaches you how to deploy strategically and measure continuously - ensuring your agents reach users and deliver measurable value.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Channels** | Distribution points where users interact with your agent - each channel (Teams, web, mobile, custom) has unique capabilities, authentication requirements, and user experiences |
| **Web Channel** | Embeddable web widget that integrates agents into websites and web applications - offers the most flexibility with customizable appearance and security options |
| **Teams Channel** | Native Microsoft Teams integration that makes agents available in Teams chat and channels - provides seamless authentication and access within the Microsoft 365 ecosystem |
| **Channel Security** | Authentication and access controls that determine who can interact with your agent and how - essential for protecting sensitive data and ensuring compliance |
| **Conversation Analytics** | Metrics tracking conversation volume, topic usage, and session duration - these reveal how users interact with your agent and which capabilities they value most |
| **User Satisfaction Scores** | Feedback metrics measuring whether users found the agent helpful - low satisfaction scores indicate areas needing improvement in knowledge, instructions, or conversation flows |
| **Failure Analytics** | Data showing where conversations fail, which questions go unanswered, and where users escalate or abandon - these insights directly guide improvement priorities |

---

## 📄 Documentation and Additional Training Links

* [Configure channels for your agent](https://learn.microsoft.com/microsoft-copilot-studio/publication-fundamentals-publish-channels)
* [Deploy to Microsoft Teams](https://learn.microsoft.com/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)
* [Configure the demo website](https://learn.microsoft.com/microsoft-copilot-studio/publication-connect-bot-to-web-channels)
* [Analyze agent performance](https://learn.microsoft.com/microsoft-copilot-studio/analytics-overview)
* [Use conversation analytics](https://learn.microsoft.com/microsoft-copilot-studio/analytics-summary)

---

## ✅ Prerequisites

* Completed previous labs or an existing Copilot Studio agent ready for deployment
* Access to Microsoft Teams (for Teams channel testing)
* Permissions to configure channels and view analytics in Copilot Studio
* Basic understanding of web embedding concepts (helpful but not required)

---

## 🎯 Summary of Targets

In this lab, you'll deploy your agent to multiple channels and use analytics to measure and optimize performance. By the end of the lab, you will:

* Understand available channel options and their capabilities
* Configure and test the web channel with security settings
* Deploy your agent to Microsoft Teams
* Access and interpret conversation analytics including volume and topic metrics
* Analyze user satisfaction scores and identify improvement opportunities
* Use failure analytics to discover knowledge gaps and conversation issues

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Configure and Deploy Channels](#-use-case-1-configure-and-deploy-channels) | Make your agent accessible across web, Teams, and other platforms with appropriate security | 15 min |
| 2 | [Monitor with Analytics](#-use-case-2-monitor-with-analytics) | Measure agent performance and identify optimization opportunities using conversation data | 15 min |

---

## 🛠️ Instructions by Use Case

---

## 🧱 Use Case #1: Configure and Deploy Channels

Learn how to configure and deploy your agent to multiple channels, understand channel-specific settings, and implement appropriate security controls.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Configure and Deploy Channels | Make your agent accessible across web, Teams, and other platforms with appropriate security | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to navigate the Channels interface, configure the web channel with security settings, deploy to Microsoft Teams, and understand channel capabilities and limitations.

**Scenario:** Your Copilot Studio Assistant is ready for users. You need to make it available on your company website for easy access and in Microsoft Teams where most employees spend their day. You'll configure both channels with appropriate security settings.

### Objective

Deploy your agent to web and Teams channels with proper configuration and security.

---

### Step-by-step instructions

#### Navigate to Channels

1. In your Copilot Studio agent, click **Channels** in the left navigation panel.

2. Review the Channels overview page to see available channel options:
   - **Microsoft Teams**: Native Teams integration
   - **Demo website**: Test website for quick agent testing
   - **Custom website**: Embeddable web widget for your sites
   - **Mobile app**: iOS and Android integration
   - **Custom channel**: Direct Line API for custom applications
   - Additional channels may include Facebook, Slack, etc.

> [!NOTE]
> Available channels depend on your Copilot Studio license and environment settings. Some channels require additional configuration or premium licenses.

3. Notice which channels are already enabled or configured (typically the demo website is enabled by default).

#### Explore Channel Capabilities

4. Review the description and capabilities of each channel type:
   - **Teams**: Full authentication, rich adaptive cards, deep Microsoft 365 integration
   - **Web**: Customizable appearance, flexible security, easy embedding
   - **Mobile**: Native app experience with push notifications
   - **Custom**: Full API control for advanced integrations

> [!TIP]
> Choose channels based on where your users already work. Don't force users to adopt new tools - bring the agent to their existing environment.

5. Consider the limitations of each channel:
   - Some features (like certain adaptive cards) may not work on all channels
   - Authentication requirements vary by channel
   - Customization options differ across channels

#### Configure the Demo Website

6. Click on **Demo website** to view its configuration.

7. Review the demo website settings:
   - **Website URL**: The temporary URL where you can test your agent
   - **Status**: Whether the demo site is enabled or disabled

8. If the demo website isn't enabled, click **Enable** or **Turn on** to activate it.

9. Click **Copy** next to the demo website URL, then open it in a new browser tab.

10. Test your agent on the demo website by asking a few questions to verify functionality.

> [!TIP]
> The demo website is perfect for quick testing and sharing with stakeholders before full deployment. Use it to gather feedback before wider rollout.

#### Configure Custom Website Channel

11. Return to the Channels page and select **Custom website** (or **Website** depending on your interface).

12. Review the custom website configuration options:
    - **Embed code**: HTML/JavaScript code to embed the agent on your site
    - **Style customization**: Colors, fonts, and branding options
    - **Security settings**: Authentication and domain restrictions

13. Click on **Configure** or **Settings** to access detailed configuration options.

#### Configure Web Channel Security

14. In the custom website settings, locate the **Security** section.

15. Review the security options available:
    - **No authentication**: Anyone can access the agent (use for public websites)
    - **Require authentication**: Users must sign in (use for internal sites)
    - **Allowed domains**: Restrict embedding to specific domains

> [!IMPORTANT]
> Security settings are critical for protecting sensitive data and ensuring compliance. For internal agents with access to company data, always require authentication.

16. Configure domain restrictions by adding your website domains to the allowed list:

```
contoso.com
www.contoso.com
intranet.contoso.com
```

17. Review how domain restrictions prevent unauthorized embedding of your agent on external sites.

> [!WARNING]
> Without domain restrictions, anyone can embed your agent on any website. Always configure allowed domains for production deployments.

18. Click **Save** to apply the security settings.

#### Deploy to Microsoft Teams

19. Return to the Channels page and select **Microsoft Teams**.

20. Review the Teams channel configuration options:
    - **App name**: How the agent appears in Teams
    - **App icon**: Visual branding in Teams
    - **Availability**: Who can access the agent

21. Click **Turn on Teams** or **Enable** to activate the Teams channel.

22. Review the deployment options:
    - **Share with team**: Add the agent to a specific Teams team or channel
    - **Install for myself**: Add the agent to your personal Teams chat
    - **Submit for admin approval**: Request organization-wide deployment

23. Click **Download manifest** or **Get agent link** to get the Teams app package.

> [!NOTE]
> For organization-wide deployment, your IT admin must approve and publish the agent to your company's Teams app catalog.

24. Follow the prompts to install the agent in your personal Teams or share it with a team for testing.

25. Open Microsoft Teams and verify that the agent appears in your chat list or team channels.

#### Test Multi-Channel Deployment

26. Test your agent in Microsoft Teams by sending a few messages.

27. Compare the experience between Teams and the web demo site:
    - Notice how the UI differs
    - Test the same questions on both channels
    - Observe how authentication works on each channel

> [!TIP]
> Always test your agent on each deployed channel. Some features or formatting may work differently across channels.

#### Review Channel Limitations

28. Return to the Channels page in Copilot Studio.

29. Review the **Channel capabilities** documentation or table showing:
    - Which features work on which channels
    - Known limitations per channel
    - Recommended practices for multi-channel deployment

30. Consider how channel limitations might affect your agent design:
    - Avoid features that don't work on your primary channels
    - Design for the lowest common denominator if deploying everywhere
    - Create channel-specific topics for advanced features

---

###  🏅 Congratulations! You've completed Use Case 1!

---

### Test your understanding

**Key takeaways:**

* **Channels Enable Access** – Deploy to channels where your users already work to maximize adoption and minimize friction
* **Security Settings Matter** – Always configure appropriate authentication and domain restrictions to protect data and ensure compliance
* **Channel Capabilities Vary** – Test thoroughly on each channel and design agents that work within the limitations of your target platforms
* **Demo Sites Accelerate Feedback** – Use demo websites for quick testing and stakeholder review before full production deployment

**Lessons learned & troubleshooting tips:**

* If your agent doesn't appear in Teams after deployment, check with your IT admin about app approval policies
* Domain restrictions prevent unauthorized embedding - always configure allowed domains for production
* Test authentication flows on each channel to ensure proper security enforcement
* Some rich UI features may not work on all channels - design for compatibility

**Challenge: Apply this to your own use case**

* Which channels would provide the most value for your users?
* What security settings are appropriate for your agent's data sensitivity?
* How would you roll out your agent - pilot with a team first or organization-wide immediately?

---

---

## 🔄 Use Case #2: Monitor with Analytics

Learn how to access agent analytics, interpret performance metrics, identify improvement opportunities, and use data to optimize agent experiences.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Monitor with Analytics | Measure agent performance and identify optimization opportunities using conversation data | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to access the analytics dashboard, understand conversation volume and topic metrics, analyze user satisfaction scores, identify failure patterns, and use insights to improve your agent.

**Scenario:** Your agent has been deployed for several days. You need to understand how users are interacting with it, which topics are most popular, where conversations are failing, and whether users find it helpful. Analytics provide the insights needed to prioritize improvements.

### Objective

Access and interpret agent analytics to measure performance and identify optimization opportunities.

---

### Step-by-step instructions

#### Navigate to Analytics

1. In your Copilot Studio agent, click **Analytics** in the left navigation panel.

2. Review the analytics dashboard overview, which typically includes:
   - **Summary metrics**: Total conversations, engaged conversations, resolution rate
   - **Trend charts**: Conversation volume over time
   - **Topic performance**: Which topics are used most frequently
   - **User satisfaction**: Feedback scores from users

> [!NOTE]
> Analytics data may take 24-48 hours to populate for new agents. If your agent is brand new, you may see limited or no data initially.

3. Set the date range using the date picker (typically in the top right):
   - Last 7 days
   - Last 30 days
   - Custom date range

> [!TIP]
> Use consistent date ranges when comparing performance over time. Weekly reviews with 7-day ranges work well for ongoing monitoring.

#### Understand Summary Metrics

4. Review the **Total conversations** metric:
   - This shows how many conversation sessions occurred
   - A conversation typically starts when a user sends their first message and ends after a period of inactivity

5. Review the **Engaged conversations** metric:
   - Conversations where the user sent more than one message
   - Higher engagement suggests users are finding value and continuing the conversation

6. Calculate the **Engagement rate** (if not shown automatically):
   - Engagement Rate = Engaged Conversations ÷ Total Conversations × 100%
   - Higher engagement rates indicate the agent is providing valuable assistance

> [!NOTE]
> Low engagement might mean users get answers immediately (good) or give up after the first response (bad). Combine this metric with satisfaction scores for proper interpretation.

#### Analyze Conversation Volume Trends

7. Review the **Conversation volume** chart showing conversations over time.

8. Look for patterns and trends:
   - **Peaks**: When is demand highest? Plan capacity accordingly
   - **Valleys**: When is usage lowest? Schedule maintenance during these times
   - **Trends**: Is usage growing over time? Flat lines may indicate awareness issues

9. Consider external factors that might influence trends:
   - Business cycles (month-end, quarter-end)
   - Seasonal patterns
   - Recent communications or awareness campaigns

> [!TIP]
> Share positive growth trends with stakeholders to demonstrate adoption and value. Use declining trends as signals to refresh content or increase awareness.

#### Review Topic Performance

10. Navigate to the **Topics** section in analytics (may be a separate tab or section).

11. Review the **Topic usage** metrics showing:
    - Which topics are triggered most frequently
    - How many conversations used each topic
    - Average conversation duration per topic

12. Identify your **top topics**:
    - These represent the most common user needs
    - Ensure these topics have excellent quality and comprehensive coverage
    - Consider creating child agents for highly-used complex topics

13. Identify **unused or rarely used topics**:
    - These may indicate topics that don't match real user needs
    - Consider removing or consolidating rarely-used topics
    - Investigate if trigger phrases need improvement

> [!IMPORTANT]
> Not all topics should be equally used. Focus optimization efforts on high-volume topics that impact the most users.

#### Analyze User Satisfaction

14. Navigate to the **User satisfaction** section in analytics.

15. Review satisfaction metrics:
    - **Overall satisfaction score**: Percentage of users who rated the agent positively
    - **Satisfaction by topic**: Which topics have high/low satisfaction
    - **Feedback comments**: Qualitative feedback from users (if collected)

16. Identify topics with **low satisfaction scores**:
    - These are your highest priority for improvement
    - Common causes: incomplete knowledge, poor instructions, confusing flows

17. Investigate patterns in negative feedback:
    - Are users frustrated by specific types of questions?
    - Do certain conversation flows consistently result in low satisfaction?
    - Are there knowledge gaps or outdated information?

> [!TIP]
> A single low-satisfaction topic with high volume should be your top improvement priority - it affects many users and has measurable impact.

#### Review Escalation and Abandonment

18. Look for **Escalation rate** metrics (if available):
    - How often users request human assistance
    - High escalation rates indicate the agent can't handle common scenarios

19. Review **Abandonment metrics**:
    - Conversations where users leave without resolution
    - Points in the conversation where users drop off most frequently

20. Analyze **Unrecognized phrases** or **Unanswered questions** (if available):
    - Questions the agent didn't understand or couldn't answer
    - Direct indicators of knowledge gaps or missing topics

> [!IMPORTANT]
> Unrecognized phrases are gold mines for improvement. Each represents a real user need your agent isn't addressing. Add knowledge or topics to cover these gaps.

#### Identify Improvement Opportunities

21. Based on your analytics review, create a prioritized list of improvements:
    - **High-volume, low-satisfaction topics**: Improve knowledge or instructions
    - **Unrecognized phrases**: Add missing knowledge or create new topics
    - **High abandonment points**: Simplify conversation flows or add clarifying messages

22. Document specific actions for each improvement:
    - "Add licensing FAQ to knowledge sources" (addresses 15% of unanswered questions)
    - "Simplify mailing list topic flow" (reduce 3-step process to 2 steps)
    - "Update agent instructions" (clarify when to use child agents)

> [!TIP]
> Always measure the impact of improvements by comparing analytics before and after changes. This validates your efforts and informs future optimization.

#### Set Up Ongoing Monitoring

23. Create a recurring calendar event for analytics review:
    - Weekly for new agents (first 3 months)
    - Bi-weekly for mature agents
    - Monthly once stable

24. Document your key performance indicators (KPIs):
    - Target satisfaction score (e.g., >80%)
    - Target resolution rate (e.g., >75%)
    - Acceptable escalation rate (e.g., <10%)

25. Share analytics summaries with stakeholders:
    - Demonstrate value and ROI
    - Build support for ongoing investment
    - Celebrate wins and learn from challenges

---

###  🏅 Congratulations! You've completed Use Case 2!

---

### Test your understanding

* What's the difference between total conversations and engaged conversations?
* Why should high-volume topics get more optimization attention than low-volume topics?
* How do unrecognized phrases guide improvement priorities?

**Challenge: Apply this to your own use case**

* What satisfaction score would indicate success for your agent?
* How often should you review analytics based on conversation volume?
* What metrics would you share with leadership to demonstrate agent value?

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting—so let's put your skills to the test.

To maximize the impact of channels and analytics in Copilot Studio:

* **Deploy Where Users Work** – Meet users in their existing environments (Teams, web, mobile) rather than forcing them to adopt new tools. This maximizes adoption and minimizes friction.
* **Security Comes First** – Always configure appropriate authentication and domain restrictions based on data sensitivity. Test security settings thoroughly before production deployment.
* **Measure Continuously** – Regular analytics review identifies issues early and guides improvement priorities. Use data, not assumptions, to optimize agent performance.
* **Focus on High-Impact Improvements** – Prioritize high-volume, low-satisfaction topics over rarely-used ones. Improve what affects the most users first.
* **Close the Feedback Loop** – Use analytics insights to improve agents, then measure the impact of changes. This continuous cycle ensures your agent gets better over time.

---

### Conclusions and recommendations

**Channels and analytics golden rules:**

* Deploy to channels where users already spend their time - don't ask users to go somewhere new
* Always configure security settings appropriate for your data sensitivity level
* Test your agent on every deployed channel before announcing availability
* Review analytics weekly for new agents, bi-weekly for mature agents
* Prioritize improvements based on conversation volume × satisfaction impact
* Track unrecognized phrases and unanswered questions - these reveal knowledge gaps
* Share analytics wins with stakeholders to build support and demonstrate ROI

By following these principles, you'll deploy agents strategically where they provide maximum value, protect organizational data with appropriate security, and continuously improve performance based on real user behavior and feedback - ensuring your agents deliver measurable business outcomes.

---
