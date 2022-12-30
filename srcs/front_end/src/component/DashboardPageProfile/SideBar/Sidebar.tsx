import './sideBar.css'
import { useNavigate } from 'react-router-dom'
import { SideBareData } from '../Data/Data'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { isAuthenticated } from '../../../api/task.api'

const Sidebar = () => {
    const navigate = useNavigate();
    let userToFind: string;
    const handle = async (e: any) => {
        userToFind = e.target.value;
        await isAuthenticated()
            .then(({data}) => {
                if(data.nickname === userToFind || data.login === userToFind)
                    userToFind = '';    
            })
    }
    
    const submit = async(e: any) => {
        e.preventDefault();
        await axios.get("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/auth/user/" + userToFind,
            { withCredentials: true})
            .then(({data}) => {
                navigate('/user/'+ data.login, {replace: true});
                navigate(0); 
            });
    }
    
    return (
    <div className="sidebar">
        <form onSubmit={(e) => submit(e)} className='searchForm' role="search">
            <label className= 'searchLabel' htmlFor="search">Search for stuff</label>
            <input onChange={(e) => handle(e) }className= 'searchInput' id="search" type="search" placeholder="Search..." autoFocus required />
            <button className= 'searchButton' type="submit">Go</button>    
        </form>
    <div className="menu">
        {SideBareData.map((item, index) => {
            return(
                <div className='menuItem active'>
                    <div className='iconPos'>
                        <item.icon/>
                    </div>
                    <Link to = {item.link}>
                    <span className='pos'>
                        {item.heading}
                    </span>
                    </Link>
                </div>
            )
        })}
    </div>
   </div>
  )
}

export default Sidebar