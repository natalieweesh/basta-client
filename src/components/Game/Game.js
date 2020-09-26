import React, { useState, useEffect, useRef } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client'
import Rules from '../Rules/Rules';
import TextContainer from '../TextContainer/TextContainer';
import './Game.css';

let socket;

const Game = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [prevmessages, setPrevMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentGame, setCurrentGame] = useState([]);
  const [finishedGame, setFinishedGame] = useState(false)
  const [poop, setPoop] = useState(false);
  const [letter, setLetter] = useState('');
  const [modal, setModal] = useState('');

  // TODO: change this for prod / dev
  // const ENDPOINT = 'localhost:5000';
  const ENDPOINT = 'https://basta-game.herokuapp.com/';

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setName(name.trim().toLowerCase());
    setRoom(room.trim().toLowerCase());

    socket.emit('join', { name, room }, ((e) => {
      if (e) {
        window.location.href='/';
        alert(e)
      }
    }));

    return () => {
      socket.emit('disconnect');

      socket.off();
    }

  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.off('roomData').on('roomData', ({ users }) => {
      // console.log('Room Data', users)
      setUsers(users);
    })
    socket.off('gameStatus').on('gameStatus', ({ game }) => {
      if (game && game.letter !== letter) {
        setLetter(letter);
      }

     if (currentGame.length === 0 && !!game) {
      //  console.log('currentGame', game)
        setCurrentGame(game);
        setFinishedGame(game.finishedGame)
      }
    })
    socket.off('gameRestarted').on('gameRestarted', ({ users }) => {
      setFinishedGame(false)
      setUsers(users);
      setCurrentGame([])
    }
 )}, [])

  useEffect(() => {
    socket.off('disconnect').on('disconnect', () => {
      setPoop(true);
      const reconnectFrontEnd = () => {
        const { name, room } = queryString.parse(location.search);
        socket.connect()
        socket.emit('frontEndReconnect', {name, room}, () => {
        })
        socket.emit('join', { name, room }, ((e) => {
          if (e) {
            window.location.href='/';
            alert(e)
          }
        }));
        document.removeEventListener('click', reconnectFrontEnd)
        document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
      }
      document.addEventListener('click', reconnectFrontEnd)

      const reconnectFrontEndVisible = () => {
        const { name, room } = queryString.parse(location.search);
        if (document.visibilityState && document.visibilityState === 'visible') {
          socket.connect()
          socket.emit('frontEndReconnect', {name, room}, () => {
          })
          socket.emit('join', { name, room }, ((e) => {
            if (e) {
              window.location.href='/';
              alert(e)
            }
            document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
          })); 
          document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
          document.removeEventListener('click', reconnectFrontEnd)
        }
      }
      document.addEventListener('visibilitychange', reconnectFrontEndVisible)
    })
  })
  useEffect(() => {
    socket.off('startGame').on('startGame', ({ users }) => {
      socket.emit('initiateGame', () => {
        socket.emit('fetchGame', () => {
        })
      })
    })
  }, [currentGame, setCurrentGame])


  const updateUserStatus = (event) => {
    event.preventDefault();

    socket.emit('setReadyToPlay', () => {
    })
  }

  const userRestart = (event) => {
    event.preventDefault();

    socket.emit('setReadyToRestart', () => {
    })
  }

  const user = users.find((user) => user.name === name);

  return (
    <div className={`player-${user?.orderIndex} outerContainer ${currentGame.finishedGame && 'revealAll'} ${!currentGame.split && 'notSplit'}`}>
      <div className="topPart">
      <div className="sideContainer">
        {poop ? <div className="modal"><div className="attentionModal">Hey! Pay attention to the game!<button className="button" onClick={() => {setPoop(false)}}>Ok</button></div></div> : null}
        <div className="users-list">          {(currentGame.length === 0 || finishedGame) && <TextContainer users={users} user={user} game={currentGame} finishedGame={finishedGame} />}
          {currentGame.length === 0 && users.length > 1 && <button className="startButton" disabled={user?.readyToPlay} onClick={updateUserStatus}>{user?.readyToPlay ? 'Waiting for other players' : 'Ready to play!'}</button>}
          {finishedGame && <div><button className="startButton" disabled={user?.readyToRestart} onClick={userRestart}>{user?.readyToRestart ? 'Waiting for other players' : 'Play again!'}</button></div>}
        </div>
        {currentGame.length !== 0 && !finishedGame && <>
          <p>Pick a letter to start! 👉👉👉</p>
          <input className="letterInput" type="text" value={currentGame.letter} onChange={(e) => {
            console.log(e.target.value)
            socket.emit('changeLetter', {letter: e.target.value}, () => {
              console.log('donezo')
            })
          }}/>
          </>
        }
        <button className="rulesButton" onClick={() => setModal('rules')}>🤓 Check the rule book 🤓</button>
        {modal && <div className="modal">
          <button className="button closeModal" onClick={(e) => {
            e.preventDefault();
            setModal('');
          }}>X</button>
          {modal === 'rules' && <Rules />}
          
        </div>}
      </div>
        <div className="rightTopSquare instructions">
        {
          currentGame && currentGame.scores && <>
            <p className="bold">🤗 Scoreboard! 🤗</p>
            {currentGame.scores.map((score, i) => {
              return <div><label>{users[i]['name']}: &nbsp;</label><input onChange={(e) => {
                socket.emit('updateScore', {userId: i, score: e.target.value}, () => {})
              }} type="number" value={score}/></div>
            })}
          </>}
        </div>
      </div>
      
      {currentGame.length !== 0 && currentGame.finishedGame && (
        <div>
        <table>
        <tr><td>🙋‍♀️ Player 🙋‍♂️</td><td>🔠 Letra 🔡</td><td>🦓 Animal 🐕</td><td>🧦 Cosa 🛵</td><td>🌮 Comida 🍩</td><td>🤾‍♀️ Acción 🏃‍♂️</td><td>🗼 Lugar 🏘</td><td> 💸Puntas 💸</td></tr>
          {currentGame.answers.map((ans, i) => {
            return <tr>
            <td>{users.find((u) => u.orderIndex === i).name}</td>
            <td>{currentGame.letter.toUpperCase()}</td>
              {ans.map((a) => {
                return <td>{a}</td>
              })}
              <td>{currentGame.scoreTabulation[i]}</td>

            </tr>
          })}
        </table>
        </div>
      )}

      {currentGame.length !== 0 && !currentGame.finishedGame && (
        <div>
          <table>
            <tr><td>🔠 Letra 🔡</td><td>🦓 Animal 🐕</td><td>🧦 Cosa 🛵</td><td>🌮 Comida 🍩</td><td>🤾‍♀️ Acción 🏃‍♂️</td><td>🗼 Lugar 🏘</td></tr>
            {currentGame.previousAnswers.length > 0 && 
              currentGame.previousAnswers.map((ans, i) => {
                return <tr>
                <td>{currentGame.previousLetters[i]}</td>
                {[0,1,2,3,4].map((n) => {
                  return <td>{ans[user.orderIndex][n]}</td>
                })}
                </tr>
              })
            }
            <tr>
              <td><p>{currentGame.letter}</p></td>
              {[0, 1, 2, 3, 4].map((n) => {
                return <td><input type="text" value={currentGame.answers[user.orderIndex][n]} onChange={(e) => {
                  socket.emit('updateAnswer', {userIndex: user.orderIndex, categoryIndex: n, text: e.target.value})
                }} /></td>
              })}
            </tr>
            <tr className="lastRow">
              <td></td><td></td><td></td><td></td><td></td>
              <td>
                <button className="endGame" onClick={() => {
                  const endIt = window.confirm('Are you sure you\'re done?');
                  if (endIt) {
                    socket.emit('endGame', () => {
                      // console.log('now show all tiles')
                    })
                  }
                }}>¡BASTA!</button>
              </td>
            </tr>
          </table>
        </div>
      )}
    </div>
  )   
}

export default Game;