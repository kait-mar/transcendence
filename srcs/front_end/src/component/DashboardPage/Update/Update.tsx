
import React, { useEffect, useState } from "react";
import axios from "axios";
import './Update.css'
import {  isAuthenticated } from "../../../api/task.api";
import Image from "../../Image/Image";
import { io } from 'socket.io-client'
// import { useNavigate } from "react-router-dom";
import FriendLive from "./FriendLive";

export interface friendData {
  img: any;
  nickName:any;
  status: string
 }

 var status_socket: any

const Friends = () =>{
 
  // const [creator, setCreator] = useState(''); 
  // const [data, setData] = useState('');
  const [friends, setFriends] = useState<any>([]);
  const [user, setUser] = useState('')
  const [friendDataList, setFriendDataList] = useState<friendData[]>([])
  const [friendBox, setFriendBox] = useState([<div></div>])

  useEffect(() => {
    status_socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/status');
    return () => {
      status_socket?.emit('_disconnect'); 
    }
  }, [])


  useEffect(() => {
    isAuthenticated()
    .then(({data}) => {
      setUser(data.login);
      status_socket.emit('watcher_connected');

    })
  }, [])

  useEffect(() => {
    if (user === '' || friends.length === 0)
      return;
      const arr = addFriend(user)
      setFriendDataList(arr)
      setFriendBox(arr.map((update, pos) => {
        return(
          <div className="update" key={pos}>
            <Image url={update.img} alt=""/>
            <div className="noti">
              <div style={{marginBottom:'0.5rem'}}>
                <span>{update.nickName}</span>
                <span>{fetchStatus(update)}</span>
              </div>
            </div>
          </div>
          )
      }))
    }
    // eslint-disable-next-line
  , [friends, user])

  useEffect(() => {
    status_socket.on('status-change', (data: any) => {
      if (friendDataList.length > 0) {
        var elem = friendDataList.find(e => (e.nickName === data.user && e.status !== data.status))
        if (elem) {
          let newList = friendDataList
          newList[newList.indexOf(elem)].status = data.status
          setFriendDataList(newList)
          setFriendBox(newList.map((update, pos) => {
            return(
              <div className="update" key={pos}>
                <Image url={update.img} alt=""/>
                <div className="noti">
                  <div style={{marginBottom:'0.5rem'}}>
                    <span>{update.nickName}</span>
                    <span>{fetchStatus(update)}</span>
                    {isInGame(update) && <FriendLive nickName={update.nickName} /> }
                  </div>
                </div>
              </div>
              )
          }))
        }
      }
      })
  })


  const fetchStatus = (update: friendData) => {
    let status = friendDataList?.indexOf(update) !== -1
      ? friendDataList[friendDataList.indexOf(update)].status
      : "offline"
    status = update.status
    if (status === 'online')
      return("    ❇️")
    else if (status === 'ingame')
      return ("    🔵")
    return("    🔴")
  }

  const isInGame = (update: friendData) => {
    let status = friendDataList?.indexOf(update) !== -1
    ? friendDataList[friendDataList.indexOf(update)].status
    : "offline"
    status = update.status
    if (status === 'ingame')
      return true;
    return false;
  }


  useEffect(() => {
    const myFriends = async()=> {
      await axios.get('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/friend/myFriends', {
        withCredentials:true,
      })
      .then(({data}) => {
        setFriends(data);
      })
    }
    myFriends();
  }, [])

  let arrFriends : friendData[] = [];              
  const addFriend = (user: string):friendData[] => {
    let friend : friendData;
    if (arrFriends.length > 0)
    {
      arrFriends.splice(0, arrFriends.length);
      arrFriends.length = 0;
    }
    for (let i = 0; i < friends.length; i++)
    {
        if (friends[i]?.creator.login !== user && user !== '' )
          {
            friend = {
              img: friends[i]?.creator.avatar,
              nickName: friends[i]?.creator.nickName,
              status: "offline"
            }
            arrFriends.push(friend);
          }
          else if (friends[i].receiver.login !== user && user !== '')
          {
              friend = {
                img: friends[i]?.receiver.avatar,
                nickName: friends[i]?.receiver.nickName,
                status: "offline"
              }
              arrFriends.push(friend);
          }
    }
    return arrFriends;
  }

    return(
        <div className="Friends">
          {friendBox}
      </div>
    )
}


export default Friends;