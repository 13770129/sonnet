/* eslint-disable @typescript-eslint/no-explicit-any */
import { SonnetHead, isBrowser } from '@sonnetjs/shared';

import { EventEmitter } from './Event';
import SonnetComponent from '../abstract/SonnetComponent';

const event = EventEmitter.getInstance();

export class SonnetApp {
  private _ssr: boolean = false;
  private _component?: (args?: any) => SonnetComponent;
  private _props?: any;
  private _plugins: { install: (app: SonnetApp) => void }[] = [];
  private _isLazy: boolean = false;
  private _isMounted: boolean = false;
  private _isInitialized: boolean = false;
  private _mountedId: string = '';

  get component() {
    return this._component;
  }

  get isLazy() {
    return this._isLazy;
  }

  get mountedId() {
    return this._mountedId;
  }

  get isMounted() {
    return this._isMounted;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  lazy(value: boolean = true) {
    this._isLazy = value;
    return this;
  }

  ssr(value: boolean = true) {
    this._ssr = value;
    return this;
  }

  root(component: (args?: any) => SonnetComponent, props?: any) {
    this._component = component;
    this._props = props;
    return this;
  }

  use(plugin: { install: (app: SonnetApp) => void }) {
    this._plugins.push(plugin);
    return this;
  }

  private initRootComponent() {
    if (!this._component) return;
    const component = this._component();
    if (this._props?._children) {
      component.children(this._props._children);
    }
    if (this._props?._index) {
      component.index(this._props._index);
    }
    if (this._props?._id) {
      component.id(this._props._id);
    }
    return component;
  }

  mount(selector: string) {
    if (this._isLazy) {
      this._mountedId = selector;
      return this;
    }
    if (isBrowser()) {
      const el = document.querySelector(selector);
      if (el && this._component) {
        const component = this.initRootComponent();

        const getComponent = component?.get();

        if (!this._ssr) {
          if (typeof getComponent === 'string') {
            el.innerHTML = getComponent as string;
          } else if (getComponent instanceof Element) {
            el.appendChild(getComponent);
          }
        }

        const heads = event.emit<SonnetHead>('head');

        heads?.forEach((head) => {
          if (typeof head === 'string') {
            document.head.innerHTML += head;
          } else if (head instanceof Element) {
            document.head.appendChild(head);
          }
        });

        event.emit('script');
        event.off('script');
      }
    }
    event.emit('mount');

    this._isMounted = true;

    return this;
  }

  unmount() {
    event.emit('unmount');
    return this;
  }

  on<T>(
    eventName: string,
    listener: (...args: unknown[]) => T extends void ? void : T,
  ) {
    EventEmitter.getInstance().on(eventName, listener);
    return this;
  }

  once<T>(
    eventName: string,
    listener: (...args: unknown[]) => T extends void ? void : T,
  ) {
    EventEmitter.getInstance().once(eventName, listener);
    return this;
  }

  off<T>(
    eventName: string,
    listener?: (...args: unknown[]) => T extends void ? void : T,
  ) {
    EventEmitter.getInstance().off(eventName, listener);
    return this;
  }

  emit<T>(eventName: string, ...args: unknown[]): T[] | void {
    return EventEmitter.getInstance().emit(eventName, args);
  }

  initialized() {
    this._plugins.forEach((plugin) => {
      plugin.install(this);
    });
    event.emit('initialized');
    this._isInitialized = true;
    return this;
  }
}

export function createApp() {
  return new SonnetApp();
}
