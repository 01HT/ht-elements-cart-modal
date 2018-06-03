"use strict";
import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-icon-button";
import "@polymer/paper-button";
import "@polymer/iron-iconset-svg";
import { IronOverlayBehaviorImpl } from "@polymer/iron-overlay-behavior/iron-overlay-behavior.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";

class HTElementsCartModal extends mixinBehaviors(
  [IronOverlayBehaviorImpl],
  PolymerElement
) {
  static get template() {
    return html`
    <style>
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
        
        .label {
            display: flex;
            line-height: 24px;
            margin: 8px;
        }
        
        .modal-button {
            display: flex;
            margin: 16px 8px;
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
        
        paper-button {
            background: var(--accent-color);
            color:#fff;
        }
        
        a {
            text-transform: none;
            outline: 0;
            text-decoration: none;
            color: inherit;
            width: 50%;
        }

        paper-icon-button {
          color: var(--primary-text-color);
        }
    </style>
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
    <div class="layout-horizontal">
      <a href="/cart" on-click="close" id="viewCartAnchor">
        <paper-button raised class="modal-button">
          Корзина
        </paper-button>
      </a>
      <a href="/checkout" on-click="close">
        <paper-button raised class="modal-button">
          Оплата
        </paper-button>
      </a>
    </div>
    <paper-icon-button icon="ht-elements-cart-modal-icons:close" id="closeBtn" aria-label="Закрыть окно" on-click="close">
      </paper-icon-button>
`;
  }

  static get is() {
    return "ht-elements-cart-modal";
  }

  static get properties() {
    return {
      withBackdrop: {
        type: Boolean,
        value: true
      }
    };
  }

  ready() {
    super.ready();
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", "true");
    this.addEventListener("transitionend", e => this._transitionEnd(e));
    this.addEventListener("iron-overlay-canceled", e => this._onCancel(e));
    this.addEventListener("opened-changed", () => {
      // NOTE: Don't dispatch if modal.opened became false due to time
      // travelling (i.e. state.modal is already false).
      // This check is generally needed whenever you have both UI updating
      // state and state updating the same UI.
      if (!this.opened) {
        // store.dispatch(closeModal());
        this.close();
      }
    });
  }

  _renderOpened() {
    this.restoreFocusOnClose = true;
    this.backdropElement.style.display = "none";
    this.classList.add("opened");
  }

  _renderClosed() {
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
    return [this.$.viewCartAnchor, this.$.closeBtn];
  }

  close() {
    this.dispatchEvent(
      new CustomEvent("on-close-cart-modal", { bubbles: true, composed: true })
    );
  }

  refit() {}

  notifyResize() {}
}

customElements.define("ht-elements-cart-modal", HTElementsCartModal);
