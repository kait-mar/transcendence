import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlobalContext } from "../Chat";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';

export default function EnterPasswordWindow(props: any) {
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
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    socket.on("promptPasswordOn", (res: any) => {
      if (res.login == authData.login) {
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
      <form className=" flex flex-col justify-items-center	items-center w-full h-full">
        <input
          onChange={(e: any) => {
            setPassword(e.target.value);
          }}
          onKeyDown={(e: any) => {
            if (e.key == "Enter") {
              axios
                .post(
                  "http://" +
				  process.env.REACT_APP_IP_ADDRESS +
                    ":3000/chat/joinRoom",
                  {
                    roomId: roomCid,
                    password: password,
                  }
                )
                .then((res) => {
                  
                  setIsShown(false);
                  notify("room joined");
                  navigate(0);

                  
                })
                .catch((Error) => {
                  // toast.error('🦄 Wow so easy!', {
                  //   position: "top-right",
                  //   autoClose: 5000,
                  //   hideProgressBar: false,
                  //   closeOnClick: true,
                  //   pauseOnHover: true,
                  //   draggable: true,
                  //   progress: undefined,
                  //   theme: "light",
                  //   });
                  // alert(`${Error}`);
                  setIsShown(false);
                  
                  notify("wrong password!")
                });
                e.preventDefault();
              socket.emit("promptPasswordOff", {
                roomCid: selectedChatRoom.roomObj.cid,
              });
            }
          }}
          placeholder="Enter room Password to join"
          className="placeholder-gray-600 m-2 text-lg text-gray-900 bg-gray-400 border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg flex-none w-3/4 mt-auto mb-auto"
        ></input>
      </form>
      {/* <ToastContainer /> */}
    </div>
    </>,
    document.getElementById("PasswordModal") as HTMLElement
  );
}
