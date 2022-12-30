import axios from "axios";
import React, { useContext, useState, useEffect,useCallback } from "react";
import { createPortal } from "react-dom";
import { GlobalContext } from "../Chat";
import { useRef } from 'react';


export default function EnterMuteWindow(props: any) {
  const {
    authData,
    users,
    setSelectedChatRoom,
    selectedChatRoom,
    roomsAndContacts,
    setRoomsAndContacts,
    setSelectedChatRoomOrContact,
    selectedChatRoomOrContact,
    socket,
    notify
  } = useContext(GlobalContext);
  const [isShown, setIsShown] = useState(false);
  const [roomCid, setRoomCid] = useState("");
  const [roomName, setRoomName] = useState("");
  const [minutes, setMinutes] = useState("");
  const inputRef = useRef(null);
  const [input, setInput] = useState('');


  const handleSubmit = (event:any) => {
    event.preventDefault();
    event.target.reset();
  }; 
  // const clearInput = () => {
  //   inputRef.current.value = '';
  // };
  useEffect(()=> {
    socket.on("promptMuteAmount", (res: any) => {
      if (
        res.login == authData.login &&
        res.memberTableId == props.user.table_id
      ) {
        setIsShown(true);
        setRoomCid(res.roomId);
        setRoomName(res.roomName);
      }
    });
    socket.on("promptPasswordOff", (res: any) => {
      if (res.login == authData.login) setIsShown(false);
    });

  }, [socket])
  
  

  return createPortal(
      <>
        <div className={` absolute top-0 left-0 z-[3] ${isShown? "": "hidden"} right-0 bottom-0 bg-black/40`} onClick={() => {
            setIsShown(false)
        }}></div>
    <div
      className={` ${
        isShown ? "" : "hidden"
      } flex h-1/3 flex-none w-1/3  bg-gray-900 bg-opacity-50 shadow-lg  shadow-purple-500/50 border-2 border-purple-500 flex flex-col absolute top-1/2 left-1/2 translate-y-[-85%] translate-x-[-50%]  duration-[400ms]  z-[3]`}
    >
      <form className=" flex flex-col justify-items-center	items-center w-full h-full" onSubmit={handleSubmit}>
        <input ref={inputRef}
          value= {input}
          onChange={(e: any) => {
            //   alert(props.user.table_id)
            // setMinutes(e.target.value);
            // e.preventdefault();
            // e.preventDefault()
            setInput(e.target.value);


          }}
          onKeyDown={async (e: any) => {
            const rEx = /^[0-9]+$/;
            if (e.key == "Enter") {
              // e.preventDefault();
              // socket.emit("")
              // append(e.target.value);
              // alert(props.userToMute)
              // alert("habibo")
              // alert(props.user.table_id)
            //   if (minutes.)
            if (rEx.test(input.toString()))
            {
              if (parseInt(input) > 60)
              {
                notify("you can't mute more than 60 minutes")
                setIsShown(false)
                return;
              }
              axios
                .post("http://" + process.env.REACT_APP_IP_ADDRESS + `:3000/chat/mute`, {
                  cid: selectedChatRoomOrContact.roomObj.cid,
                  uid: props.user.table_id,
                  minutes: Number(input),
                })
                .then((res) => {
                  socket.emit("updateMuteMembers", {cid: selectedChatRoomOrContact.roomObj.cid});
                  setIsShown(false);
                  setInput('')
                //setMinutes("");
                // inputRef?.current?.value = ''
                })
                .catch((Error) => {
                                        
                    notify(`user  already muted`);
                    setIsShown(false)
                });
            
            }
                else
                {
                    alert("minutes should be an int" + minutes)

                    setIsShown(false);
                    setInput('')
                    //setMinutes(""); 
                }
              e.preventDefault();
            }
          }}
          placeholder="Enter number of minutes to mute"
          className="placeholder-gray-600 m-2 text-lg text-gray-900 bg-gray-400 border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg flex-none w-3/4 mt-auto mb-auto"
        ></input>
        <button type="submit">mute</button>
      </form>
    </div>
    </>,
    document.getElementById("PasswordModal") as HTMLElement
  );
}
