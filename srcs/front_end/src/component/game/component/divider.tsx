import React from 'react'

const ROW_SIZE = 10;

const divider = [...Array(ROW_SIZE/2+2)].map(_=> <div>{"|"}</div>);
const dividerStyle = {
    position: "relative" as 'relative', //also not working withoiut 'as'
    // width: "346.02px",
    // height: "0px",

    // border: "1px solid #BBABAB",
    // transform: "rotate(90.58deg)",

    fontSize: "50px",
    color: "red",
    // display: "flex",

    // marginLeft: "50px", //try to add it
}

export function Divider() {
  return (
    <div style={dividerStyle}>{divider}</div>
  )
}
