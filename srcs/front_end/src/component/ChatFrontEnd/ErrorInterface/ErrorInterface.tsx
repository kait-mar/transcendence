import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlobalContext } from "../Chat";

export default function ErrorInterface(props: any) {
  const {
    authData,
    socket,
    socketAuth,
    selectedChatRoomOrContact,
    setconversationsList,
    isContactBlock,
    setIsContactBlock,
  } = useContext(GlobalContext);
  const [isErrorInterfaceBlock, setIsErrorInterfaceBlock] = useState(false);

  const checkIfBlocked = async () => {
   
    if (selectedChatRoomOrContact.roomType != "privategroup")
      setIsErrorInterfaceBlock(false);

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
    )
    setIsErrorInterfaceBlock(false);
    else
    {
        setIsErrorInterfaceBlock(true)
    }
  };

  useEffect(() => {
   
      if (selectedChatRoomOrContact)
        checkIfBlocked();
  }, [selectedChatRoomOrContact] );

  if (selectedChatRoomOrContact) {
    socketAuth.once("userBlocked", (res: any) => {
      if (
        (res.toBlock == authData.login &&
          res.blockedBy == selectedChatRoomOrContact.alteredName) ||
        (res.blockedBy == authData.login &&
          res.toBlock == selectedChatRoomOrContact.alteredName)
      )
        setIsErrorInterfaceBlock(true);
    });
    socketAuth.once("userUnBlocked", (res: any) => {
      if (
        (res.toBlock == authData.login &&
          res.blockedBy == selectedChatRoomOrContact.alteredName) ||
        (res.blockedBy == authData.login &&
          res.toBlock == selectedChatRoomOrContact.alteredName)
      )
        setIsErrorInterfaceBlock(false);
    });
  }

  return createPortal(
    <div>
      <div
        className={`flex h-1/3 flex-none w-1/3 bg-black bg-opacity-50 flex flex-col absolute top-1/2 left-1/2 translate-y-[-85%] translate-x-[-50%] ${
            isErrorInterfaceBlock ? "" : "hidden"
        } duration-[400ms]  z-5`}
      >
        <img className="" src={require("./blocked.gif")}></img>
      </div>
    </div>,
    document.getElementById("CnvsModal") as HTMLElement
  );
}
