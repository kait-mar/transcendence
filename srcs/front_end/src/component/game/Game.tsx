import NavBar from '../ConnectedPage/navBar/NavBar';
import GameBoard from './GameBoard' ;

export default function Game() {
  return (
    <div className='gradient__bg'>
        <NavBar/>
        <GameBoard/>
    </div>
  );
}
