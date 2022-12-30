import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { json } from "stream/consumers";
import { isAuthenticated } from "../../../api/task.api";
import { GlobalContext } from "../Chat";

export default function ChatPrompt() {
  const { authData, socket, selectedChatRoomOrContact, isContactBlock, messages, setMessages, setconversationsList } =
    useContext(GlobalContext);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [isPromptBlock, setIsPromptBlock] = useState(false);
  const [isMute, setIsMute] = useState(false)
  const [isBan, setIsBan] = useState(false)
  const [mutedMembers, setMutedMembers] = useState<any[]>([]);


  const getMutedMembers = async () => {
    if (!selectedChatRoomOrContact)
    return ;
    let MuteMembers = await axios.get(
      "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/mutedUsers",
      { params: { cid: selectedChatRoomOrContact.roomObj.cid } }
    );

    if (
      MuteMembers.data.find((mem:any) => {
            return (
              mem.roomId == selectedChatRoomOrContact.roomObj.cid &&
              mem.login == authData.table_id
            );
          })
        )
        setIsMute(true)
    else
    setIsMute(false);
    // setMutedMembers(MuteMembers.data);
  };
  
  const hideifBanned = async () => {
    // alert("bro")

    if (!selectedChatRoomOrContact)
    return ; 
    let BlockedMembers = await axios.get(
      "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/bannedUsers",
      { params: { cid: selectedChatRoomOrContact.roomObj.cid } }
    );
    if (
      BlockedMembers.data.find((mem:any) => {
        return (
          mem.table_id == authData.table_id
        );
      }) 
    )
    {
    setIsBan(true);
    }
    else
    {
      setIsBan(false); 
    }
  }
  // if (socket && selectedChatRoomOrContact)
  // socket.once("updateMuteMembers", (res:any) => {
    
  //   // alert(res.cid + " |||| " + selectedChatRoomOrContact.roomObj.cid)
  //   if (res.cid == selectedChatRoomOrContact.roomObj.cid) {
  //     // alert("awili")
  //     getMutedMembers()
  //   }
  // }) 
  
  // useEffect(() => {
    if (selectedChatRoomOrContact && socket)
    {
      socket.on("updateMuteMembers", (res:any) => {
        if (res.cid == selectedChatRoomOrContact.roomObj.cid)
          getMutedMembers();
      }) 

      socket.on("banUser", (res:any) => {
        if (res.cid == selectedChatRoomOrContact.roomObj.cid && res.login == authData.login)
        {
          hideifBanned();
        }
      })
  }
  // } ,[socket])

  useEffect(() => {
   if (selectedChatRoomOrContact) 
   getMutedMembers()

      } ,[selectedChatRoomOrContact])

  const updateBlockStatus = async () => {
    if (selectedChatRoomOrContact?.roomObj) {


      let blockedUsersData = await axios.get(
        "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/friend/BlockedByWho"
      );
      let blockedUsers = blockedUsersData.data;


        if (
          !blockedUsers.length ||
          !blockedUsers.find(
            (usr: any) =>
              usr.blockedUser.login == selectedChatRoomOrContact.alteredName
          )
        ) {
          setIsPromptBlock(false);
        } else {
          setIsPromptBlock(true);
        }
    }
  };
  useEffect(() => {
    updateBlockStatus();
    getMutedMembers();
    hideifBanned();

  });

  const submit_message = (e: any) => {
    if (e.key == "Enter") {
      e.preventDefault();
     
      isAuthenticated()
        .then(({ data }) => {
          socket.emit("msgToServer", {
            room: selectedChatRoomOrContact.roomObj.cid,
            message: textAreaValue,
          });

          // socket.broadcast.to(selectedChatRoomOrContact.roomObj.cid).emit("msgToServer", {
          //   room: selectedChatRoomOrContact.roomObj.cid,
          //   message: textAreaValue,
          // });

          setMessages((prevstate:any) => [...prevstate, {
            text: textAreaValue,
            date: Date(),
            me: true,
            ownerId: authData.table_id ,
            nickName: authData.nickName,
          }]);
          // socket.emit("messageSent", { login: authData.login, roomCid:selectedChatRoomOrContact.roomObj.cid});
          setTextAreaValue("");
          // socket.emit("updateRooms", {
          //   roomCid: selectedChatRoomOrContact.roomObj.cid,
          //   login: authData.login
          // });
        })
        .catch((err) => alert(err));
    }
  };
  const handle_change = (e: any) => {
    setTextAreaValue(e.target.value);
  };

  return (
    <div
      className={` ${
        selectedChatRoomOrContact ? "" : "hidden"
      } bg-black flex-1 flex flex-row border shadow-md  shadow-purple-500/50    border-purple-500 ${
        isPromptBlock ? "hidden" : ""
      } ${isMute? "hidden": ""}  ${isBan? "hidden": ""} `}
    >
      <textarea
        onKeyDown={submit_message}
        value={textAreaValue}
        onChange={handle_change}
        id="message"
        className="block p-2.5 w-full text-sm text-white bg-black require      placeholder-gray-400 dark:text-white   resize-none outline-none"
        placeholder="Your message..."
      ></textarea>
    </div>
  );
}
