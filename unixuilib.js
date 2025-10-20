window.UI = (() => {
  const style = document.createElement("style");
  style.textContent = `
  .ui-box {
    position: fixed; top: 120px; left: 120px;
    width: 320px; padding: 10px 0;
    background: rgba(25,25,25,0.95);
    border: 1px solid #555;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(255,0,255,0.3);
    color: white;
    font-family: 'Inter', sans-serif;
    z-index: 9999999;
  }
  .ui-header {
    font-size: 16px; font-weight: 600;
    text-align: center; padding: 8px 0;
    cursor: move; user-select: none;
    background: rgba(255,255,255,0.05);
    border-bottom: 1px solid #333;
  }
  .ui-content { padding: 8px 10px; max-height: 400px; overflow-y: auto; }
  .ui-btn {
    display: block; width: 100%;
    background: rgba(255,255,255,0.05);
    border: none; color: white;
    padding: 6px; margin-top: 5px;
    border-radius: 6px;
    text-align: left;
    cursor: pointer; transition: 0.15s;
  }
  .ui-btn:hover { background: rgba(255,0,255,0.3); }
  .ui-toggle { display: flex; align-items: center; margin-top: 5px; }
  .ui-toggle input { margin-right: 8px; cursor: pointer; }
  .ui-slider { width: 100%; margin-top: 5px; }
  .ui-label { opacity: 0.8; margin-top: 5px; font-size: 13px; }
  `;
  document.head.appendChild(style);

  const makeDraggable = el => {
    const header = el.querySelector(".ui-header");
    let dragging = false, offsetX = 0, offsetY = 0;
    header.onmousedown = e => { dragging = true; offsetX = e.clientX - el.offsetLeft; offsetY = e.clientY - el.offsetTop; };
    document.onmouseup = () => dragging = false;
    document.onmousemove = e => {
      if (!dragging) return;
      el.style.left = (e.clientX - offsetX) + "px";
      el.style.top = (e.clientY - offsetY) + "px";
    };
  };

  class Menu {
    constructor(title = "UI Menu") {
      this.el = document.createElement("div");
      this.el.className = "ui-box";
      this.el.innerHTML = `<div class="ui-header">${title}</div><div class="ui-content"></div>`;
      document.body.appendChild(this.el);
      this.content = this.el.querySelector(".ui-content");
      makeDraggable(this.el);
    }
    AddButton(label, callback) {
      const b = document.createElement("button");
      b.className = "ui-btn";
      b.textContent = label;
      b.onclick = callback;
      this.content.appendChild(b);
      return this;
    }
    AddToggle(label, callback) {
      const div = document.createElement("div");
      div.className = "ui-toggle";
      const box = document.createElement("input");
      box.type = "checkbox";
      const text = document.createElement("span");
      text.textContent = label;
      box.onchange = () => callback(box.checked);
      div.append(box, text);
      this.content.appendChild(div);
      return this;
    }
    AddSlider(label, min, max, value, callback) {
      const text = document.createElement("div");
      text.className = "ui-label";
      text.textContent = `${label}: ${value}`;
      const input = document.createElement("input");
      input.type = "range"; input.min = min; input.max = max; input.value = value;
      input.className = "ui-slider";
      input.oninput = () => { text.textContent = `${label}: ${input.value}`; callback(parseFloat(input.value)); };
      this.content.append(text, input);
      return this;
    }
    AddLabel(text) {
      const l = document.createElement("div");
      l.className = "ui-label";
      l.textContent = text;
      this.content.appendChild(l);
      return this;
    }
    SetTheme(t) {
      const box = this.el;
      if (t === "light") box.style.background = "rgba(250,250,250,0.95)", box.style.color = "#111";
      else if (t === "kuromi") box.style.background = "rgba(40,0,60,0.95)", box.style.boxShadow = "0 0 25px rgba(255,100,255,0.6)";
      else box.style.background = "rgba(25,25,25,0.95)", box.style.color = "#fff";
      return this;
    }
    Destroy() { this.el.remove(); }
  }

  return {
    New: title => new Menu(title)
  };
})();
