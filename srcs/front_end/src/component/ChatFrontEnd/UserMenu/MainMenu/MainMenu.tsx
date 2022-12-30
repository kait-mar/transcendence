import axios from 'axios'
import React, { useContext, useEffect } from 'react'
import { isAuthenticated, isLoggedIn} from '../../../../api/task.api';
import { io } from 'socket.io-client';
import { GlobalContext } from '../../Chat';
import { Link, useNavigate } from 'react-router-dom'


export default function MainMenu(props:any) {
    const { rooms, authData, selectedChatRoomOrContact } = useContext(GlobalContext)
    let isRoomContactEmpty =  !selectedChatRoomOrContact? "hidden": ""
    let isRoom = "hidden"
    let isContact = "hidden"
    if (selectedChatRoomOrContact)
    {
        isRoom = !selectedChatRoomOrContact || selectedChatRoomOrContact.roomType == "privategroup"? "hidden": ""
        isContact = !selectedChatRoomOrContact || selectedChatRoomOrContact.roomType != "privategroup"? "hidden": ""

    }

  return (
      <div className=' flex flex-col justify-center items-center p-2 w-full' >
      
          <h1 className="text-purple-800 font-bold text-2xl font-mono">Options: </h1>
          <button onClick={() =>{props.setWhichInterface("CreateRoom")}}   className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3'> create Room</button>
          <button onClick={() => { props.setWhichInterface("SendMessage")}}   className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3'> send message</button>
          <button  onClick={() => { props.setWhichInterface("room settings")}}  className={`flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3 ${isRoomContactEmpty} ${isRoom}`}> room settings</button>
          <button onClick={() => { props.setWhichInterface("user settings")}}  className={`flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3 ${isRoomContactEmpty} ${isContact}`}>user settings</button>
          <h1 className="text-purple-800 font-bold text-2xl font-mono">Navigation: </h1>
          <Link className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3' to="/">
            <a className='' href='#home'>go to home page</a>
          </Link>

          <Link className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3' to="/game">
            <a className='' href='#play'>Play</a>
          </Link>

          <Link className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3' to="/Stream">
            <a  href='#stream'>Watch Live</a>
          </Link>
          <Link className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3' to="/adminPanel">
            <a  href='#adminPanel'>Settings</a>
          </Link>
         
          <Link className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3' to="/user/admin">
            <a  href='#home'>Dashboard</a>
          </Link>
      </div>
  )
}
