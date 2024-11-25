import { GbemuApp } from "../gbemu-app";
import { assertNotNull } from "../utils/assertions";

import "./gbemu-devtools-palette";
import { GbemuDevtoolsPalette } from "./gbemu-devtools-palette";

export class GbemuDevtoolsGraphicsBaseData extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /* HTML */ `
      <div class="section graphics-base-data">
        <div class="section-title">Graphics base data</div>

        <div class="entry">
          <span class="entry-title">SCY:</span> <span class="target-scy"></span>
        </div>
        <div class="entry">
          <span class="entry-title">SCX:</span> <span class="target-scx"></span>
        </div>
        <div class="entry">
          <span class="entry-title">LY:</span> <span class="target-ly"></span>
        </div>
        <div class="entry">
          <span class="entry-title">LYC:</span> <span class="target-lyc"></span>
        </div>

        <table>
          <thead>
            <tr>
              <th>LCDC.7<br />LCD enable</th>
              <th>LCDC.6<br />Win tile map</th>
              <th>LCDC.5<br />Win enable</th>
              <th>LCDC.4<br />BG & Win address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="target-lcdEnable"></td>
              <td class="target-windowTileMap"></td>
              <td class="target-windowEnable"></td>
              <td class="target-bgWindowAddressingMode"></td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th>LCDC.3<br />BG tile map</th>
              <th>LCDC.2<br />OBJ size</th>
              <th>LCDC.1<br />OBJ enable</th>
              <th>LCDC.0<br />BG & Win enable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="target-bgTileMap"></td>
              <td class="target-objSize"></td>
              <td class="target-objEnable"></td>
              <td class="target-bgWindowEnable"></td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>LCDS.6<br />LYC int select</th>
              <th>LCDS.5<br />Mode 2 int select</th>
              <th>LCDS.4<br />Mode 1 int select</th>
              <th>LCDS.3<br />Mode 0 int select</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="target-lycIntSelect"></td>
              <td class="target-mode2IntSelect"></td>
              <td class="target-mode1IntSelect"></td>
              <td class="target-mode0IntSelect"></td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th colspan="2">LCDS.2<br />LYC == LY</th>
              <th colspan="2">LCDS.1-0<br />PPU mode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="2" class="target-lycEqualsLy"></td>
              <td colspan="2" class="target-ppuMode"></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Background palette</div>

        <gbemu-devtools-palette
          id="devtools-bg-palette"
        ></gbemu-devtools-palette>
      </div>
    `;
  }

  connectedCallback() {
    this.app.workerClient.addMessageListener(
      "debug:graphics-base-data-changed",
      (payload) => {
        for (const key in payload.lcdControl) {
          assertNotNull(this.querySelector(`.target-${key}`)).textContent =
            payload.lcdControl[key];
        }

        for (const key in payload.lcdStatus) {
          assertNotNull(this.querySelector(`.target-${key}`)).textContent =
            payload.lcdStatus[key];
        }

        assertNotNull(this.querySelector(".target-scx")).textContent =
          payload.SCX;
        assertNotNull(this.querySelector(".target-scy")).textContent =
          payload.SCY;
        assertNotNull(this.querySelector(".target-ly")).textContent =
          payload.LY;
        assertNotNull(this.querySelector(".target-lyc")).textContent =
          payload.LYC;

        assertNotNull(
          this.querySelector("#devtools-bg-palette") as GbemuDevtoolsPalette,
        ).setPalette(payload.backgroundPalette);
      },
    );
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app")) as GbemuApp;
  }
}

customElements.define(
  "gbemu-devtools-graphics-base-data",
  GbemuDevtoolsGraphicsBaseData,
);
