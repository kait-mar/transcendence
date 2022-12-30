import axios from 'axios'


export const isAuthenticated = async() => await axios.get('http://'+process.env.REACT_APP_IP_ADDRESS +':3000/auth/status',{withCredentials: true})  ;
export const getQrcode = async () => await axios.get('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/auth/2fa', {
        withCredentials: true, responseType:'arraybuffer'});
export const isLoggedIn = async() => await axios.get('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/auth/logedIn', {withCredentials:true});
 export const friendRequestStatus = async() => await axios.get('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/friend/myFriends', {
      withCredentials:true,
    });