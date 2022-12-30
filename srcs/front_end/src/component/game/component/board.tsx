import React from 'react'

const ROW_SIZE = 10;
const COL_SIZE = 20;
const board = [Array(ROW_SIZE * COL_SIZE)];

const boardStyle = {
    position: 'relative' as 'relative',
    width: "728px",
    height: "374px",

    background: "#000000",
    display: "grid",
    gridTemplate: "`repeat(${ROW_SIZE}, 1fr) / repeat(${COL_SIZE}, 1fr)`"
}

export function Board(props: any) {
  return (
    <div style={boardStyle}/>
  )
}
