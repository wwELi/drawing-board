import { ToolBar } from './toolbar';
import { BrushCanvas } from './brush/index';
import { DownloadFile } from './download';
import { BrushToogle } from './brush-toogle';

import React from 'react';
import styled from 'styled-components';
import { InsertShape } from './insert-shape';
import { PopUp } from './popup';
import { RedoUndo } from './redoUndo';

const Background = styled.main`
    position: relative;
    width: 100vw;
    height: 100vh;
`

const RightTopTools = styled.div`
    position: fixed;
    right: 20px;
    top: 20px;
    z-index: 10;
    display: flex;
    &>:nth-child(n):not(:last-child) {
        margin-right: 12px;
    };
    &>:nth-child(n){
        cursor: pointer;
    }
`

function Container() {
    return <Background>
        <RightTopTools>
            <RedoUndo></RedoUndo>
            <InsertShape></InsertShape>
            {/* <BrushToogle></BrushToogle> */}
            <DownloadFile></DownloadFile>
        </RightTopTools>
        <BrushCanvas></BrushCanvas>
        <ToolBar></ToolBar>
        <PopUp/>
    </Background>
}

export default Container;