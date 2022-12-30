import {RiLiveFill} from 'react-icons/ri'
import { IconContext } from "react-icons";
import { useNavigate } from 'react-router-dom';
import './Update.css'

export default function (props: any) {
  const navigate = useNavigate();

    const watchLive = (user: string) => {
        navigate('/game', {
          state:{
              watched_user: user
          }
      })
      }
  return (
    <button className='liveGame'  onClick={() => {watchLive(props.nickName)}}>
        <IconContext.Provider value={{size:"3em"}} >
        < RiLiveFill />
        </IconContext.Provider>
      </button>
  )
}
