"use strict";
import { LitElement, html, css } from "lit-element";
import "@polymer/paper-icon-button";
import "@polymer/paper-button";
import "@polymer/iron-iconset-svg";
import { IronOverlayBehaviorImpl } from "@polymer/iron-overlay-behavior/iron-overlay-behavior.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";
import "@01ht/ht-spinner";

class HTElementsCartModal extends mixinBehaviors(
  [IronOverlayBehaviorImpl],
  LitElement
) {
  static styles = [
    window.SharedStyles,
    css`<style>
      :host {
        display: block;
        position: fixed;
        background-color: #FFF;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        width: 320px;
        padding: 12px;
        visibility: hidden;
        will-change: transform;
        top: 56px;
        right: 16px;
        -webkit-transform: translate3d(calc(100% + 16px), 0, 0);
        transform: translate3d(calc(100% + 16px), 0, 0);
        transition-property: visibility, -webkit-transform;
        transition-property: visibility, transform;
        transition-duration: 0.2s;
        transition-delay: 0.1s;
      }
      
      :host(.opened) {
        visibility: visible;
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
      }
      
      .layout-horizontal {
        display: flex;
        flex-direction: row;
      }

      .actions {
        padding: 12px 8px;
        justify-content: space-between;
      }
      
      .label {
        display: flex;
        line-height: 24px;
        margin: 8px;
      }
      
      .modal-button {
        display: flex;
      }
      
      .modal-button > a {
        box-sizing: border-box;
        width: 100%;
        padding: 8px 24px;
      }
      
      #closeBtn {
        position: absolute;
        right: 5px;
        top: 5px;
      }

      paper-button[disabled] {
        background: #ccc;
        color: #fff;
        text-transform: uppercase;
      }

      ht-spinner {
        display:flex;
        height: 36px;
        justify-content:center;
        align-items:center;
      }
      
      @media (max-width: 767px) {
        :host {
          top: auto;
          bottom: 0;
          left: 0;
          right: 0;
          width: auto;
          -webkit-transform: translate3d(0, 100%, 0);
          transform: translate3d(0, 100%, 0);
        }
      }
      
      .actions > * {
        color: #fff;
        text-transform: uppercase;
        outline: 0;
        text-decoration: none;
        width: calc(50% - 8px);
      }

      paper-icon-button {
        color: var(--primary-text-color);
      }
    </style>`
  ];

  render() {
    const { signedIn, orderCreating } = this;
    return html`
    <iron-iconset-svg size="24" name="ht-elements-cart-modal-icons">
      <svg>
        <defs>
          <g id="close">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </g>
        </defs>
      </svg>
    </iron-iconset-svg>
    <div class="layout-horizontal">
      <div class="label">Добавлено в корзину</div>
    </div>
    <div class="layout-horizontal actions">
      <a href="/cart" @click="${this.close}" id="viewCartAnchor">
        <paper-button raised class="modal-button">
          Корзина
        </paper-button>
      </a>
        ${
          !signedIn
            ? html`<paper-button raised disabled class="modal-button">Оплата</paper-button>`
            : html`${
                orderCreating
                  ? html`<ht-spinner button></ht-spinner>`
                  : html`
        <paper-button raised class="modal-button" @click="${
          this._checkOut
        }">Оплата</paper-button>`
              }`
        }
    </div>
    <paper-icon-button icon="ht-elements-cart-modal-icons:close" id="closeBtn" aria-label="Закрыть окно" @click="${
      this.close
    }">
      </paper-icon-button>
`;
  }

  static get properties() {
    return {
      withBackdrop: { type: Boolean },
      opened: { type: Boolean },
      signedIn: { type: Boolean },
      orderCreating: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.withBackdrop = true;
  }

  firstUpdated() {
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", "true");
    this.addEventListener("transitionend", e => this._transitionEnd(e));
    this.addEventListener("iron-overlay-canceled", e => this._onCancel(e));
    this.addEventListener("opened-changed", () => {
      // NOTE: Don't dispatch if modal.opened became false due to time
      // travelling (i.e. state.modal is already false).
      // This check is generally needed whenever you have both UI updating
      // state and state updating the same UI.
      if (!this.opened) this.dispatchClose();
    });
  }

  _renderOpened() {
    this.orderCreating = false;
    this.requestUpdate();
    this.restoreFocusOnClose = true;
    this.backdropElement.style.display = "none";
    this.classList.add("opened");
  }

  _renderClosed() {
    this.orderCreating = false;
    this.classList.remove("opened");
  }

  _onCancel(e) {
    // Don't restore focus when the overlay is closed after a mouse event
    if (e.detail instanceof MouseEvent) {
      this.restoreFocusOnClose = false;
    }
  }

  _transitionEnd(e) {
    if (e.target !== this || e.propertyName !== "transform") {
      return;
    }
    if (this.opened) {
      this._finishRenderOpened();
    } else {
      this._finishRenderClosed();
      this.backdropElement.style.display = "";
    }
  }

  get _focusableNodes() {
    return [
      this.shadowRoot.querySelector("#viewCartAnchor"),
      this.shadowRoot.querySelector("#closeBtn")
    ];
  }

  dispatchClose() {
    this.dispatchEvent(
      new CustomEvent("on-close-cart-modal", { bubbles: true, composed: true })
    );
  }

  refit() {}

  notifyResize() {}

  _checkOut() {
    this.orderCreating = true;
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent("create-order", {
        bubbles: true,
        composed: true,
        detail: {
          ordertypeId: "v2m2Mq3clhUhyeex5Xkp"
        }
      })
    );
    // this.close();
  }
}

customElements.define("ht-elements-cart-modal", HTElementsCartModal);
