// --- src/components/Game.js ---
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { StreamChat } from 'stream-chat';

import styled, { keyframes } from 'styled-components';

const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			}
		],
		"name": "GameEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "GameReset",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player1",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "player2",
				"type": "address"
			}
		],
		"name": "GameStarted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reactionTime",
				"type": "uint256"
			}
		],
		"name": "ReactionSubmitted",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "gameEnded",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "gameStarted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getGameStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player2",
				"type": "address"
			}
		],
		"name": "joinGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player1",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player1ReactionTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player2",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player2ReactionTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "resetGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "startGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "startTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_reactionTime",
				"type": "uint256"
			}
		],
		"name": "submitReactionTime",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const Input = styled.input`
  padding: 10px;
  margin: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 10px;
  font-size: 1.1em;
  cursor: pointer;
`;

const ResultsDisplay = styled.div`
  margin-top: 20px;
  font-size: 1.5em;
  text-align: center;
`;

const ReactionPrompt = styled.div`
  font-size: 2em;
  margin-bottom: 20px;
`;

const blink = keyframes`
  50% { opacity: 0; }
`;

const ReadyIndicator = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: red;
  margin-bottom: 20px;
  opacity: ${({ ready }) => (ready ? 1 : 0.5)};
  background-color: ${({ ready }) => (ready ? 'green' : 'red')};
