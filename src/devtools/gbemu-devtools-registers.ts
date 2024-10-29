import { GbemuApp } from "../gbemu-app";
import { assertNotNull } from "../utils/assertions";

import "./gbemu-devtools-registers.style.css";

export class GbemuDevtoolsRegisters extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /* HTML */ ` <div class="section registers">
      <div class="section-title">Registers</div>
      <div class="entry pc">PC: <span class="value"></span></div>
      <div class="entry sp">SP: <span class="value"></span></div>
      <table>
        <thead>
          <tr>
            <th colspan="2">bc</th>
            <th colspan="2">de</th>
            <th colspan="2">hl</th>
            <th colspan="2">af</th>
          </tr>
          <tr>
            <th>b</th>
            <th>c</th>
            <th>d</th>
            <th>e</th>
            <th>h</th>
            <th>l</th>
            <th>[hl]</th>
            <th>a</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="2">bc</td>
            <td colspan="2">de</td>
            <td colspan="2">hl</td>
            <td colspan="2">af</td>
          </tr>
          <tr>
            <td>b</td>
            <td>c</td>
            <td>d</td>
            <td>e</td>
            <td>h</td>
            <td>l</td>
            <td>[hl]</td>
            <td>a</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  connectedCallback() {
    document.body.addEventListener("gbemu:execution-paused", () => {
      this.update();
    });
  }

  update() {
    const { registers } = this.app.processor;

    this.querySelector(".pc .value")!.textContent = registers.PC.toString(16);
    this.querySelector(".sp .value")!.textContent = registers.SP.toString(16);

    for (let i = 0; i < 4; i += 1) {
      this.querySelector(
        `tbody tr:first-child td:nth-child(${i + 1})`,
      )!.textContent = registers.get16Bits(i).toString(16);
    }

    for (let i = 0; i < 8; i += 1) {
      this.querySelector(
        `tbody tr:last-child td:nth-child(${i + 1})`,
      )!.textContent = registers.get8Bits(i).toString(16);
    }
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app")) as GbemuApp;
  }
}

customElements.define("gbemu-devtools-registers", GbemuDevtoolsRegisters);
