import React , { CSSProperties }  from 'react'

const ballStyle = {
    width: "19px",
    height: "21px",
    position: 'relative' as 'relative',  // not working without the 'as'

    background: "#11C8F0",
    borderRadius: "100%",
}

export function Ball() {
  return (
    <div style={ballStyle}/>
  )
}
