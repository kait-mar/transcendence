
import './RightSide.css'
import Friends from "../Update/Update";
 
// interface Props {
//      socket: Socket<DefaultEventsMap, DefaultEventsMap>
// }

const RightSide = () =>{

    return(

        <div className="RightSide">
      <div>
        <h3>Friends</h3>
      <Friends />
      </div>
      </div>
    )
}


export default RightSide;