---
layout: single
title: "Architecture Bootcamp"
sidebar:
  nav: "labs"
toc: false
description: "Intensive hands-on bootcamp covering agent building, SharePoint integration, autonomous AI, and DevOps practices"
---

Intensive hands-on bootcamp covering agent building, SharePoint integration, autonomous AI, and DevOps practices.

## Bootcamp Labs

| # | Lab | Duration | Difficulty |
|---|-----|----------|------------|
{% for lab in site.labs %}{% if lab.bootcamp_order %}| {{ lab.bootcamp_order }} | [{{ lab.title }}]({{ lab.url | relative_url }}) | {{ lab.duration }} min | Level {{ lab.difficulty }} |
{% endif %}{% endfor %}
