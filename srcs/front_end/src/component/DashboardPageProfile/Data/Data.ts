import {BiHomeAlt} from "react-icons/bi"
import {FaGamepad}  from "react-icons/fa"
import {BsFillChatFill} from "react-icons/bs"
import  {FiLogOut} from "react-icons/fi"
import {SiGamejolt} from "react-icons/si"
import {GiAngelWings} from "react-icons/gi"
import {ImFire} from "react-icons/im"
import img from './logo192.png'


export const SideBareData = [
    {
        icon: BiHomeAlt,
        heading: "MainPage",
        link: "/"
    },
    {
        icon: FaGamepad,
        heading: "Game",
        link: "/Game"

    },
    {
        icon: BsFillChatFill,
        heading: "Chat",
        link: "/Chat"
    },
]

export const cardsData = [
    {
      title: "LvL",
      color: {
        backGround: "linear-gradient(180deg, #bb67ff 0%, #c484f3 100%)",
        boxShadow: "0px 10px 20px 0px #e0c6f5",
      },
      barValue: 90,
      value: "25,970",
      png: SiGamejolt,
    },
    {
      title: "Xp",
      color: {
        backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
        boxShadow: "0px 10px 20px 0px #FDC0C7",
      },
      barValue: 80,
      value: "14,270",
      png: GiAngelWings,
    },
    {
      title: "Score",
      color: {
        backGround:
          "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
        boxShadow: "0px 10px 20px 0px #F9D59B",
      },
      barValue: 60,
      value: "4,270",
      png: ImFire,
    },
  ];

export interface friendData {
  img: any;
  name:string;
  noti: string;
 }


const test :friendData = {
  img:img,
  name : "Labhairi Mouaad",
   noti: "Online"
}

let arrFriends : friendData[] = [];              



export const addFriend = ():friendData[] => {
  

    arrFriends.push(test)  
    return arrFriends;
}



 export const updateData = [
  // for(let i = 0; i <addFriend().length; i++)
    // addFriend()[1],
    test
 ] 