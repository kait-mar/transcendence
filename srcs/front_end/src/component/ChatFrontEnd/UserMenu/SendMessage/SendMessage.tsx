import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlobalContext } from "../../Chat";
import EnterPasswordWindow from "../../EnterPasswordWindow/EnterPasswordWindow";

export default function SendMessage(props: any) {
  //   const [contactsAndRooms, setContactsAndRooms] = useState([]);
  const {
    authData,
    users,
    setSelectedChatRoom,
    selectedChatRoom,
    roomsAndContacts,
    setRoomsAndContacts,
    setSelectedChatRoomOrContact,
    selectedChatRoomOrContact,
    setlastSelectedChatRoomOrContact,
    socket,
  } = useContext(GlobalContext);
  const [searchInput, setSearchInput] = useState("");
  const [isPassowrdPromptWindowOn, setIsPassowrdPromptWindowOn] =
    useState(false);
    
    useEffect(() => {
     
      
      socket.on("roomUpdated", async (res: any) => {
        // alert("ok")
        // if (res.roomCid != selectedChatRoomOrContact.roomObj.cid)
          // return ;
        if (res.login != authData.login)
          return
        let crD = await axios.get(
          "http://" +
          process.env.REACT_APP_IP_ADDRESS +
          ":3000/chat/GetContactOrRoomByCid",
          { params: { login: authData.login, cid: res.roomCid } }
          );
          setlastSelectedChatRoomOrContact(selectedChatRoomOrContact)
          setSelectedChatRoomOrContact(crD.data);
          
          // setSelectedChatRoomOrContact();
        });
        
      }, [socket])
  // useEffect(() => {
  //   socket.on("memberLeft",(res: any) => {
      
  //   } )
  // }, [socket])


  // useEffect(() => {

  // }, [roomsAndContacts])

  const rooms_contacts = roomsAndContacts.length
    ? roomsAndContacts
        .filter((elem: any) => {
          return elem.alteredName.startsWith(searchInput);
        })
        .map((elem: any, index: number) => {
          return (
            <li
              onClick={() => {
                // socket.emit("promptPasswordOff", {
                // roomCid: selectedChatRoom.roomObj.cid,

              // });
                if (elem.roomType == "public") {
                    socket.emit("selectRoom", {login:authData.login, room:elem});
                    socket.emit("promptPasswordOff", {login: authData.login});                 
                  axios
                    .post(
                      "http://" +
					  	process.env.REACT_APP_IP_ADDRESS +
                        ":3000/chat/addMemberNoAdminCheck",
                      {
                        cid: elem.roomObj.cid,
                        members: [authData.login],
                      }
                    )
                    .then((res) => {
                      socket.emit("updateRoom", { roomCid: elem.roomObj.cid, login: authData.login });
                      // socket.emit("selectRoom", {login:authData.login, room:elem});
                    })
                    .catch((Error) => {
                      alert(`${Error}`);
                    });
                } else if (elem.roomType == "protected")
                {
                  socket.emit("selectRoom", {login:authData.login, room:elem});
                  // alert("ooo")
                  if (
                    !elem.roomObj.members.find(
                      (mem: any) => mem.login == authData.login
                    )
                  )
                    socket.emit("promptPasswordOn", {
                      login: authData.login,
                      roomId: elem.roomObj.cid,
                      roomName: elem.name,
                    });
                  else
                  {
                    socket.emit("selectRoom", {login:authData.login, room:elem});

                     socket.emit("updateRoom", { roomCid: elem.roomObj.cid, login: authData.login });}
                }
                else if (elem.roomType == "privategroup" || elem.roomType == 'private')
                {
                  // socket.emit("selectRoom", {login:authData.login, room:elem});
                  socket.emit("promptPasswordOff", {login: authData.login});
                  socket.emit("updateRoom", { roomCid: elem.roomObj.cid, login: authData.login });
                  socket.emit("selectRoom", {login:authData.login, room:elem});

                }
              }}
              key={index}
              className=" flex flex-row border text-xl pl-5 pt-3 h-16 border-gray-800 text-white bg-whathsapp_uns bg-opacity-60 list-none rounded-sm p-0 cursor-pointer hover:text-white hover:bg-whathsapp_selctd"
            >
              {elem.ContactNickName && elem.roomType == 'privategroup'? elem.ContactNickName:elem.alteredName}
              <p
                className={`ml-auto mr-4 ${
                  elem.roomType == "protected" ? "" : "hidden"
                } `}
              >
                {`${!elem.roomObj.members.find((mem: any) => mem.login == authData.login)? "🔒": "🔓"}`}
              </p>
              <p
                className={`ml-auto mr-4 ${
                  elem.roomType == "private" ? "" : "hidden"
                } `}
              >
                🅿️
              </p>
            </li>
          );
        })
    : [];

  return (
    <div className="w-full flex flex-col justify-items-center items-center">
      <input
        onChange={(e) => {
          setSearchInput(e.target.value);
          // alert(JSON.stringify(roomsAndContacts));
        }}
        className=" p-3 w-3/4 m-1 text-lg bg-opacity-30 text-white bg-black border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg"
        placeholder="enter login"
      ></input>
      <ul className="h-full w-full overflow-auto flex-1">{rooms_contacts}</ul>
      <button
        onClick={() => {
          props.setWhichInterface("MainMenu");
        }}
        className="flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3"
      >
        go back
      </button>
      <EnterPasswordWindow />
    </div>
  );
}
