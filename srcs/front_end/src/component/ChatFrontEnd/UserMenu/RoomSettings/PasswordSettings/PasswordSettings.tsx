import axios from 'axios'
import React, { useContext } from 'react'
import { GlobalContext } from '../../../Chat'
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';




export default function PasswordSettings(props: any) {
    const { rooms, setRooms, authData, users, setSelectedChatRoomOrContact, selectedChatRoomOrContact , setRoomsAndContacts, notify, roomsAndContacts, setconversationsList} = useContext(GlobalContext)
    let room_type = ""
    if (selectedChatRoomOrContact.roomType == "public")
        room_type = "public"
    let is_public_buttons_shown = room_type == "public"? "hidden": ""
    
    const [ppp, SetPpp] = useState(selectedChatRoomOrContact.roomType);
    const [password, SetPw] = useState(selectedChatRoomOrContact.password);
    const [pwcompt, SetComptPw] = useState(0);
    const [publicompt, SetComptPub] = useState(0);
    const [privatecompt, SetComptPri] = useState(0);
    const [protectedcompt, SetComptProt] = useState(0);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    const navigate = useNavigate();
      
    return (
        <div className='w-full h-full flex flex-col pt-56	'>
            <h1 className=' self-center text-white mt-72  text-xl'>the room is <span className="text-purple-800 text-2xl	 font-bold">{selectedChatRoomOrContact.roomType}</span></h1>
            <h1 className=' self-center text-white mt-0  text-xl'>do you want to turn it into: </h1>
            <div className='self-center flex flex-row'>
                <button onClick={(event:any) => {event.preventDefault(); SetComptPub((publicompt + 1) % 10); ((publicompt % 2) == 0) ? SetPpp("public") : SetPpp(selectedChatRoomOrContact.roomType); SetComptPri(0); SetComptProt(0); SetComptPw(0)}} className={` ${is_public_buttons_shown} ${(ppp=="public") ? "text-black" : "text-white"} flex-1 inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3`}>Public</button>
                <button onClick={(event:any) => {event.preventDefault(); SetComptPri((privatecompt + 1) % 10); ((privatecompt % 2) == 0) ? SetPpp("private") : SetPpp(selectedChatRoomOrContact.roomType); SetComptProt(0); SetComptPub(0); SetComptPw(0)}} className={`${selectedChatRoomOrContact.roomType == "private" ? "hidden" : ""} ${(ppp=="private") ? "text-black" : "text-white"} flex-1 inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3`}>Private</button>
                <button onClick={(event:any) => {event.preventDefault(); SetComptProt((protectedcompt + 1) % 10);((protectedcompt % 2) == 0) ? SetPpp("protected") : SetPpp(selectedChatRoomOrContact.roomType); SetComptPri(0); SetComptPub(0); SetComptPw(1);}} className={`${selectedChatRoomOrContact.roomType == "protected" ? "hidden" : ""} ${(ppp=="protected") ? "text-black" : "text-white"} flex-1 inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-6/6 p-3 m-3`}>Protected</button>
            </div>
            <h1 className={` self-center text-white mt-0 ${(ppp != selectedChatRoomOrContact.roomType) ? "hidden" : ""} text-xl ${selectedChatRoomOrContact.roomType == "protected" ? "" : "hidden"}`}>or maybe update the password: </h1>
            <button onClick={(event:any) => {event.preventDefault(); SetComptPw((pwcompt + 1) % 10)}} className={`${selectedChatRoomOrContact.roomType == "protected" ? "" : "hidden"} ${(ppp != selectedChatRoomOrContact.roomType) ? "hidden" : ""} ${(pwcompt % 2 == 1) ? "text-black" : ""} flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-2/6 p-3 ml-auto mr-auto`}>Change Password</button>
            <input onChange={(event:any) => {event.preventDefault(); SetPw(event.target.value);}} placeholder='password' className={`${((ppp != "protected") || pwcompt % 2 == 0) ? "hidden" : ""} placeholder-gray-600 text-lg text-gray-900 bg-gray-400 border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg flex-none ml-auto mr-auto w-3/4 mt-3 mb-3`} ></input>
            <button onClick={() => {
                if (ppp == "protected" && !password)
                notify("password empty")
                else
                {
                    axios.post("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/changeRoomState", {initState: selectedChatRoomOrContact.roomType, finalState: ppp, password: password, cid: selectedChatRoomOrContact.roomObj.cid})
                    .then(()=> {
                        notify("state changed!")
                        navigate(0);
                    })
                    .catch((e) => {
                        // alert(ppp)
                        // notify(e)
                    })
                }
            }} className={`flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-2/6 p-3 mt-3 ml-auto mr-auto`}>Validate</button>
            <button  onClick={() => { props.setWhichInterface("room settings")}}  className={`${selectedChatRoomOrContact.roomType == "protected" ? "mt-3" : ""} flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 mt-3 ml-auto mr-auto`}> room settings</button>
        </div>
    )
}