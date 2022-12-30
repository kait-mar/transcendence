import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom';
import { conversations } from '../data/conversations'
import ConversationItem from './ConversationItem';
import { GlobalContext } from '../Chat';
import { io, Socket } from 'socket.io-client';

const SideBar = (props: any) => {
    const { rooms, authData  , socket, conversationsList, setconversationsList, selectedChatRoomOrContact, setSelectedChatRoomOrContact} = useContext(GlobalContext)
    const [whoseSelected, SetWhoseSelected] = useState("")
    const [searchInput, setSearchInput] = useState("");
   



      

    const cnvs = conversationsList
    .filter((cnv:any, index:number)=> {
        return cnv.alteredName?.startsWith(searchInput);
    })   
    .map((cnv: any, index:number) => {
        return (
            <li key={index} onClick={() => {
                setSelectedChatRoomOrContact(cnv)
                // socket.emit("selectRoom", {login:authData.login, room:cnv});
            }} className='border border-gray-800 text-white bg-whathsapp_uns bg-opacity-60 list-none rounded-sm p-0 cursor-pointer hover:text-white hover:bg-whathsapp_selctd'>
                <ConversationItem cnv={cnv}   key={index} whoseSelected={whoseSelected} SetWhoseSelected={SetWhoseSelected}    />
            </li>
        )
    })

    let is_sidebar_on = props.is_cnvs_shown ? "" : "-"
    let is_cnvs = props.is_cnvs_shown ? "0" : "full";
    let sideBarTrans = props.is_cnvs_shown ? "translate-x-0" : "-translate-x-full"
    const close_open_sidebar = () => {
        props.setIs_cnvs_shown(props.is_cnvs_shown ? false : true)
    }

      return createPortal(
        <div>
            <div className={` absolute top-0 left-0 right-0 bottom-0 z-[${is_sidebar_on}2] bg-black/60`} onClick={close_open_sidebar}></div>
            <div className={`h-screen flex-none w-1/3 bg-black bg-opacity-50 flex flex-col absolute top-0 left-0 right-0 bottom-0 z-[${is_sidebar_on}2] ${sideBarTrans} duration-[400ms] shadow-lg  shadow-purple-500/50 border-2 border-purple-500 focus:ring-pruple-500 focus:border-blue-500`}>
                <input onChange={e => setSearchInput(e.target.value)}  className='m-1 text-lg text-white bg-opacity-30 bg-black  border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg' placeholder='enter USER/ROOM name'></input>
                <ul className='h-full overflow-auto flex-1'>
                    {cnvs}
                </ul>
            </div>
        </div>
        , document.getElementById("CnvsModal") as HTMLElement)
}

export default SideBar

function useref(rooms: any) {
    throw new Error('Function not implemented.');
}
