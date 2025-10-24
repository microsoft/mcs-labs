---
layout: default
title: MCS + Azure AI Workshop
description: Comprehensive hands-on workshop combining Microsoft Copilot Studio with Azure AI services for building intelligent, enterprise-grade AI solutions
---

<!-- 
🎯 AZURE AI WORKSHOP PAGE: Static structure with dynamic Jekyll templating
📝 This page combines curated content with dynamic lab data from lab-config.yml
🔄 Lab cards are auto-generated from azure_ai_workshop_lab_orders configuration
-->

{% comment %}
Load configuration data for dynamic content generation
{% endcomment %}
{% assign config_data = site.data.lab-config %}
{% assign workshop_orders = config_data.azure_ai_workshop_lab_orders %}
{% assign lab_metadata = config_data.lab_metadata %}

{% comment %}
Calculate workshop statistics dynamically
{% endcomment %}
{% assign total_labs = workshop_orders.size %}
{% assign total_duration = 0 %}
{% assign min_difficulty = 400 %}
{% assign max_difficulty = 0 %}

{% for order_pair in workshop_orders %}
  {% assign lab_id = order_pair[1] %}
  {% for lab_num in lab_metadata %}
    {% assign lab_data = lab_num[1] %}
    {% if lab_data.id == lab_id %}
      {% assign total_duration = total_duration | plus: lab_data.duration %}
      {% assign difficulty_num = lab_data.difficulty | replace: 'Level ', '' | replace: 'Beginner (', '' | replace: 'Intermediate (', '' | replace: 'Advanced (', '' | replace: ')', '' | plus: 0 %}
      {% if difficulty_num < min_difficulty %}
        {% assign min_difficulty = difficulty_num %}
      {% endif %}
      {% if difficulty_num > max_difficulty %}
        {% assign max_difficulty = difficulty_num %}
      {% endif %}
      {% break %}
    {% endif %}
  {% endfor %}
{% endfor %}

{% assign total_hours = total_duration | divided_by: 60.0 | round: 1 %}

<div class="bootcamp-nav">
  <a href="{{ '/labs/' | relative_url }}" class="nav-link">← Back to All Labs</a>
  <div class="bootcamp-info">
    <h1>☁️ MCS + Azure AI Workshop</h1>
    <p>Comprehensive hands-on workshop combining Microsoft Copilot Studio with Azure AI services for building intelligent, enterprise-grade AI solutions.</p>
    <div class="bootcamp-stats">
      <span>📊 <strong>Difficulty:</strong> Level {{ min_difficulty }} to {{ max_difficulty }}</span>
      <span>⏱️ <strong>Estimated Time:</strong> {{ total_hours }} hours</span>
      <span>📚 <strong>Total Labs:</strong> {{ total_labs }} labs ({{ total_duration }} min)</span>
    </div>
  </div>
</div>

<div class="workshop-overview">
  <h2>🎯 Workshop Overview</h2>
  <p>This focused hands-on workshop helps you master the integration of Microsoft Copilot Studio with Azure AI services. Through 5 progressive labs, you'll learn to build intelligent agents that leverage live data, Azure AI capabilities, custom models, and enterprise data fabric patterns.</p>
  
  <h3>What You'll Learn</h3>
  <ul>
    <li>🔗 <strong>MCP Data Integration:</strong> Connect agents to live data using Model Context Protocol and Dataverse</li>
    <li>🎤 <strong>Azure AI Services:</strong> Implement Azure AI Search for document queries and Speech-to-Text for audio transcription</li>
    <li>🤖 <strong>BYOM Capabilities:</strong> Bring Your Own Model to extend Copilot Studio with custom AI models</li>
    <li>⚙️ <strong>Custom MCP Servers:</strong> Build and deploy MCP servers for advanced extensibility</li>
    <li>📊 <strong>Data Fabric Patterns:</strong> Integrate enterprise data fabric for unified data access</li>
  </ul>

  <h3>Prerequisites</h3>
  <ul>
    <li>✅ Basic understanding of AI concepts and chatbots</li>
    <li>✅ Access to Microsoft 365 and Azure subscriptions</li>
    <li>✅ Familiarity with Microsoft Copilot Studio (recommended but not required)</li>
    <li>✅ Basic knowledge of Azure services (helpful but not mandatory)</li>
  </ul>

  <h3>Workshop Structure</h3>
  <p>The workshop consists of 5 hands-on labs designed to build your skills progressively. Each lab includes step-by-step instructions, real-world scenarios, and downloadable resources.</p>
