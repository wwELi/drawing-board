import { getOffsetPosition } from './index';
type Handelr = (params: [number, number]) => void;

export class Drop {

    private isMove = false;
    private isStart = false;
    private offset: [number, number];

    private moveHandler: Handelr[] = [];
    private startHandler: Handelr[] = [];

    constructor(private el: HTMLElement) {

        this.offset = getOffsetPosition(el);;

        el.addEventListener('mousedown' , this.onmousedown.bind(this));
        document.addEventListener('mousemove' , this.mousemove.bind(this));
        document.addEventListener('mouseup' , this.mouseup.bind(this));
    }

    private onmousedown() {
        this.isMove = true;
        this.isStart = true;
    }

    private mousemove(evt: MouseEvent) {
        if (!this.isMove) {
            return;
        }

        const [offsetX, offsetY] = this.offset;
        const x = evt.x - offsetX;
        const y = evt.y - offsetY;

        if (this.isStart) {
            this.startHandler.forEach(cb => cb([x, y]));
            this.isStart = false;
        }

        this.moveHandler.forEach((cb) => cb([x, y]));
    }

    private mouseup() {
        this.isMove = false;
    }

    public move(cb: Handelr): Drop {
        this.moveHandler.push(cb);
        return this;
    }

    public start(cb: Handelr): Drop {
        this.startHandler.push(cb);
        return this;
    }
}