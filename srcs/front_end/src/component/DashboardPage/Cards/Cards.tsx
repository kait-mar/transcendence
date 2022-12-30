import React from 'react'
// import { cardsData } from '../Data/Data'
import "./Cards.css"
import Card from "../Card/Card"

import {BiHomeAlt} from "react-icons/bi"
import {FaGamepad}  from "react-icons/fa"
import {BsFillChatFill} from "react-icons/bs"
import  {FiLogOut} from "react-icons/fi"
import {SiGamejolt} from "react-icons/si"
import {GiAngelWings} from "react-icons/gi"
import {ImFire} from "react-icons/im"
import { isAuthenticated } from '../../../api/task.api'



const Cards = () => {

  const [xp, setXp] = React.useState(Number);
  const [level, setLevel] = React.useState(Number);
  const [score, setScore] = React.useState(Number);

  React.useEffect(() => {
    isAuthenticated()
    .then(({data}) => {
      setXp(data.xp);
      setLevel(data.level);
      setScore(data.score);
    })
  },[xp, level, score])


const cardsData = [
    {
      title: "LvL",
      color: {
        backGround: "linear-gradient(180deg, #bb67ff 0%, #c484f3 100%)",
        boxShadow: "0px 10px 20px 0px #e0c6f5",
      },
      barValue: level / 1,
      value: level.toString(),
      png: SiGamejolt,
    },
    {
      title: "Xp",
      color: {
        backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
        boxShadow: "0px 10px 20px 0px #FDC0C7",
      },
      barValue: xp / 500,
      value: xp.toString(),
      png: GiAngelWings,
    },
    {
      title: "Score",
      color: {
        backGround:
          "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
        boxShadow: "0px 10px 20px 0px #F9D59B",
      },
      barValue: score / 2 ,
      value: score.toString(),
      png: ImFire,
    },
  ];

  return (
    <div className='Cards'>
      {cardsData.map((card, id) => {
        return(
          <div className='parentContainer'>
            <Card 
              title ={card.title}
              color = {card.color}
              barValue={card.barValue}
              value={card.value}
              png={card.png}
              //series= {card.series}
            />
          </div>
        )
      })

      }
    </div>
  )
}

export default Cards