</div>

<div class="bootcamp-labs">
<h2>📚 Workshop Labs</h2>
<div class="labs-grid">
  {% comment %}
  Generate lab cards dynamically from azure_ai_workshop_lab_orders
  {% endcomment %}
  {% for order_pair in workshop_orders %}
    {% assign workshop_order = order_pair[0] %}
    {% assign lab_id = order_pair[1] %}
    
    {% comment %}Find lab metadata for this lab{% endcomment %}
    {% assign lab_info = null %}
    {% assign lab_number = null %}
    {% for lab_num in lab_metadata %}
      {% assign lab_data = lab_num[1] %}
      {% if lab_data.id == lab_id %}
        {% assign lab_info = lab_data %}
        {% assign lab_number = lab_num[0] %}
        {% break %}
      {% endif %}
    {% endfor %}
    
    {% if lab_info %}
  <div class="lab-card">
    <div class="lab-sequence">
      <span class="sequence-number">{{ workshop_order }}</span>
    </div>
    <h3><a href="{{ '/labs/' | relative_url }}{{ lab_id }}/?workshop=azure-ai">{{ lab_info.title }}</a></h3>
      <p>{{ lab_info.description | default: lab_info.title }}</p>
      <div class="lab-meta">
        <span class="difficulty">{{ lab_info.difficulty | replace: ' (', ' ' | replace: ')', '' }}</span>
        <span class="duration">⏱️ {{ lab_info.duration }} min</span>
        <span class="section {{ lab_info.section }}">📂 {% case lab_info.section %}{% when 'core_learning_path' %}Core Learning Path{% when 'intermediate_labs' %}Intermediate Labs{% when 'advanced_labs' %}Advanced Labs{% when 'specialized_labs' %}Specialized Labs{% when 'optional_labs' %}Optional Labs{% when 'external_labs' %}External Labs{% else %}{{ lab_info.section | replace: '_', ' ' | capitalize }}{% endcase %}</span>
      </div>
      <div class="lab-actions">
        <a href="{{ '/labs/' | relative_url }}{{ lab_id }}/?workshop=azure-ai" class="btn-primary">Start Lab →</a>
        <a href="{{ '/assets/pdfs/' | relative_url }}{{ lab_id }}.pdf" class="btn-secondary" target="_blank">📄 Download PDF</a>
      </div>
    </div>
    {% endif %}
  {% endfor %}
</div>
</div>

<div class="workshop-resources">
  <h2>📖 Additional Resources</h2>
  <ul>
    <li><a href="https://learn.microsoft.com/en-us/microsoft-copilot-studio/" target="_blank">Microsoft Copilot Studio Documentation</a></li>
    <li><a href="https://learn.microsoft.com/en-us/azure/ai-services/" target="_blank">Azure AI Services Documentation</a></li>
    <li><a href="https://learn.microsoft.com/en-us/azure/search/" target="_blank">Azure AI Search Documentation</a></li>
    <li><a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/" target="_blank">Azure OpenAI Service Documentation</a></li>
  </ul>
</div>

<div class="workshop-support">
  <h2>💬 Need Help?</h2>
  <p>If you encounter any issues or have questions during the workshop:</p>
  <ul>
    <li>🔍 Review the lab prerequisites and setup instructions carefully</li>
    <li>📚 Consult the linked documentation for detailed technical information</li>
    <li>💡 Check the troubleshooting sections in each lab</li>
    <li>🤝 Reach out to your workshop instructor or facilitator</li>
  </ul>
</div>
