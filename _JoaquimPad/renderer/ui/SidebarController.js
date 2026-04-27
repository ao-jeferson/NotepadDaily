export class SidebarController {
  constructor({ sidebarContainer, resizer, onResizeEnd }) {
    this.sidebarContainer = sidebarContainer;
    this.resizer = resizer;
    this.onResizeEnd = onResizeEnd;
  }

  init() {
    let resizing = false;

    this.resizer.onmousedown = () => {
      resizing = true;
    };

    document.onmousemove = (e) => {
      if (!resizing) return;
      this.sidebarContainer.style.width = e.clientX + "px";
    };

    document.onmouseup = () => {
      resizing = false;
      this.onResizeEnd?.();
    };

    return this;
  }

  setWidth(width) {
    this.sidebarContainer.style.width = width + "px";
  }

  getWidth() {
    return this.sidebarContainer.offsetWidth;
  }

  show() {
    this.sidebarContainer.style.display = "block";
  }

  hide() {
    this.sidebarContainer.style.display = "none";
  }
}
