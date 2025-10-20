// =======================================================
// UnixUI v7.0 Professional — Complete ImGui-style JS UI
// Author: Aledex / kitty92pm
// =======================================================
(() => {
  const DefaultTheme = {
    font: "Inter, sans-serif",
    base: "rgba(15,15,15,0.95)",
    accent: "#ff44ff",
    text: "#ffffff",
    border: "rgba(255,255,255,0.1)",
    radius: "8px",
    blur: "10px",
    shadow: "0 0 25px rgba(255,0,255,0.25)",
    transition: "0.15s",
  };

  const UIConfig = {
    zIndex: 999999999,
    theme: { ...DefaultTheme },
  };

  // === CSS ===
  const style = document.createElement("style");
  style.textContent = `
  .unixui {
    position: fixed; top: 100px; left: 100px;
    width: 450px; height: auto;
    background: var(--base); color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    font-family: var(--font);
    backdrop-filter: blur(var(--blur));
    z-index: ${UIConfig.zIndex};
    overflow: hidden; resize: both;
    transition: all var(--transition) ease;
  }
  .unixui-header {
    text-align: center; font-weight: 600;
    padding: 8px 0; background: rgba(255,255,255,0.05);
    cursor: move; border-bottom: 1px solid var(--border);
    user-select: none;
  }
  .unixui-tabs {
    display: flex; flex-wrap: wrap; gap: 5px;
    justify-content: center; border-bottom: 1px solid var(--border);
    padding: 6px;
  }
  .unixui-tab {
    background: rgba(255,255,255,0.06);
    border: none; border-radius: 6px;
    padding: 5px 12px; color: var(--text);
    cursor: pointer; transition: var(--transition);
  }
  .unixui-tab.active, .unixui-tab:hover {
    background: var(--accent); color: #fff;
  }
  .unixui-content { padding: 10px; max-height: 420px; overflow-y: auto; }
  .unixui-btn, .unixui-toggle-btn {
    width: 100%; background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    border-radius: 6px; color: var(--text);
    padding: 6px 10px; margin-top: 6px;
    cursor: pointer; text-align: left;
    transition: var(--transition);
  }
  .unixui-btn:hover, .unixui-toggle-btn.active {
    background: var(--accent); color: #fff;
  }
  .unixui-toggle { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .unixui-switch {
    width: 44px; height: 22px;
    background: rgba(255,255,255,0.15);
    border-radius: 20px; position: relative;
    cursor: pointer; transition: var(--transition);
  }
  .unixui-switch::after {
    content: ""; position: absolute; top: 2px; left: 2px;
    width: 18px; height: 18px; border-radius: 50%; background: #fff;
    transition: var(--transition);
  }
  .unixui-switch.active { background: var(--accent); }
  .unixui-switch.active::after { left: 24px; }
  .unixui-dropdown, .unixui-input, .unixui-color {
    display: flex; justify-content: space-between; align-items: center; margin-top: 8px;
  }
  .unixui-dropdown select, .unixui-input input {
    background: rgba(255,255,255,0.07); color: var(--text);
    border: 1px solid var(--border); border-radius: 6px;
    padding: 4px 8px; cursor: pointer; transition: var(--transition);
    appearance: none;
  }
  .unixui-dropdown select:hover, .unixui-input input:focus {
    background: var(--accent);
  }
  .unixui-slider { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .unixui-slider input { width: 60%; cursor: pointer; }
  .unixui-label { font-size: 13px; opacity: 0.85; margin-top: 8px; }
  .unixui-color input[type="color"] {
    border: none; width: 36px; height: 22px;
    background: transparent; cursor: pointer;
  }
  `;
  document.head.appendChild(style);

  // === Movement ===
  const makeDraggable = el => {
    const header = el.querySelector(".unixui-header");
    let drag = false, offX = 0, offY = 0;
    header.onmousedown = e => { drag = true; offX = e.clientX - el.offsetLeft; offY = e.clientY - el.offsetTop; };
    document.onmouseup = () => drag = false;
    document.onmousemove = e => {
      if (!drag) return;
      el.style.left = e.clientX - offX + "px";
      el.style.top = e.clientY - offY + "px";
    };
  };

  // === Tab Context ===
  class TabContext {
    constructor(tab) { this.tab = tab; }

    Button(text, cb) {
      const b = document.createElement("button");
      b.className = "unixui-btn"; b.textContent = text;
      b.onclick = cb; this.tab.content.appendChild(b);
      return this;
    }

    Toggle(label, cb, key, type = "switch") {
      const wrap = document.createElement("div"); wrap.className = "unixui-toggle";
      const txt = document.createElement("span"); txt.textContent = label;
      if (type === "switch") {
        const sw = document.createElement("div");
        sw.className = "unixui-switch";
        if (key && localStorage.getItem(key) === "true") sw.classList.add("active");
        sw.onclick = () => {
          sw.classList.toggle("active");
          const val = sw.classList.contains("active");
          cb(val); if (key) localStorage.setItem(key, val);
        };
        wrap.append(txt, sw);
      } else {
        const b = document.createElement("button");
        b.className = "unixui-toggle-btn"; b.textContent = label;
        if (key && localStorage.getItem(key) === "true") b.classList.add("active");
        b.onclick = () => {
          b.classList.toggle("active");
          const val = b.classList.contains("active");
          cb(val); if (key) localStorage.setItem(key, val);
        };
        wrap.appendChild(b);
      }
      this.tab.content.appendChild(wrap);
      return this;
    }

    Slider(label, min, max, val, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-slider";
      const span = document.createElement("span"); span.textContent = `${label}: ${val}`;
      const input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max;
      input.value = key && localStorage.getItem(key) || val;
      input.oninput = () => { span.textContent = `${label}: ${input.value}`; cb(+input.value); if (key) localStorage.setItem(key, input.value); };
      wrap.append(span, input); this.tab.content.appendChild(wrap); return this;
    }

    Dropdown(label, options, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-dropdown";
      const span = document.createElement("span"); span.textContent = label;
      const sel = document.createElement("select");
      options.forEach(o => { const opt = document.createElement("option"); opt.value = o; opt.textContent = o; sel.appendChild(opt); });
      sel.value = key && localStorage.getItem(key) || def;
      sel.onchange = () => { cb(sel.value); if (key) localStorage.setItem(key, sel.value); };
      wrap.append(span, sel); this.tab.content.appendChild(wrap); return this;
    }

    Input(label, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-input";
      const span = document.createElement("span"); span.textContent = label;
      const input = document.createElement("input"); input.type = "text"; input.value = key && localStorage.getItem(key) || def;
      input.onchange = () => { cb(input.value); if (key) localStorage.setItem(key, input.value); };
      wrap.append(span, input); this.tab.content.appendChild(wrap); return this;
    }

    Color(label, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-color";
      const span = document.createElement("span"); span.textContent = label;
      const input = document.createElement("input"); input.type = "color"; input.value = key && localStorage.getItem(key) || def;
      input.oninput = () => { cb(input.value); if (key) localStorage.setItem(key, input.value); };
      wrap.append(span, input); this.tab.content.appendChild(wrap); return this;
    }

    Label(txt) {
      const l = document.createElement("div"); l.className = "unixui-label"; l.textContent = txt;
      this.tab.content.appendChild(l); return this;
    }
  }

  // === Menu ===
  class UnixUIMenu {
    constructor(title = "UnixUI") {
      this.el = document.createElement("div");
      this.el.className = "unixui";
      Object.entries(UIConfig.theme).forEach(([k,v]) => this.el.style.setProperty(`--${k}`, v));
      this.el.innerHTML = `<div class="unixui-header">${title}</div>
        <div class="unixui-tabs"></div><div class="unixui-content"></div>`;
      document.body.appendChild(this.el);
      this.tabsEl = this.el.querySelector(".unixui-tabs");
      this.contentEl = this.el.querySelector(".unixui-content");
      this.tabs = {}; this.currentTab = null;
      makeDraggable(this.el);
    }

    Add(tabName) {
      let tab = this.tabs[tabName];
      if (!tab) {
        const btn = document.createElement("button");
        btn.className = "unixui-tab"; btn.textContent = tabName;
        const content = document.createElement("div"); content.style.display = "none";
        this.contentEl.appendChild(content); this.tabsEl.appendChild(btn);
        tab = { btn, content }; this.tabs[tabName] = tab;
        btn.onclick = () => {
          Object.values(this.tabs).forEach(t => { t.btn.classList.remove("active"); t.content.style.display = "none"; });
          btn.classList.add("active"); content.style.display = "block"; this.currentTab = tabName;
        };
        if (!this.currentTab) btn.click();
      }
      return new TabContext(tab);
    }

    SetTheme(overrides = {}) {
      Object.assign(UIConfig.theme, overrides);
      Object.entries(UIConfig.theme).forEach(([k,v]) => this.el.style.setProperty(`--${k}`, v));
      return this;
    }

    ExportTheme() { return JSON.stringify(UIConfig.theme, null, 2); }
    ImportTheme(json) {
      try { const t = JSON.parse(json); this.SetTheme(t); } catch(e){ console.error("Invalid theme JSON", e); }
    }

    Toggle() { this.el.style.display = this.el.style.display === "none" ? "block" : "none"; }
    Destroy() { this.el.remove(); }
  }

  window.UnixUI = {
    New: title => new UnixUIMenu(title),
    Config: UIConfig,
    Theme: DefaultTheme,
    version: "7.0"
  };
})();
