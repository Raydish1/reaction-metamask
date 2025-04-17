// --- src/components/Game.js ---
import React, { useState, useEffect , useRef } from 'react';
import Web3 from 'web3';
import { StreamChat } from 'stream-chat';
import sha256 from 'js-sha256'

import styled, { keyframes } from 'styled-components';

const contractABI = [
	{
		"inputs": [],
		"name": "acceptGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
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
		"inputs": [
			{
				"internalType": "address",
				"name": "_player2",
				"type": "address"
			}
		],
		"name": "joinGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player2",
				"type": "address"
			}
		],
		"name": "Player2Accepted",
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
		"name": "resetGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "startGame",
		"outputs": [],
		"stateMutability": "payable",
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
		"stateMutability": "payable",
		"type": "function"
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
			},
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
		"name": "player2Accepted",
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
    const [streamClient, setStreamClient] = useState(null);
    const [streamChannel, setStreamChannel] = useState(null);
    const [streamToken, setStreamToken] = useState(null);
    const [error, setError] = useState(null);
    const [opponentAddress, setOpponentAddress] = useState('');
    const [gameChannelId, setGameChannelId] = useState(null);
    const [isGameActive, setIsGameActive] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [myReactionTime, setMyReactionTime] = useState(0);
    const [opponentReactionTime, setOpponentReactionTime] = useState(0);
    const [gameResult, setGameResult] = useState(null);
    const [canReact, setCanReact] = useState(false);
    const [isReacting, setIsReacting] = useState(false);
    const reactionTimeout = useRef(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [pendingChallengeChannelId, setPendingChallengeChannelId] = useState(null);
    const [challengerAddress, setChallengerAddress] = useState(null);
    const [canStartGame, setCanStartGame] = useState(false); // New state for start button

    useEffect(() => {
        const initWeb3AndStream = async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    // Assuming contractABI is defined before this block
                    const contractInstance = new web3Instance.eth.Contract(
                        /* Your contractABI here */ [],
                        contractAddress
                    );
                    setContract(contractInstance);
                    await initStreamChat(accounts[0]);
                } catch (err) {
                    setError('User denied account access');
                    console.error('Error during Web3 initialization:', err);
                }
            } else {
                setError('Please install MetaMask');
                console.error('No Ethereum provider found.');
            }
        };

        const initStreamChat = async (currentAccount) => {
            if (streamApiKey && currentAccount && streamToken) {
                const client = StreamChat.getInstance(streamApiKey);
                await client.connectUser({ id: currentAccount, name: currentAccount }, streamToken);
                setStreamClient(client);
            }
        };

        const fetchStreamToken = async () => {
            if (account) {
                try {
                    const response = await fetch(`/api/streamToken?userId=${account}`);
                    const data = await response.json();
                    setStreamToken(data.token);
                    if (streamClient) {
                        await streamClient.disconnectUser();
                        await streamClient.connectUser({ id: account, name: account }, data.token);
                    }
                } catch (err) {
                    setError('Error fetching Stream token');
                    console.error('Error fetching Stream token', err);
                }
            }
        };

        initWeb3AndStream();
        if (account) {
            fetchStreamToken();
        }
    }, [account, streamApiKey, streamToken]);

    useEffect(() => {
        let channelInstance = null;

        if (streamClient && gameChannelId) {
            channelInstance = streamClient.channel('messaging', gameChannelId);
            setStreamChannel(channelInstance);

            const fetchChannelHistory = async () => {
                try {
                    const result = await channelInstance.query({ messages: {} });
                    if (result && result.messages) {
                        setMessages(result.messages);
                    }
                } catch (error) {
                    console.error('Error fetching channel history:', error);
                    setError('Failed to load chat history.');
                }
            };

            channelInstance.watch().then(() => {
                console.log('Successfully watching channel:', channelInstance);
                fetchChannelHistory();
            }).catch((error) => {
                console.error('Error watching channel:', error);
                setError('Failed to join chat channel.');
            });

            channelInstance.on('message.new', (event) => {
                console.log('New message received:', event);
                setMessages(currentMessages => [...currentMessages, event]);
                if (event.text === '!start-game') {
                    startGame();
                } else if (event.user.id !== account && event.text.startsWith('reacted in ')) {
                    const time = parseInt(event.text.split(' ')[2].slice(0, -2));
                    setOpponentReactionTime(time);
                    if (myReactionTime > 0) {
                        evaluateWinner(myReactionTime, time);
                    }
                }
            });
        } else {
            setStreamChannel(null);
            setMessages([]);
        }

        return () => {
            if (channelInstance && typeof channelInstance.isWatching === 'function' && channelInstance.isWatching()) {
                channelInstance.stopWatching();
            }
        };
    }, [streamClient, gameChannelId, account, myReactionTime]);

    useEffect(() => {
        if (streamClient && gameChannelId) {
            // As soon as we are in a game channel, allow starting
            setCanStartGame(true);

            const handleMemberUpdated = (event) => {
                // You might still want to log member updates or handle other member-related events here
                // For now, the start button remains enabled once in the channel
                console.log('Channel member updated:', event);
            };

            streamClient.on('channel.member.updated', handleMemberUpdated);

            return () => {
                if (streamClient) {
                    streamClient.off('channel.member.updated', handleMemberUpdated);
                }
            };
        } else {
            setCanStartGame(false);
        }
    }, [streamClient, gameChannelId]);

    useEffect(() => {
        if (streamClient && account) {
            const handleMemberAdded = (event) => {
                if (event.member.user_id === account && event.channel && event.channel.id) {
                    const potentialChallenger = event.channel.members.find(member => member.user_id !== account)?.user_id;
                    if (potentialChallenger) {
                        const sortedAddresses = [account, potentialChallenger].sort();
                        const expectedChannelId = sha256(sortedAddresses.join('-')).substring(0, 64);
                        if (event.channel.id === expectedChannelId && !gameChannelId) {
                            setPendingChallengeChannelId(event.channel.id);
                            setChallengerAddress(potentialChallenger);
                        }
                    }
                }
            };

            streamClient.on('channel.member.added', handleMemberAdded);

            return () => {
                if (streamClient) {
                    streamClient.off('channel.member.added', handleMemberAdded);
                }
            };
        }
    }, [streamClient, account, gameChannelId]);

    const handleChallengePlayer = async () => {
        if (!streamClient || !account || !opponentAddress) {
            setError('Stream Chat not initialized or opponent address missing.');
            return;
        }
        const sortedAddresses = [account, opponentAddress].sort();
        const combinedAddresses = sortedAddresses.join('-');
        const newChannelId = sha256(combinedAddresses).substring(0, 64);
        setGameChannelId(newChannelId);
        const channel = streamClient.channel('messaging', newChannelId, {
            members: [account, opponentAddress],
            name: `Game between ${account.substring(0, 6)}... and ${opponentAddress.substring(0, 6)}...`,
        });
        await channel.create();
        setStreamChannel(channel);
        alert(`Game channel created with ${opponentAddress}.`);
    };

    const handleAcceptChallenge = () => {
        if (pendingChallengeChannelId && streamClient) {
            setGameChannelId(pendingChallengeChannelId);
            setStreamChannel(streamClient.channel('messaging', pendingChallengeChannelId));
            streamClient.channel('messaging', pendingChallengeChannelId).watch();
            setPendingChallengeChannelId(null);
            setOpponentAddress(challengerAddress);
            setChallengerAddress(null);
            alert('Challenge accepted! You are now in the game channel.');
        }
    };

    const handleStartGameButtonClick = () => {
        if (streamChannel && canStartGame && !isGameActive) {
            console.log('Attempting to send start game message:', streamChannel);
            if (streamChannel.sendMessage) {
                const messageToSend = { text: '!start-game' };
                console.log('Sending message:', messageToSend);
                streamChannel.sendMessage(messageToSend)
                    .then((result) => console.log('Message sent successfully:', result))
                    .catch((error) => console.error('Error sending message:', error));
                startGame();
            } else {
                console.error('streamChannel.sendMessage is not available yet.');
            }
        }
    };

    const startGame = () => {
        setIsGameActive(true);
        setStartTime(Date.now() + Math.random() * 3000 + 1000); // Random delay
        setCanReact(false);
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        setGameResult(null);

        reactionTimeout.current = setTimeout(() => {
            setCanReact(true);
        }, startTime - Date.now());
    };

    const handleSubmitReaction = () => {
        if (isGameActive && canReact && !isReacting && streamChannel) {
            setIsReacting(true);
            const reactionTimeMs = Date.now() - startTime;
            setMyReactionTime(reactionTimeMs);
            streamChannel.sendMessage({ text: `reacted in ${reactionTimeMs}ms` });
            setIsReacting(false);
            if (opponentReactionTime > 0) {
                evaluateWinner(reactionTimeMs, opponentReactionTime);
            }
        }
    };

    const evaluateWinner = (player1Time, player2Time) => {
        if (player1Time > 0 && player2Time > 0) {
            if (player1Time < player2Time) {
                setGameResult('You won!');
            } else if (player2Time < player1Time) {
                setGameResult('Opponent won!');
            } else {
                setGameResult('It\'s a tie!');
            }
            setIsGameActive(false);
            clearTimeout(reactionTimeout.current);
            setCanReact(false);
        }
    };

    const handleEndGame = () => {
        setIsGameActive(false);
        setStartTime(0);
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        setGameResult(null);
        setCanReact(false);
        clearTimeout(reactionTimeout.current);
        setGameChannelId(null);
        setStreamChannel(null);
        setMessages([]);
        setPendingChallengeChannelId(null);
        setChallengerAddress(null);
        setOpponentAddress('');
        setCanStartGame(false);
    };

    const sendMessage = async () => {
        if (streamChannel && newMessage) {
            await streamChannel.sendMessage({ text: newMessage });
            setNewMessage('');
        }
    };

    return (
        <GameContainer>
            <h1>Decentralized Reaction Game (Stream Chat Version)</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!streamClient ? (
                <p>Connecting to Stream Chat...</p>
            ) : pendingChallengeChannelId ? (
                <div>
                    <p>{challengerAddress.substring(0, 8)}... has challenged you to a game!</p>
                    <Button onClick={handleAcceptChallenge}>Accept Challenge</Button>
                </div>
            ) : !gameChannelId ? (
                <div>
                    <Input
                        type="text"
                        placeholder="Opponent's Wallet Address"
                        value={opponentAddress}
                        onChange={(e) => setOpponentAddress(e.target.value)}
                    />
                    <Button onClick={handleChallengePlayer} disabled={!opponentAddress}>
                        Challenge Player
                    </Button>
                    {gameChannelId && <p>Game channel created with {opponentAddress}.</p>}
                </div>
            ) : (
                <div>
                    <h3>Chat with Opponent ({opponentAddress.substring(0, 8)}...)</h3>
                    <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                <strong>{msg.user.id.substring(0, 8)}...:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                    <Input
                        type="text"
                        placeholder="Type your message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    />
                    <Button onClick={sendMessage} disabled={!streamChannel || !newMessage}>
                        Send
                    </Button>

                    {!isGameActive && gameChannelId && canStartGame ? (
                        <Button onClick={handleStartGameButtonClick}>Start Game</Button>
                    ) : isGameActive ? (
                        <div>
                            <ReactionPrompt>React when the indicator turns green!</ReactionPrompt>
                            <ReadyIndicator ready={canReact} />
                            <Button onClick={handleSubmitReaction} disabled={!canReact || isReacting || myReactionTime > 0}>
                                {isReacting ? 'Reacting...' : myReactionTime > 0 ? 'Reacted!' : 'React!'}
                            </Button>
                            {myReactionTime > 0 && <p>Your reaction time: {myReactionTime} ms</p>}
                            {opponentReactionTime > 0 && <p>Opponent's reaction time: {opponentReactionTime} ms</p>}
                            {gameResult && <p>{gameResult}</p>}
                        </div>
                    ) : gameResult ? (
                        <ResultsDisplay>
                            <h2>Game Over!</h2>
                            <p>{gameResult}</p>
                            {myReactionTime > 0 && <p>Your Reaction Time: {myReactionTime} ms</p>}
                            {opponentReactionTime > 0 && <p>Opponent's Reaction Time: {opponentReactionTime} ms</p>}
                            <Button onClick={handleEndGame}>End Game</Button>
                        </ResultsDisplay>
                    ) : (
                        <p>Waiting for opponent to accept the challenge.</p>
                    )}
                </div>
            )}
        </GameContainer>
    );
}

export default Game;