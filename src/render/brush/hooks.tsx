import React, { memo, useEffect, useMemo, useState } from "react";
import { Brush } from "../../core/brush";
import { useContextmenu } from "../../hooks/useContextmenu";
import { PopUp } from "../popup";
import { Panel } from '../panel/index';
import { useSpaceMove } from "../../hooks/useSpaceMove";
import { usePasteEvent } from "../../hooks/usePasteEvent";
import { ImageShape } from '../../core/imageShape';
import { TextShape } from '../../core/textShape';
import { Shape } from "../../core/shape";
import { Drop } from "drop-handler";
import { Input } from "./input";
import { Dot } from "../../core/dot";

export function onContextmenu(brush: Brush | null) {
    const canvas = brush?.getContainerCanvas();
    
    useContextmenu(canvas, (x, y) => {
        if (!brush) return;
        const shapes = brush.getSelectShapes(x, y);
        const shape = shapes[0];
        PopUp.close();
        if (shape) {
            PopUp.show(<Panel shape={shape} brush={brush}></Panel>, { x, y });
        }
    }, [brush]);
}

export function onPressSpaceDropMove(brush: Brush | null) {
    const canvas = brush?.getContainerCanvas();
    useSpaceMove(canvas, (x, y) => brush?.translate(x, y), [brush])
}

export function onPasteCanvas(brush: Brush | null) {
    usePasteEvent(({ type, data, coordinate }) => {
        const handler = {
            text: () => brush?.push(new TextShape(...coordinate, data as string)),
            image: () => brush?.push(new ImageShape(...coordinate, data as HTMLImageElement))
        }
        handler[type]?.();
    }, [brush]);
}

export function moveSelectedShape(brush: Brush | null) {
    let selectShape: Shape | null = null;
    let selectDot: Dot | null  = null;
    let lastX, lastY;

    useEffect(() => {
        if (!brush) return;
        const canvas = brush.getContainerCanvas();
        new Drop(brush.getContainerCanvas())
        .click(([x, y]) => {
            const shapes = brush.getSelectShapes(x, y);
            const shape = shapes[0];
            selectShape = shape;

            if (!shape) {
                const dots = brush.getSelectDots(x, y);
                console.log('dots:', dots)
                selectDot = dots[0]
            }
        })
        .move(([x, y]) => {
            if (selectDot && lastX && lastY) {
                const shape = selectDot.shape;
                canvas.style.cursor = selectDot.cursor;
                selectDot.onSelectCb(x - lastX, y - lastY);
                brush.redraw();
                shape.select(brush.ctx);
            }
            if (!selectShape || !lastX || !lastY) {
                lastX = x;
                lastY = y;
                return;
            }

            if (selectShape) {
                canvas.style.cursor = 'move';
                selectShape.x = selectShape.x + x - lastX;
                selectShape.y = selectShape.y + y - lastY;
            }

            brush.shapePinToTop(selectShape);
            brush.redraw();

            lastX = x;
            lastY = y;
        })
        .up(() => {
            selectDot = lastX = lastY = null;
            canvas.style.cursor = 'auto';
        });

    }, [brush])
}

export function drawSelectedShape(brush: Brush | null) {

    useEffect(() => {
        if (!brush) return;
        const canvas = brush.getContainerCanvas();
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.addEventListener('click', (evt) => {
            PopUp.close();
            const {x, y} = evt;
            brush.redraw();
            const shapes = brush.getSelectShapes(x, y);
            shapes.forEach((shape) => shape.select(ctx));
        })

    }, [brush])
}

export function dbClickInputText(brush: Brush | null) {

    function dblclick(evt) {
        const { x, y } = evt;
        const shape = brush?.getSelectShapes(x, y)[0];
        if (!shape) return;
        const canvas = brush.getContainerCanvas();
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (typeof shape.fillText === 'function') {
            PopUp.show(<Input shape={shape} ctx={ctx} brush={brush}/>, { x, y })
        }
    }

    useEffect(() => {
        if (!brush) return;
        const canvas = brush.getContainerCanvas();
        canvas.addEventListener('dblclick', dblclick);

        return () => canvas.removeEventListener('dblclick', dblclick);

    }, [brush]);

}
