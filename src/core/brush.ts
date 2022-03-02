import { Drop } from 'drop-handler';
import { useVariable } from '../render/use-variable';
import { Stack } from './stack';
import addWatermark from '../utils/watermark';
import { List } from '../utils/list';

function renderCanvasBackGround(el: HTMLCanvasElement) {
    const [border] = useVariable('1px');
    const [size] = useVariable('28px');
    const [color] = useVariable('#f5d7ee');

    function genLinearGradient(deg: number): string {
        return `linear-gradient(${deg}deg, transparent var(${size}), var(${color}) var(${size}))`
    }

    const style = {
        position: 'absolute',
        top: '0',
        left: '0',
        background: [genLinearGradient(180), genLinearGradient(90)].join(','),
        backgroundSize: `calc(var(${size}) + var(${border})) calc(var(${size}) + var(${border}))`,
    }

    Object.keys(style).forEach((key) => {
        el.style[key] = style[key];
    });
}

export class Brush {

    private stack = new Stack<ImageData>();
    private ctx: CanvasRenderingContext2D;

    private movedPoints:List<{ x: number, y:number }> = new List(4);

    constructor(
        private canvas: HTMLCanvasElement
    ) {
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        this.clearAliasing();

        renderCanvasBackGround(canvas);
        const drop = new Drop(canvas);

        this.stack.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));

        drop
        .start(([x, y]) => {
            this.ctx.beginPath();
            this.movedPoints.push({ x, y });
        })
        .move(([x, y]) => {
            this.movedPoints.push({ x, y });
            this.line();
        })
        .up(() => {
            this.ctx.closePath();
            this.movedPoints.clear();
            this.stack.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        })
    }

    // 消除线条出现锯齿问题
    private clearAliasing() {
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = 10;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    private line() {
        if(this.movedPoints.length < 3) {
            return;
        }
        const len = this.movedPoints.length;
        const endx = (this.movedPoints[len - 1].x + this.movedPoints[len - 2].x) / 2;
        const endy = (this.movedPoints[len - 1].y + this.movedPoints[len - 2].y) / 2;
        const lastX = this.movedPoints.length === 3
            ? this.movedPoints[len - 3].x
            : (this.movedPoints[len - 3].x + this.movedPoints[len - 2].x) / 2;
        const lastY = this.movedPoints.length === 3
            ? this.movedPoints[len - 3].y
            : (this.movedPoints[len - 3].y + this.movedPoints[len - 2].y) / 2;

        this.ctx.moveTo(lastX, lastY);
        this.ctx.quadraticCurveTo(
            this.movedPoints[len - 2].x,
            this.movedPoints[len - 2].y,
            endx,
            endy
        )
        this.ctx.stroke();
    }

    private putImageData(imageData: ImageData | undefined | null) {
        if (!imageData) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imageData, 0, 0);
    }

    public next() {
        this.putImageData(this.stack.next());
    }

    public prev() {
        this.putImageData(this.stack.prev());
    }

    public setBrushColor(color: string) {
        this.ctx.strokeStyle = color;
    }

    public toImageBlob(): Promise<Blob> {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.canvas, 0, 0);

        document.body.appendChild(addWatermark(canvas, true));

        return new Promise((resolve, reject) => {

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject();
                    return;
                }
                resolve(blob);
            }, 'image/png');
    
        })
    }

    public setBrushSize(size: number) {
        this.ctx.lineWidth = size;
    }

}