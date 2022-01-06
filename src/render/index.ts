import jss from 'jss'
import preset from 'jss-preset-default';
import { setGlobalStyle } from './global';
import { Container } from './container';

export function render(el: HTMLElement) {
    jss.setup(preset());
    setGlobalStyle();

    new Container(el).render();
}




