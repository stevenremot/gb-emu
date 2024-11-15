import { paletteColors } from "../graphics/constants";
import "./gbemu-devtools-palette.style.css";

export class GbemuDevtoolsPalette extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /* HTML */ `
      <div class="palette-color" id="color-0"></div>
      <div class="palette-color" id="color-1"></div>
      <div class="palette-color" id="color-2"></div>
      <div class="palette-color" id="color-3"></div>
    `;
  }

  setPalette(palette: [number, number, number, number]) {
    for (let i = 0; i < 4; i += 1) {
      (this.querySelector(`#color-${i}`) as HTMLElement)?.style.setProperty(
        "--color",
        paletteColors[palette[i]],
      );
    }
  }
}

customElements.define("gbemu-devtools-palette", GbemuDevtoolsPalette);
