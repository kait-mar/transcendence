import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../Chat";
import addUserLogo from "./add-user-2-32.png";
import addUserLogoBlue from "./add-user-2-32 blue.png";

function MemberToAddButton(props: any) {
  const {
    authData,
    users,
    socket,
    roomsAndContacts,
    setRoomsAndContacts,
    conversationsList,
    setconversationsList,
    selectedChatRoomOrContact,
    setSelectedChatRoomOrContact,
  } = useContext(GlobalContext);
  const [isaddLogoBlue, setIsaddLogoBlue] = useState(false);


const getLatestRooms = async () => {
    let crD = await axios.get(
      "http://" +
	  process.env.REACT_APP_IP_ADDRESS +
        ":3000/chat/GetContactsAndRooms",
      { params: { login: authData?.login } }
    );
    setRoomsAndContacts(crD.data);
    setSelectedChatRoomOrContact(crD.data.find((elm:any)=> elm.roomObj.cid == selectedChatRoomOrContact.roomObj.cid))
  };

  return (
    <img
      onMouseEnter={() => {
        setIsaddLogoBlue(true);
      }}
      onMouseLeave={() => {
        setIsaddLogoBlue(false);
      }}
      onClick={() => {
        axios
          .post(
            "http://" +
			process.env.REACT_APP_IP_ADDRESS +
              ":3000/chat/addMember",
            {
              cid: selectedChatRoomOrContact.roomObj.cid,
              members: [props.user.login],
            }
          )
          .then((res) => {
            
            // getLatestMembers()
            getLatestRooms()
            // socket.emit("addMember", {cid: selectedChatRoomOrContact.roomObj.cid, login: props.user.login})
            // alert(":) " + JSON.stringify(selectedChatRoomOrContact.roomObj.members.map((elem:any) => elem.login)))
          })
          .catch((Error) => {
            alert(Error);
          });
      }}
      className="ml-auto mt-auto mb-auto cursor-pointer h-10"
      src={isaddLogoBlue ? addUserLogoBlue : addUserLogo}
    />
  );
}

export default function AddMembers(props: any) {
  const { authData, users, selectedChatRoomOrContact,
    setSelectedChatRoomOrContact,
    setRoomsAndContacts,

   } =
    useContext(GlobalContext); 
  const [isaddLogoBlue, setIsaddLogoBlue] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  // const [members, setMembers] = useState<any>(selectedChatRoomOrContact.roomObj.members.map((elm:any) => elm.login))

  useEffect(() => {
  }, [])


  const getLatestRooms = async () => {
    let crD = await axios.get(
      "http://" +
	  process.env.REACT_APP_IP_ADDRESS +
        ":3000/chat/GetContactsAndRooms",
      { params: { login: authData?.login } }
    );
    setRoomsAndContacts(crD.data);
    setSelectedChatRoomOrContact(crD.data.find((elm:any)=> elm.roomObj.cid == selectedChatRoomOrContact.roomObj.cid))
  };

  // useEffect(() => {
  //   getLatestRooms()
  //   alert(selectedChatRoomOrContact.roomObj.members.map((e:any) => e.login))
  // },[selectedChatRoomOrContact.roomObj.members])

  const usrs = users
    // .filter((user:any) => members.length)
    .filter((user:any) => {
      return !(selectedChatRoomOrContact.roomObj.members.find((member:any) => user.login == member.login)) && selectedChatRoomOrContact.roomObj.members.length})
    // .filter((user: any) => {
    //   return (
    //     members.find((member: any) => {
    //       return member.login != user.login && member.login != authData.login;
    //     }) && user.login.startsWith(searchInput)
    //   );
    // })
    .map((user: any, index: number) => {
      return (
        <li
          key={index}
          className="border h-16 border-gray-800 text-white bg-whathsapp_uns bg-opacity-60 list-none rounded-sm p-0   flex flex-row"
        >
          <h1 className="text-white mt-auto mb-auto ml-7   text-xl ">
            {/* {user} */}
            {user.nickName? user.nickName: user.login}
          </h1>
          <MemberToAddButton    user={user} />
        </li>
      );
    });

  return (
    <div className="w-full flex flex-col justify-items-center items-center">
      <input
        onChange={(e) => setSearchInput(e.target.value)}
        className=" p-3 w-3/4 m-1 text-lg bg-opacity-30 text-white bg-black border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg"
        placeholder="enter login"
      ></input>
      <ul className="h-full w-full overflow-auto flex-1">{usrs}</ul>
      <button
        onClick={() => {
          props.setWhichInterface("room settings");
        }}
        className="flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3"
      >
        room settings
      </button>
    </div>
  );
}
