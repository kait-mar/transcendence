import React from 'react'

const playerStyle = {
  // width: "39px",
  // height: "298px",
  // left: "1441px",
  // top: "182px",

  // background: "#D9D9D9",
  // borderRadius: "35px",

  position: 'relative' as 'relative',
  width: "18px",
  height: "102px",

  background: "#D9D9D9",
  borderRadius: "30px",
}

const opponentStyle = {

  position: 'relative' as 'relative',
  width: "18px",
  height: "102px",

  background: "#D9D9D9",
  borderRadius: "30px",
}

export const Opponent = () => {
  return (
    <div style={opponentStyle}/>
  )
}

export const Player = () => {
  return (
    <div style={playerStyle}/>
  )
}
