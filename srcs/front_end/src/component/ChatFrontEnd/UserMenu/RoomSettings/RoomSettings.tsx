import axios from 'axios'
import React, { useContext, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';

import { GlobalContext } from '../../Chat';
import { useNavigate } from 'react-router-dom';


const notify = (text:string) => {
  toast(text, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    });
} 

export default function RoomSettings(props:any) {
    const { rooms, setRooms, authData, users, selectedChatRoomOrContact, socket } = useContext(GlobalContext)
    let isOwner = authData.login == selectedChatRoomOrContact?.roomObj?.owner? "": "hidden";
    const navigate = useNavigate();
 
    let isAdmin = selectedChatRoomOrContact?.roomObj.admins.find((admin:any) => {return admin.login == authData.login}) || authData.login == selectedChatRoomOrContact?.roomObj?.owner ? "":"hidden"
    const leaveRoom = () => {
        axios.defaults.withCredentials = true;
        if (authData.login == selectedChatRoomOrContact.roomObj.owner)
        {
            notify("you're the room's owner!, you can't exit your own room!!")

            return ;
        }
        axios.post("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/leaveRoom", { cid: selectedChatRoomOrContact.roomObj.cid }).then((res) => {
            notify(`you left the chat room ${selectedChatRoomOrContact.name} `)
            socket.emit("updateRooms", { roomCid: selectedChatRoomOrContact.roomObj.cid });
            socket.emit("memberLeft", {roomCid: selectedChatRoomOrContact.roomObj.cid})
            navigate(0);
        }).catch((e) => {
            notify(e)
        })
    }
    // (() => {
          return (
        <div className=' flex flex-col justify-center items-center p-2 w-full'>
          <button onClick={leaveRoom} className='flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3'>Leave Room</button>
          <button onClick={() => {props.setWhichInterface("MainMenu")}} className='flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3'>go back to main menu</button>

          <h1 className={` text-blue-600  ttxt-xl ${isAdmin} `}>Admin settings:</h1>
          <button onClick={() => {
            props.setWhichInterface("AddMembers")
          }} className={` ${isAdmin} flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3`}>Add Member/s</button>
          <button onClick={() => {
            props.setWhichInterface("ManageMembers")
          }} className={` ${isAdmin} flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3`}>Manage Members</button>

          <h1  className={`text-blue-600  text-xl ${isOwner} `}>Owner settings:</h1>
          <button onClick={() => {
            props.setWhichInterface("PasswordSettings") 
          }} className={`flex-none ${isOwner} inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3`}>Password settings</button>
      </div>
  )
    //   })()
}
 
