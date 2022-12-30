
import React, { useEffect, useState } from "react";
import './RightSide.css'
import Friends from "../Update/Update";
import axios from "axios";
import { isAuthenticated } from "../../../api/task.api";
 

const RightSide = () =>{
  const[friendRequest, setFriendRequest] = useState('');
  const[currentUser, setCurrent] = useState('');
  const[send, setSend] = useState(false); 
  const[friendStatus, setFriendStatus] = useState(false);

  useEffect(() => {
    axios.get('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/friend/friendRequest', {
      withCredentials: true,
    }).then(({data}) => {
      setFriendRequest(data);
      setSend(true);
    }).catch((err) => { setSend(false)})
  },[friendRequest])

const submitAccept = async(e: any) => {
    e.preventDefault();
   await isAuthenticated()
    .then(({data}) => {
      setCurrent(data.login);
    })
   await axios.post('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/friend/friendResponse', 
   {
        friendStatus: "accepted",
        user : currentUser,
        sender : friendRequest
    },
    {
      withCredentials: true,
    })
    .then(res => {
      setFriendStatus(true);
    })
    .catch(err => {
      const sent = document.getElementById('error');
      sent!.style.display = "block";
    });
  }

  const submitDeclined = async(e: any) => {
    e.preventDefault();
   await isAuthenticated()
    .then(({data}) => {
      setCurrent(data.login);
    })
   await axios.post('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/friend/declined',{
        friendStatus: 'declined',
        user: currentUser,
        sender: friendRequest,
    }, {
      withCredentials: true,
    })
    .then(res => {
      setFriendStatus(true) ;
    })
    .catch(err => {
    });
  }

  function requestFriend()
  {
    if (send === true && friendStatus === false)
    {
      return (
    <div className="column">
      <div className="friend-request-card">
          <div className="profile-picture">
            <img src="" />
          </div>
            <div className="user-details">
             <h1>{friendRequest}</h1>
            </div>
          <div className="friend-request-actions">
        <button className="button button-primary" onClick={(e)=>submitAccept(e)}>Accept</button>
        <button className="button button-secondary" onClick={(e)=>submitDeclined(e)}  >Decline</button>
        </div>
      </div>
    </div>
      )
    }
  }
    return(
        <div className="RightSide">
      <div>
        <h3>Friends</h3>
        <Friends />
      </div>
        {requestFriend()} 
      </div>
    )
}


export default RightSide;