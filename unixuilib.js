// =======================================================
// UnixUI v1.0
// Author: List / 97pm
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

  const ThemePresets = {
    Dark: { base: "rgba(15,15,15,0.95)", accent: "#ff44ff", text: "#fff" },
    Light: { base: "rgba(255,255,255,0.9)", accent: "#0077ff", text: "#000" },
    Neon: { base: "rgba(0,0,0,0.9)", accent: "#00ffff", text: "#ffffff" },
    Cyber: { base: "rgba(10,10,20,0.95)", accent: "#00ff80", text: "#e0ffe0" },
    Terminal: { base: "rgba(5,5,5,0.95)", accent: "#00ff00", text: "#00ff00" },
  };

  const UIConfig = {
    zIndex: 999999999,
    theme: { ...DefaultTheme },
  };

  // === CSS Injection ===
  const style = document.createElement("style");
  style.textContent = `
  .unixui {
    position: fixed; top: 100px; left: 100px;
    width: 450px; background: var(--base); color: var(--text);
    border: 1px solid var(--border); border-radius: var(--radius);
    box-shadow: var(--shadow); font-family: var(--font);
    backdrop-filter: blur(var(--blur));
    z-index: ${UIConfig.zIndex}; overflow: hidden;
    resize: both; transition: all var(--transition) ease;
  }
  .unixui-header {
    text-align: center; font-weight: 600; padding: 8px 0;
    background: rgba(255,255,255,0.05);
    cursor: move; border-bottom: 1px solid var(--border);
    user-select: none;
  }
  .unixui-tabs {
    display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;
    border-bottom: 1px solid var(--border); padding: 6px;
  }
  .unixui-tab {
    background: rgba(255,255,255,0.06);
    border: none; border-radius: 6px;
    padding: 5px 12px; color: var(--text); cursor: pointer;
    transition: var(--transition);
  }
  .unixui-tab.active, .unixui-tab:hover { background: var(--accent); color: #fff; }
  .unixui-content { padding: 10px; max-height: 420px; overflow-y: auto; }
  .unixui-btn, .unixui-toggle-btn {
    width: 100%; background: rgba(255,255,255,0.06);
    border: 1px solid var(--border); border-radius: 6px;
    color: var(--text); padding: 6px 10px; margin-top: 6px;
    cursor: pointer; text-align: left; transition: var(--transition);
  }
  .unixui-btn:hover, .unixui-toggle-btn.active { background: var(--accent); color: #fff; }
  .unixui-toggle { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .unixui-switch {
    width: 44px; height: 22px; background: rgba(255,255,255,0.15);
    border-radius: 20px; position: relative; cursor: pointer; transition: var(--transition);
  }
  .unixui-switch::after {
    content: ""; position: absolute; top: 2px; left: 2px;
    width: 18px; height: 18px; border-radius: 50%; background: #fff;
    transition: var(--transition);
  }
  .unixui-switch.active { background: var(--accent); }
  .unixui-switch.active::after { left: 24px; }
  .unixui-dropdown, .unixui-input, .unixui-color, .unixui-number, .unixui-textarea {
    display: flex; justify-content: space-between; align-items: center; margin-top: 8px;
  }
  .unixui-dropdown select, .unixui-input input, .unixui-number input, .unixui-textarea textarea {
    background: rgba(255,255,255,0.07); color: var(--text);
    border: 1px solid var(--border); border-radius: 6px;
    padding: 4px 8px; cursor: pointer; transition: var(--transition);
    appearance: none; width: 60%;
  }
  .unixui-dropdown select:hover, .unixui-input input:focus, .unixui-number input:focus, .unixui-textarea textarea:focus {
    background: var(--accent); color: #fff;
  }
  .unixui-slider { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .unixui-slider input { width: 60%; cursor: pointer; }
  .unixui-label { font-size: 13px; opacity: 0.85; margin-top: 8px; }
  .unixui-separator { height: 1px; background: var(--border); margin: 8px 0; }
  .unixui-group { margin-top: 10px; padding: 6px; border: 1px solid var(--border); border-radius: 6px; }
  .unixui-collapsible > .header { cursor: pointer; font-weight: bold; margin-top: 8px; }
  .unixui-collapsible > .content { display: none; margin-top: 6px; }
  .unixui-notify {
    position: fixed; bottom: 30px; right: 30px;
    display: flex; flex-direction: column; gap: 10px; z-index: ${UIConfig.zIndex + 1};
  }
  .unixui-note {
    min-width: 200px; padding: 10px 15px; border-radius: 6px;
    color: #fff; font-family: var(--font); animation: slideIn 0.3s ease;
  }
  .unixui-note.info { background: rgba(0,120,255,0.9); }
  .unixui-note.success { background: rgba(0,200,100,0.9); }
  .unixui-note.error { background: rgba(255,50,50,0.9); }
  @keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  `;
  document.head.appendChild(style);

  // === Utility ===
  const State = {
    Get: key => localStorage.getItem(key),
    Set: (key, value) => localStorage.setItem(key, value)
  };

    // === Smooth Dragging & Resizing ===
  const makeDraggable = el => {
    const header = el.querySelector(".unixui-header");
    let dragging = false, offsetX = 0, offsetY = 0;
    let posX = 0, posY = 0;
    let velocityX = 0, velocityY = 0;
    let animFrame = null;

    const smoothMove = () => {
      if (!dragging) return;
      posX += (velocityX - posX) * 0.35;
      posY += (velocityY - posY) * 0.35;
      el.style.transform = `translate(${posX}px, ${posY}px)`;
      animFrame = requestAnimationFrame(smoothMove);
    };

    header.addEventListener("mousedown", e => {
      dragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      el.style.willChange = "transform";
      posX = 0; posY = 0;
      velocityX = 0; velocityY = 0;
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(smoothMove);
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
      cancelAnimationFrame(animFrame);
      el.style.willChange = "auto";
      el.style.left = `${el.offsetLeft + posX}px`;
      el.style.top = `${el.offsetTop + posY}px`;
      el.style.transform = "none";
      document.body.style.userSelect = "";
    });

    document.addEventListener("mousemove", e => {
      if (!dragging) return;
      velocityX = e.clientX - offsetX - el.offsetLeft;
      velocityY = e.clientY - offsetY - el.offsetTop;
    });

    // Smooth resize observer for less lag
    const resizer = document.createElement("div");
    resizer.style.position = "absolute";
    resizer.style.width = "14px";
    resizer.style.height = "14px";
    resizer.style.right = "0";
    resizer.style.bottom = "0";
    resizer.style.cursor = "nwse-resize";
    resizer.style.zIndex = 10;
    el.appendChild(resizer);

    let resizing = false, startW = 0, startH = 0, startX = 0, startY = 0;
    resizer.addEventListener("mousedown", e => {
      e.stopPropagation();
      resizing = true;
      startW = el.offsetWidth;
      startH = el.offsetHeight;
      startX = e.clientX;
      startY = e.clientY;
      document.body.style.userSelect = "none";
    });
    document.addEventListener("mouseup", () => { resizing = false; document.body.style.userSelect = ""; });
    document.addEventListener("mousemove", e => {
      if (!resizing) return;
      const w = Math.max(300, startW + (e.clientX - startX));
      const h = Math.max(200, startH + (e.clientY - startY));
      el.style.width = w + "px";
      el.style.height = h + "px";
    });
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
        if (key && State.Get(key) === "true") sw.classList.add("active");
        sw.onclick = () => {
          sw.classList.toggle("active");
          const val = sw.classList.contains("active");
          cb(val); if (key) State.Set(key, val);
        };
        wrap.append(txt, sw);
      } else {
        const b = document.createElement("button");
        b.className = "unixui-toggle-btn"; b.textContent = label;
        if (key && State.Get(key) === "true") b.classList.add("active");
        b.onclick = () => {
          b.classList.toggle("active");
          const val = b.classList.contains("active");
          cb(val); if (key) State.Set(key, val);
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
      input.value = key && State.Get(key) || val;
      input.oninput = () => { span.textContent = `${label}: ${input.value}`; cb(+input.value); if (key) State.Set(key, input.value); };
      wrap.append(span, input); this.tab.content.appendChild(wrap); return this;
    }

    Dropdown(label, options, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-dropdown";
      const span = document.createElement("span"); span.textContent = label;
      const sel = document.createElement("select");
      options.forEach(o => { const opt = document.createElement("option"); opt.value = o; opt.textContent = o; sel.appendChild(opt); });
      sel.value = key && State.Get(key) || def;
      sel.onchange = () => { cb(sel.value); if (key) State.Set(key, sel.value); };
      wrap.append(span, sel); this.tab.content.appendChild(wrap); return this;
    }

    Input(label, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-input";
      const span = document.createElement("span"); span.textContent = label;
      const input = document.createElement("input"); input.type = "text"; input.value = key && State.Get(key) || def;
      input.onchange = () => { cb(input.value); if (key) State.Set(key, input.value); };
      wrap.append(span, input); this.tab.content.appendChild(wrap); return this;
    }

    Number(label, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-number";
      const span = document.createElement("span"); span.textContent = label;
      const input = document.createElement("input"); input.type = "number"; input.value = key && State.Get(key) || def;
      input.oninput = () => { cb(+input.value); if (key) State.Set(key, input.value); };
      wrap.append(span, input); this.tab.content.appendChild(wrap); return this;
    }

    Textarea(label, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-textarea";
      const span = document.createElement("span"); span.textContent = label;
      const area = document.createElement("textarea"); area.value = key && State.Get(key) || def;
      area.onchange = () => { cb(area.value); if (key) State.Set(key, area.value); };
      wrap.append(span, area); this.tab.content.appendChild(wrap); return this;
    }

    Color(label, def, cb, key) {
      const wrap = document.createElement("div"); wrap.className = "unixui-color";
      const span = document.createElement("span"); span.textContent = label;
      const input = document.createElement("input"); input.type = "color"; input.value = key && State.Get(key) || def;
      input.oninput = () => { cb(input.value); if (key) State.Set(key, input.value); };
      wrap.append(span, input); this.tab.content.appendChild(wrap); return this;
    }

    Label(txt) {
      const l = document.createElement("div"); l.className = "unixui-label"; l.textContent = txt;
      this.tab.content.appendChild(l); return this;
    }

    Separator() {
      const sep = document.createElement("div"); sep.className = "unixui-separator";
      this.tab.content.appendChild(sep); return this;
    }

    Group(label, cb) {
      const g = document.createElement("div"); g.className = "unixui-group";
      if (label) {
        const l = document.createElement("div"); l.className = "unixui-label"; l.style.fontWeight = "bold"; l.textContent = label;
        g.appendChild(l);
      }
      this.tab.content.appendChild(g);
      const ctx = new TabContext({ content: g });
      cb(ctx);
      return this;
    }

    Collapsible(label, cb) {
      const col = document.createElement("div"); col.className = "unixui-collapsible";
      const head = document.createElement("div"); head.className = "header"; head.textContent = label;
      const cont = document.createElement("div"); cont.className = "content";
      head.onclick = () => cont.style.display = cont.style.display === "block" ? "none" : "block";
      col.append(head, cont);
      this.tab.content.appendChild(col);
      const ctx = new TabContext({ content: cont });
      cb(ctx);
      return this;
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

    UsePreset(name) {
      if (ThemePresets[name]) this.SetTheme(ThemePresets[name]);
      return this;
    }

    ExportTheme() { return JSON.stringify(UIConfig.theme, null, 2); }
    ImportTheme(json) {
      try { const t = JSON.parse(json); this.SetTheme(t); } catch(e){ console.error("Invalid theme JSON", e); }
    }

    Toggle() { this.el.style.display = this.el.style.display === "none" ? "block" : "none"; }
    Destroy() { this.el.remove(); }
  }

  // === Notifications ===
  const notifyContainer = document.createElement("div");
  notifyContainer.className = "unixui-notify";
  document.body.appendChild(notifyContainer);
  const Notify = (msg, type = "info", time = 2500) => {
    const note = document.createElement("div");
    note.className = `unixui-note ${type}`; note.textContent = msg;
    notifyContainer.appendChild(note);
    setTimeout(() => note.remove(), time);
  };

  // === Hotkey ===
  window.addEventListener("keydown", e => {
    if (e.key === "F1") {
      const ui = document.querySelector(".unixui");
      if (ui) ui.style.display = ui.style.display === "none" ? "block" : "none";
    }
  });

  // === Plugin Registration ===
  const Components = {};
  const RegisterComponent = (name, fn) => Components[name] = fn;

  window.UnixUI = {
    New: title => new UnixUIMenu(title),
    Config: UIConfig,
    Theme: DefaultTheme,
    Presets: ThemePresets,
    Notify,
    State,
    RegisterComponent,
    version: "1.0"
  };
})();
