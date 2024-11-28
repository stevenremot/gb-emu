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
        <thead>
          <tr>
            <th colspan="2">Z</th>
            <th colspan="2">N</th>
            <th colspan="2">H</th>
            <th colspan="2">C</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td id="flag-z" colspan="2"></td>
            <td id="flag-n" colspan="2"></td>
            <td id="flag-h" colspan="2"></td>
            <td id="flag-c" colspan="2"></td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  connectedCallback() {
    this.app.workerClient.addMessageListener(
      "debug:registers-changed",
      (registers) => this.update(registers),
    );
  }

  update(registers: {
    PC: number;
    SP: number;
    "16bits": [number, number, number, number];
    "8bits": [number, number, number, number, number, number, number, number];
    flags: { Z: number; N: number; H: number; C: number };
  }) {
    this.querySelector(".pc .value")!.textContent = registers.PC.toString(16);
    this.querySelector(".sp .value")!.textContent = registers.SP.toString(16);

    for (let i = 0; i < 4; i += 1) {
      this.querySelector(
        `tbody tr:first-child td:nth-child(${i + 1})`,
      )!.textContent = registers["16bits"][i].toString(16);
    }

    for (let i = 0; i < 8; i += 1) {
      this.querySelector(
        `tbody tr:last-child td:nth-child(${i + 1})`,
      )!.textContent = registers["8bits"][i].toString(16);
    }

    this.querySelector("#flag-z")!.textContent = registers.flags.Z.toString();
    this.querySelector("#flag-n")!.textContent = registers.flags.N.toString();
    this.querySelector("#flag-h")!.textContent = registers.flags.H.toString();
    this.querySelector("#flag-c")!.textContent = registers.flags.C.toString();
  }

  get app() {
    return assertNotNull(document.querySelector("gbemu-app")) as GbemuApp;
  }
}

customElements.define("gbemu-devtools-registers", GbemuDevtoolsRegisters);
