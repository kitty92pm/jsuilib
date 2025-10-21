# UnixUI v1.0
Professional ImGui-Style JavaScript UI Library  
Author: List / 97pm

------------------------------------------------------------
Overview
------------------------------------------------------------
UnixUI is a lightweight, console-pasteable JavaScript UI framework designed for script developers and mod creators.
It provides an ImGui-style interface system for creating customizable menus, toggles, sliders, inputs, and more — all
fully themeable, persistent, and smooth. Perfect for use in browser consoles, client-side scripts, or modding tools.

------------------------------------------------------------
Features
------------------------------------------------------------
• Tab-based interface with draggable, resizable window
• Built-in theme presets (Dark, Light, Neon, Cyber, Terminal)
• Persistent state saving with localStorage
• Buttons, toggles, sliders, dropdowns, color pickers, inputs
• Groups, separators, collapsibles, and labels
• Notification system (optional)
• F1 hotkey for menu toggle
• Plugin registration system for custom components
• Zero dependencies (pure vanilla JavaScript)

------------------------------------------------------------
Installation / Usage
------------------------------------------------------------
1. Copy and paste the entire UnixUI script into the browser console or any JavaScript environment.
2. Once executed, the global object "UnixUI" will be available for use.

Alternatively, save the file as unixui.js and include it in your HTML project:

<script src="unixui.js"></script>

Or dynamically load from a raw GitHub link:

fetch("https://raw.githubusercontent.com/kitty92pm/jsuilib/main/unixuilib.js")
  .then(r => r.text())
  .then(eval);

------------------------------------------------------------
Basic Example
------------------------------------------------------------
const ui = UnixUI.New("Example Menu").UsePreset("Neon");

ui.Add("Main")
  .Button("Click Me", () => console.log("Button Clicked"))
  .Toggle("Enable Feature", v => console.log("Feature Enabled:", v), "featureEnabled")
  .Slider("Speed", 1, 10, 5, v => console.log("Speed:", v), "speedValue")
  .Dropdown("Difficulty", ["Easy", "Normal", "Hard"], "Normal", v => console.log("Mode:", v))
  .Input("Name", "Player", v => console.log("Name:", v))
  .Color("Accent Color", "#ff44ff", v => ui.SetTheme({ accent: v }))
  .Separator()
  .Group("Advanced Settings", g => {
    g.Number("Volume", 50, v => console.log("Volume:", v));
    g.Textarea("Notes", "Enter text here...", v => console.log(v));
  })
  .Collapsible("Developer Tools", c => {
    c.Label("Collapsible Content Example");
  });

UnixUI.Notify("UnixUI v1.0 Loaded Successfully", "success");

------------------------------------------------------------
Global Object Reference
------------------------------------------------------------
UnixUI.New(title)
- Creates a new UI window with a specified title.
- Returns: UnixUIMenu instance.

UnixUI.Config
- Global configuration object containing zIndex and theme data.

UnixUI.Theme
- Default theme reference object.

UnixUI.Presets
- Built-in preset themes:
  Dark
  Light
  Neon
  Cyber
  Terminal

UnixUI.Notify(message, type, duration)
- Displays a notification in the bottom right corner.
- Parameters:
  message (string) - Text to display
  type (string) - "info", "success", "error"
  duration (number) - Display time in milliseconds (default 2500)

UnixUI.State.Get(key)
- Retrieves a value from localStorage.

UnixUI.State.Set(key, value)
- Stores a value in localStorage.

UnixUI.RegisterComponent(name, function)
- Registers a custom component to be used inside tabs.

------------------------------------------------------------
UnixUIMenu Class
------------------------------------------------------------
ui.Add(tabName)
- Creates or switches to a tab.
- Returns: TabContext instance.

ui.SetTheme(overrides)
- Overrides the current theme with custom values.

ui.UsePreset(presetName)
- Applies a built-in preset theme.

ui.ExportTheme()
- Returns the current theme configuration as JSON.

ui.ImportTheme(json)
- Loads and applies a theme from JSON.

ui.Toggle()
- Shows or hides the current UI window.

ui.Destroy()
- Removes the UI window from the DOM.

------------------------------------------------------------
TabContext Functions
------------------------------------------------------------
Button(label, callback)
- Creates a button that executes a function when clicked.

Toggle(label, callback, key, type)
- Creates a toggle switch or button.
- type: "switch" (default) or "button"

Slider(label, min, max, defaultValue, callback, key)
- Creates a slider control for numeric input.

Dropdown(label, options[], defaultValue, callback, key)
- Creates a dropdown selector.

Input(label, defaultValue, callback, key)
- Creates a text input field.

Number(label, defaultValue, callback, key)
- Creates a numeric input box.

Textarea(label, defaultValue, callback, key)
- Creates a multiline text input area.

Color(label, defaultColor, callback, key)
- Creates a color picker control.

Label(text)
- Creates a static text label.

Separator()
- Adds a horizontal divider between elements.

Group(label, callback)
- Creates a labeled grouping of controls inside the tab.

Collapsible(label, callback)
- Creates a collapsible section containing nested controls.

------------------------------------------------------------
Hotkeys
------------------------------------------------------------
F1 - Toggles the visibility of the entire UI.

------------------------------------------------------------
Styling and Theming
------------------------------------------------------------
All components use CSS variables:
--font
--base
--accent
--text
--border
--radius
--blur
--shadow
--transition

These can be modified via ui.SetTheme({ property: value }) or through preset usage:
ui.UsePreset("Cyber")

------------------------------------------------------------
License
------------------------------------------------------------
This project is free to use, modify, and distribute with credit to the author (List / 97pm).
