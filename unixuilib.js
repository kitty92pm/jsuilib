(() => {
  const style = document.createElement("style");
  style.textContent = `
  .unixui {
    position: fixed; top: 100px; left: 100px;
    width: 360px; background: rgba(25,25,25,0.9);
    border: 1px solid #555; border-radius: 12px;
    box-shadow: 0 0 25px rgba(255,0,255,0.2);
    color: white; font-family: 'Inter', sans-serif;
    overflow: hidden; z-index: 9999999;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .unixui.hide { opacity: 0; transform: scale(0.9); pointer-events: none; }
  .unixui-header {
    padding: 8px 0; font-weight: 600; text-align: center;
    background: rgba(255,255,255,0.05); cursor: move;
    user-select: none; border-bottom: 1px solid #333;
  }
  .unixui-tabs {
    display: flex; justify-content: center; gap: 4px; padding: 5px;
    border-bottom: 1px solid #333; flex-wrap: wrap;
  }
  .unixui-tab {
    background: rgba(255,255,255,0.05); border: none;
    padding: 5px 10px; border-radius: 6px; color: #eee;
    cursor: pointer; transition: 0.2s;
  }
  .unixui-tab.active, .unixui-tab:hover { background: rgba(255,0,255,0.3); }
  .unixui-content { padding: 10px; max-height: 380px; overflow-y: auto; }
  .unixui-section { margin-bottom: 8px; }
  .unixui-btn {
    width: 100%; background: rgba(255,255,255,0.05);
    border: none; border-radius: 6px; padding: 6px;
    text-align: left; color: white; cursor: pointer;
    transition: 0.2s; margin-top: 5px;
  }
  .unixui-btn:hover { background: rgba(255,0,255,0.3); }
  .unixui-toggle { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
  .unixui-toggle input { cursor: pointer; }
  .unixui-slider { width: 100%; margin-top: 5px; }
  .unixui-label { opacity: 0.8; font-size: 13px; margin-top: 5px; }
  .unixui-dropdown select { width: 100%; padding: 5px; border-radius: 6px;
    background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; }
  .unixui-keybind { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
  .unixui-keybtn {
    flex: none; padding: 4px 10px; border-radius: 6px;
    background: rgba(255,255,255,0.05); border: none;
    color: #eee; cursor: pointer; transition: 0.2s;
  }
  .unixui-keybtn.recording { background: rgba(255,0,255,0.4); }
  `;
  document.head.appendChild(style);

  const makeDraggable = el => {
    const header = el.querySelector(".unixui-header");
    let dragging = false, offX = 0, offY = 0;
    header.onmousedown = e => { dragging = true; offX = e.clientX - el.offsetLeft; offY = e.clientY - el.offsetTop; };
    document.onmouseup = () => dragging = false;
    document.onmousemove = e => {
      if (!dragging) return;
      el.style.left = e.clientX - offX + "px";
      el.style.top = e.clientY - offY + "px";
    };
  };

  class Menu {
    constructor(title) {
      this.el = document.createElement("div");
      this.el.className = "unixui";
      this.el.innerHTML = `
        <div class="unixui-header">${title}</div>
        <div class="unixui-tabs"></div>
        <div class="unixui-content"></div>`;
      document.body.appendChild(this.el);

      this.tabsEl = this.el.querySelector(".unixui-tabs");
      this.contentEl = this.el.querySelector(".unixui-content");
      this.tabs = {};
      this.currentTab = null;

      makeDraggable(this.el);
    }

    AddTab(name) {
      const tabBtn = document.createElement("button");
      tabBtn.className = "unixui-tab";
      tabBtn.textContent = name;
      const container = document.createElement("div");
      container.className = "unixui-section";
      container.style.display = "none";
      this.contentEl.appendChild(container);
      this.tabsEl.appendChild(tabBtn);

      tabBtn.onclick = () => {
        Object.entries(this.tabs).forEach(([n, c]) => {
          c.el.style.display = n === name ? "block" : "none";
          c.btn.classList.toggle("active", n === name);
        });
        this.currentTab = name;
      };

      this.tabs[name] = { el: container, btn: tabBtn };
      if (!this.currentTab) tabBtn.click();
      return this;
    }

    _current() { return this.tabs[this.currentTab]?.el || this.contentEl; }

    AddButton(label, cb) {
      const b = document.createElement("button");
      b.className = "unixui-btn";
      b.textContent = label;
      b.onclick = cb;
      this._current().appendChild(b);
      return this;
    }

    AddToggle(label, cb, saveKey) {
      const wrap = document.createElement("div");
      wrap.className = "unixui-toggle";
      const box = document.createElement("input");
      box.type = "checkbox";
      const txt = document.createElement("span");
      txt.textContent = label;

      if (saveKey && localStorage.getItem(saveKey) === "true") box.checked = true;
      box.onchange = () => {
        if (saveKey) localStorage.setItem(saveKey, box.checked);
        cb(box.checked);
      };

      wrap.append(box, txt);
      this._current().appendChild(wrap);
      return this;
    }

    AddSlider(label, min, max, val, cb, saveKey) {
      const lab = document.createElement("div");
      lab.className = "unixui-label";
      lab.textContent = `${label}: ${val}`;
      const input = document.createElement("input");
      input.type = "range"; input.min = min; input.max = max; input.value = val;
      input.className = "unixui-slider";
      if (saveKey && localStorage.getItem(saveKey))
        input.value = localStorage.getItem(saveKey);
      input.oninput = () => {
        lab.textContent = `${label}: ${input.value}`;
        if (saveKey) localStorage.setItem(saveKey, input.value);
        cb(Number(input.value));
      };
      this._current().append(lab, input);
      return this;
    }

    AddDropdown(label, options, def, cb, saveKey) {
      const wrap = document.createElement("div");
      wrap.className = "unixui-dropdown";
      const lab = document.createElement("div");
      lab.className = "unixui-label";
      lab.textContent = label;
      const sel = document.createElement("select");
      options.forEach(o => {
        const opt = document.createElement("option");
        opt.value = o; opt.textContent = o;
        sel.appendChild(opt);
      });
      sel.value = saveKey && localStorage.getItem(saveKey) ? localStorage.getItem(saveKey) : def;
      sel.onchange = () => {
        if (saveKey) localStorage.setItem(saveKey, sel.value);
        cb(sel.value);
      };
      wrap.append(lab, sel);
      this._current().appendChild(wrap);
      return this;
    }

    AddKeybind(label, defaultKey, cb, saveKey) {
      const wrap = document.createElement("div");
      wrap.className = "unixui-keybind";
      const lab = document.createElement("div");
      lab.textContent = label;
      const btn = document.createElement("button");
      btn.className = "unixui-keybtn";
      btn.textContent = defaultKey.toUpperCase();
      let key = saveKey && localStorage.getItem(saveKey) ? localStorage.getItem(saveKey) : defaultKey;

      btn.onclick = () => {
        btn.textContent = "Press a key...";
        btn.classList.add("recording");
        const listen = e => {
          key = e.key.toUpperCase();
          if (saveKey) localStorage.setItem(saveKey, key);
          btn.textContent = key;
          btn.classList.remove("recording");
          document.removeEventListener("keydown", listen);
        };
        document.addEventListener("keydown", listen);
      };

      document.addEventListener("keydown", e => {
        if (e.key.toUpperCase() === key.toUpperCase()) cb();
      });

      wrap.append(lab, btn);
      this._current().appendChild(wrap);
      return this;
    }

    AddLabel(text) {
      const l = document.createElement("div");
      l.className = "unixui-label";
      l.textContent = text;
      this._current().appendChild(l);
      return this;
    }

    SetTheme(t) {
      const e = this.el;
      if (t === "light") e.style.background = "rgba(250,250,250,0.9)", e.style.color = "#111";
      else if (t === "kuromi") e.style.background = "rgba(40,0,60,0.95)", e.style.boxShadow = "0 0 30px rgba(255,100,255,0.6)";
      else e.style.background = "rgba(25,25,25,0.9)", e.style.color = "white";
      return this;
    }

    Toggle() { this.el.classList.toggle("hide"); }
    Destroy() { this.el.remove(); }
  }

  window.UI = { New: t => new Menu(t), version: "2.0" };
})();
