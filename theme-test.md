---
layout: default
title: Theme Test
---

<div class="container">
    <h1>Theme System Test</h1>
    
    <p>This page demonstrates the new modular theme system. Click the theme toggle button in the header to cycle through:</p>
    
    <ul>
        <li><strong>🎨 Rich Light</strong> - Original colorful design with gradients and shadows</li>
        <li><strong>🌙 Rich Dark</strong> - Dark mode with vibrant colors</li>
        <li><strong>📄 Minimal Light</strong> - Clean, blog-style design focused on content</li>
        <li><strong>🌑 Minimal Dark</strong> - Minimal dark theme with clean typography</li>
    </ul>

    <h2>Theme Features Demo</h2>

    <div class="lab-card" style="margin: 2rem 0; max-width: 500px;">
        <h3>Sample Lab Card</h3>
        <p>This card demonstrates how the theming affects different UI elements.</p>
        <div class="lab-meta">
            <span class="difficulty-badge beginner">Beginner</span>
            <span>30 mins</span>
        </div>
    </div>

    <h3>Code Block Example</h3>
    <pre><code>// This demonstrates code highlighting
function testTheme() {
    console.log('Theme system working!');
    return true;
}</code></pre>

    <h3>Callout Examples</h3>
    
    <blockquote class="callout">
        <p><strong>[!TIP]</strong> This is a tip callout that should render differently in each theme.</p>
    </blockquote>

    <blockquote class="callout">
        <p><strong>[!IMPORTANT]</strong> Important information that adapts to the current theme.</p>
    </blockquote>

    <blockquote class="callout">
        <p><strong>[!NOTE]</strong> A note that demonstrates theme-specific styling.</p>
    </blockquote>

    <h3>Button Examples</h3>
    <button class="btn-primary" style="margin-right: 1rem;">Primary Button</button>
    <button class="btn-secondary">Secondary Button</button>

    <h3>Current Theme Information</h3>
    <div id="theme-info" style="background: var(--bg-tertiary); padding: 1rem; border-radius: 6px; margin: 1rem 0;">
        <p>Current theme: <span id="current-theme">Loading...</span></p>
        <p>Description: <span id="theme-description">Loading...</span></p>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            function updateThemeInfo() {
                const themeInfo = ThemeManager.getCurrentThemeInfo();
                document.getElementById('current-theme').textContent = themeInfo.name;
                document.getElementById('theme-description').textContent = themeInfo.description;
            }

            // Update on load
            setTimeout(updateThemeInfo, 100);

            // Update when theme changes
            window.addEventListener('themeChanged', updateThemeInfo);
        });
    </script>
</div>