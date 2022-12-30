import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import './Table.css'
import { isAuthenticated } from '../../../api/task.api';


function createData(
  name: string,
  score: number,
  level: number,
  xp: number,
  status: string,
) {
  return { name, score, level, xp, status };
}


interface ofOpponent{
  opponent:string,
  opponent_score: number,
  opponent_level: number,
  status: string,
}


function returnOpponentInfo(name:ofOpponent[]){
    let i: number = name.length - 1;
    let count: number = 5;
    const objArr: {opponent:string, score:number, level:number, status: string}[] = [];
    while (i >= 0 && count != 0)
    {
      objArr.push({opponent : name[i].opponent, score: name[i].opponent_score, level: name[i].opponent_level, status : name[i].status});
      count--;
      i--;
    }
    return (objArr);
}

const makeStyles = (status: string) => {
  if (status === "Winner")
  {
    return ({
       background: 'rgb(145 254 159/ 47%)',
       color: 'green'
    }
    );
  }
  else if (status === 'Lost')
  {  return ({
       background: '#ffadad8f',
       color: 'red'
    }
    );

  }
}
export default function BasicTable() {
  const [opponent, setOpponent] = React.useState([]);

  const [status, setStatus] = React.useState([]);

  React.useEffect(() => {
    isAuthenticated()
    .then(({data}) => {
      setOpponent(data.opponent);
     
    })
  },[])

  

  const rows = returnOpponentInfo(opponent);

  return (
    <div className="Table">
        <h3>Match History</h3>
        <TableContainer component={Paper}
          style={{boxShadow:'0px 13px 20px 0px #80808029'}}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Oppenent </TableCell>
                <TableCell align="left">Score</TableCell>
                <TableCell align="left">Level</TableCell>
                <TableCell align="left">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.opponent}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component = {"th" as React.ElementType <  React.ThHTMLAttributes<HTMLTableCellElement> &
  React.TdHTMLAttributes<HTMLTableCellElement> >}scope="row">
                    {row.opponent}
                  </TableCell>
                  <TableCell align="left">{row.score}</TableCell>
                  <TableCell align="left">{row.level}</TableCell>
                  <TableCell align="left">
                    <span className='status' style= {makeStyles(row.status)}>{row.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
    </div>
  );
}