`;

function Game() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [player1ReactionTime, setPlayer1ReactionTime] = useState(0);
    const [player2ReactionTime, setPlayer2ReactionTime] = useState(0);
    const [winner, setWinner] = useState(null);
    const [player2Address, setPlayer2Address] = useState('');
    const [reactionTime, setReactionTime] = useState(0);
    const [streamClient, setStreamClient] = useState(null);
    const [streamChannel, setStreamChannel] = useState(null);
    const [streamToken, setStreamToken] = useState(null);
    const [error, setError] = useState(null);
    const [joiningGame, setJoiningGame] = useState(false);
    const [startingGame, setStartingGame] = useState(false);
    const [isReacting, setIsReacting] = useState(false);
    const [resettingGame, setResettingGame] = useState(false);
    const [canReact, setCanReact] = useState(false);

    useEffect(() => {
        const initWeb3 = async () => {
            console.log('Initializing Web3...');
            if (window.ethereum) {
                try {
                    console.log('Requesting accounts...');
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    console.log('Accounts:', accounts);
                    console.log('Creating contract instance...');
                    const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
                    setContract(contractInstance);
                    console.log('Contract initialized:', contractInstance);
                } catch (err) {
                    setError('User denied account access');
                    console.error('Error during Web3 initialization:', err);
                }
            } else {
                setError('Please install MetaMask');
                console.error('No Ethereum provider found.');
            }
        };
        initWeb3();
    }, []);

    useEffect(() => {
        const fetchStreamToken = async () => {
            if (account) {
                try {
                    const response = await fetch(`/api/streamToken?userId=${account}`);
                    const data = await response.json();
                    setStreamToken(data.token);
                } catch (err) {
                    setError('Error fetching Stream token');
                    console.error('Error fetching Stream token', err);
                }
            }
        };
        fetchStreamToken();
    }, [account]);

    useEffect(() => {
        if (contract && account && streamToken) {
            const initStreamChat = async () => {
                const client = StreamChat.getInstance(streamApiKey);
                await client.connectUser({ id: account, name: account }, streamToken);
                const channel = client.channel('messaging', 'game-channel');
                await channel.watch();
                setStreamClient(client);
                setStreamChannel(channel);
            };
            initStreamChat();
        }
    }, [contract, account, streamToken]);

    useEffect(() => {
        if (contract && streamChannel) {
            const fetchGameStatus = async () => {
                try {
                    const status = await contract.methods.getGameStatus().call();
                    setGameStarted(status[0]);
                    setGameEnded(status[1]);
                    setStartTime(parseInt(status[2]) * 1000);
                    setPlayer1ReactionTime(parseInt(status[3]));
                    setPlayer2ReactionTime(parseInt(status[4]));
                    setWinner(status[5]);
                    setCanReact(status[0] && !status[1] && parseInt(status[2]) * 1000 <= Date.now());
                } catch (err) {
                    setError('Error fetching game status');
                    console.error('Error fetching game status', err);
                }
            };
            fetchGameStatus();
            const interval = setInterval(fetchGameStatus, 1000);
            return () => clearInterval(interval);

            contract.events.GameStarted().on('data', (event) => {
                streamChannel.sendMessage({ text: `Game started! ${event.returnValues.player1} vs ${event.returnValues.player2}` });
            });

            contract.events.ReactionSubmitted().on('data', (event) => {
                streamChannel.sendMessage({ text: `${event.returnValues.player} reacted! Time: ${event.returnValues.reactionTime}` });
                if (event.returnValues.player.toLowerCase() === account.toLowerCase()) {
                    setIsReacting(false);
                }
            });

            contract.events.GameEnded().on('data', (event) => {
                streamChannel.sendMessage({ text: `Game ended! Winner: ${event.returnValues.winner}` });
            });

            contract.events.GameReset().on('data', () => {
                console.log('Game Reset event received');
                setGameStarted(false);
                setGameEnded(false);
                setStartTime(0);
                setPlayer1ReactionTime(0);
                setPlayer2ReactionTime(0);
                setWinner(null);
                setReactionTime(0);
                setPlayer2Address('');
                setCanReact(false);
                streamChannel.sendMessage({ text: 'Game has been reset. Ready for a new round!' });
            });
        }
    }, [contract, streamChannel, account]);

    const handleJoinGame = async () => {
        if (!contract) {
            setError('Contract not initialized. Please wait...');
            return;
        }
        setJoiningGame(true);
        try {
            const gas = await contract.methods.joinGame(player2Address).estimateGas({ from: account });
            await contract.methods.joinGame(player2Address).send({ from: account, gas: gas });
        } catch (err) {
            setError('Error joining game');
            console.error('Error joining game', err);
        } finally {
            setJoiningGame(false);
        }
    };

    const handleStartGame = async () => {
        if (!contract) {
            setError('Contract not initialized. Please wait...');
            return;
        }
        setStartingGame(true);
        try {
            const gas = await contract.methods.startGame().estimateGas({ from: account });
            await contract.methods.startGame().send({ from: account, gas: gas });
        } catch (err) {
            setError('Error starting game');
            console.error('Error starting game', err);
        } finally {
            setStartingGame(false);
        }
    };

    const handleSubmitReaction = async () => {
        if (!contract || !gameStarted || gameEnded || !canReact || isReacting) {
            return;
        }
        setIsReacting(true);
        const currentTime = Date.now();
        setReactionTime(currentTime - startTime);
        try {
            const reactionTimeMs = currentTime - startTime;
            const gas = await contract.methods.submitReactionTime(reactionTimeMs).estimateGas({ from: account });
            await contract.methods.submitReactionTime(reactionTimeMs).send({ from: account, gas: gas });
        } catch (err) {
            setError('Error submitting reaction');
            console.error('Error submitting reaction', err);
            setIsReacting(false);
            setReactionTime(0);
        }
    };

    const handleResetGame = async () => {
        if (!contract || !gameEnded) {
            setError('Game not ended yet.');
            return;
        }
        setResettingGame(true);
        try {
            const gas = await contract.methods.resetGame().estimateGas({ from: account });
            await contract.methods.resetGame().send({ from: account, gas: gas });
        } catch (err) {
            setError('Error resetting game');
            console.error('Error resetting game', err);
        } finally {
            setResettingGame(false);
        }
    };

    return (
        <GameContainer>
            <h1>Decentralized Reaction Game</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!account ? (
                <p>Connecting to MetaMask...</p>
            ) : !contract ? (
                <p>Initializing contract...</p>
            ) : !gameStarted ? (
                <div>
                    <Input
                        type="text"
                        placeholder="Opponent's Wallet Address"
                        value={player2Address}
                        onChange={(e) => setPlayer2Address(e.target.value)}
                    />
                    <Button onClick={handleJoinGame} disabled={joiningGame}>
                        {joiningGame ? 'Joining...' : 'Join Game'}
                    </Button>
                    <Button onClick={handleStartGame} disabled={startingGame || !player2Address}>
                        {startingGame ? 'Starting...' : 'Start Game'}
                    </Button>
                </div>
            ) : !gameEnded ? (
                <div>
                    <ReactionPrompt>React when the indicator turns green!</ReactionPrompt>
                    <ReadyIndicator ready={canReact} />
                    <Button onClick={handleSubmitReaction} disabled={!canReact || isReacting}>
                        {isReacting ? 'Reacting...' : 'React!'}
                    </Button>
                    {isReacting && <p>Submitting reaction... {reactionTime > 0 ? `${reactionTime} ms` : ''} (awaiting confirmation)</p>}
                    {reactionTime > 0 && !isReacting && <p>Your reaction time: {reactionTime} ms (confirmed)</p>}
                </div>
            ) : (
                <ResultsDisplay>
                    <h2>Game Over!</h2>
                    {winner === account ? <p>You won!</p> : winner !== '0x0000000000000000000000000000000000000000' ? <p>Winner: {winner}</p> : <p>It's a tie!</p>}
                    <p>Your Reaction Time: {player1ReactionTime === 0 ? reactionTime : player1ReactionTime} ms</p>
                    {winner !== account && player2ReactionTime !== 0 && <p>Opponent's Reaction Time: {player2ReactionTime} ms</p>}
                    <Button onClick={handleResetGame} disabled={resettingGame}>
                        {resettingGame ? 'Resetting...' : 'Play Again'}
                    </Button>
                </ResultsDisplay>
            )}
        </GameContainer>
    );
}

export default Game;