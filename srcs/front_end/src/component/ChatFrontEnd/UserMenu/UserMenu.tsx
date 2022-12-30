import React from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useState } from 'react';
import CreateRoom from './CreateRoom/CreateRoom';
import MainMenu from './MainMenu/MainMenu';
// import { io } from 'socket.io-client'
import SendMessage from './SendMessage/SendMessage';
import RoomSettings from './RoomSettings/RoomSettings';
import ManageMembers from './RoomSettings/ManageMembers';
import AddMembers from './RoomSettings/AddMembers';
import UserSettings from './UserSettings/UserSettings';
import PasswordSettings from './RoomSettings/PasswordSettings/PasswordSettings';


export default function UserMenu(props: any) {
  let is_menu_on = props.isMenuShown ? "z-[2]" : "z-[-2]"
  // let is_menu_on = props.isMenuShown ? "" : ""
  let is_menu_hidden = !props.isMenuShown ? "hidden": ""
  let is_cnvs = props.isMenuShown ? "0" : "full";
  let menuTrans = props.isMenuShown ? "" : "translate-y-[-100%]"
  const [test, SetTest] = useState("bro");
  const [whichInterface, setWhichInterface] = useState("MainMenu");
  const close_open_menu = () => {
    props.setIsMenuShown(props.isMenuShown ? false : true)
  }

 
const getRoom = () => {
  axios.get("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/findRoom").then(res => {
    let ar = res.data;
    if (ar.length )
      SetTest(`f ${res.data} f`)
      else
        SetTest(`khawya awaldi`)
  }).catch(Error => {
    SetTest(`${Error}`)
  })
}
const getUsers = () => {
  axios.get("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/users").then(res => {
    let ar = res.data;
    if (ar.length)
      SetTest(`f ${res.data} f`)
      else
        SetTest(`khawya awaldi hhh`)
  }).catch(Error => {
    SetTest(`${Error}`)
  })
}

const createRoom = () => {
  
  let d = {
    type: "public",
    owner: 'ahakam',
    messages: [],
    createdAt: new Date(),
    name: "redRoom",
    admins: [],
    banned: [],
    description: "",
    members: []
  };

  axios.post("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/createRoom", d).then(res => {
    let ar = res.data;
    SetTest(`f ${res.data} f`)
  }).catch(Error => {
    SetTest(`${Error} 👀`)
  })
} 
  let intrfcs_map = new Map();
  intrfcs_map.set('CreateRoom', <CreateRoom />)
  intrfcs_map.set('MainMenu', <MainMenu />)
  intrfcs_map.set('SendMessage', <></>)
  let cmp = <MainMenu />;
  return createPortal(
    <div>
      <div className={` absolute top-0 left-0 right-0 bottom-0 ${is_menu_on} bg-black/40`} onClick={close_open_menu}></div>
      {/* <div className={`h-screen flex-none w-1/3 bg-gray-900 bg-opacity-50  absolute top-0  right-0 bottom-0 z-20 ${menuTrans} duration-[400ms] shadow-lg  shadow-purple-500/50 border-2 border-purple-500 focus:ring-pruple-500 focus:border-blue-500 flex p-0 m-0 `}> */}
      <div className={`h-screen flex-none w-1/3 bg-gray-900 bg-opacity-50  absolute top-0 left-2/3  right-2/3 bottom-0 ${is_menu_on} ${menuTrans}  duration-[400ms] shadow-lg  shadow-purple-500/50 border-2 border-purple-500 focus:ring-pruple-500 focus:border-blue-500 flex p-0 m-0 `}>

        {
          (() => {
            switch(whichInterface) {
              case "MainMenu":
                return <MainMenu  whichInterface={whichInterface} setWhichInterface={setWhichInterface} />
              case "CreateRoom":
                return <CreateRoom setWhichInterface={setWhichInterface} />
              case "SendMessage":
                return <SendMessage setWhichInterface={setWhichInterface} />
              case "room settings":
                return <RoomSettings setWhichInterface={setWhichInterface} />
              case "ManageMembers":
                return <ManageMembers setWhichInterface={setWhichInterface} />
              case "AddMembers":
                return <AddMembers  setWhichInterface={setWhichInterface} />
              case "user settings":
                return <UserSettings setWhichInterface={setWhichInterface}  />
              case "PasswordSettings":
                return <PasswordSettings setWhichInterface={setWhichInterface} /> 
            }
          }) ()
        }
      </div>
    </div>,
    document.getElementById('userMenuModal') as HTMLElement
  )
}
