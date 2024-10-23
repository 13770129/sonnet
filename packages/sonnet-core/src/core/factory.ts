import { isBrowser, SonnetHead } from '@sonnetjs/shared';

import { EventEmitter } from './Event';
import SonnetComponent from '../abstract/SonnetComponent';

const event = EventEmitter.getInstance();

interface Component<T> {
  new(args?: T): SonnetComponent;
  head?: () => void;
  script?: () => void;
}

const EMPTY_HEAD = 'head(){return""}'
const EMPTY_SCRIPT = 'script(){}'

export function $component<T>(component: Component<T>) {
  return (args?: T) => {
    const instance = new component(args);
    if (isBrowser()) {
      // head tags
      if (component.head?.toString() !== EMPTY_HEAD) {
        event.once<SonnetHead>('head', component.head as () => SonnetHead);
      }
      if (instance.head?.toString() !== EMPTY_HEAD) {
        event.on<SonnetHead>('head', instance.head.bind(instance));
      }
      // scripts
      if (component.script?.toString() !== EMPTY_SCRIPT) {
        event.once('script', component.script);
      }
      if (instance.script?.toString() !== EMPTY_SCRIPT) {
        event.on('script', instance.script.bind(instance));
      }
    }

    return instance as SonnetComponent;
  };
}
