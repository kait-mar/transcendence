import React, { useState } from 'react'
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import './Card.css'

const Card = (props:any) => {
    const [expanded, setExpanded] = useState(false);
  return (

    <div>
        <CompactCard param ={props} />
    </div>
     
  )
}


function CompactCard ({param}: any) {
    const Png = param.png;
    return (
        <div className='CompactCard'
            style={{

                background : param.color.backGround,
                boxShadow: param.color.boxShadow
            }
            }
        >
            <div className="radialBar">
                <CircularProgressbarWithChildren 
                    value={param.barValue}
                    text= {`${param.barValue}%`}
                />
                <span>{param.title}</span>
            </div>
            <div className ='detail' >
                <Png size ={70} />
                <span>{param.value}</span>
                <span>Last 24 hours</span>
            </div>
        </div>
    )
}
export default Card
