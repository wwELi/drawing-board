export function setClassName(el: HTMLElement, className: string| string []): void {

    const classes = Array.isArray(className) ? className : [className]

    el.className = `${el.className} ${classes.join(' ')}`.trim();
}

export function removeClassName(el: HTMLElement, className: string | string[]) {
    const classes = Array.isArray(className) ? className : [className];
    classes.forEach((name) => {
        el.classList.remove(name);
    })
}

export function getOffsetPosition(el: HTMLElement, left = 0, top = 0): [number, number] {
    const l = el.offsetLeft + left;
    const t = el.offsetTop + top;

    if (el.offsetParent instanceof HTMLElement) {
        return getOffsetPosition(el.offsetParent, l, t);
    }

    return [l, t];

}

export function isFunction(fn: any): boolean {
    return typeof fn === 'function';
}

export function isPointInPathByOffCanvas(path: Path2D, x: number, y: number): boolean {
    const dpr = window.devicePixelRatio || 1;
    const offCanvas = new OffscreenCanvas(window.innerWidth * dpr, window.innerHeight * dpr);
    const offCtx = offCanvas.getContext('2d');
    return !!offCtx?.isPointInPath(path, x, y);
}