// --- src/components/Game.js ---
import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3';
import { StreamChat } from 'stream-chat';
import sha256 from 'js-sha256';

import { GameContainer, Input, Button } from './styles';
import ReadyIndicator from './ReadyIndicator';
import ResultsDisplay from './ResultsDisplay';
import GameChat from './GameChat';
import GameControls from './GameControls';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

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
    const [canStartGame, setCanStartGame] = useState(false);
    const hasGameStartedRef = useRef(false);

    useEffect(() => {
        const initWeb3AndStream = async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    const contractInstance = new web3Instance.eth.Contract(
                        [], // Removed contractABI
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

                if (event.message && event.message.text === '!start-game' && !hasGameStartedRef.current) {
                    console.log('Received !start-game, calling startGame');
                    hasGameStartedRef.current = true;
                    startGame();
                } else if (event.user.id !== account && event.message.text.startsWith('reacted in ')) {
                    const time = parseInt(event.message.text.split(' ')[2].slice(0, -2));
                    setOpponentReactionTime(time);
                    if (myReactionTime > 0) {
                        evaluateWinner(myReactionTime, time);
                    }
                }
            });

        } else {
            setStreamChannel(null);
            setMessages([]);
            hasGameStartedRef.current = false; 
        }

        return () => {
            if (channelInstance && typeof channelInstance.isWatching === 'function' && channelInstance.isWatching()) {
                channelInstance.stopWatching();
            }
            hasGameStartedRef.current = false; 
        };
    }, [streamClient, gameChannelId, account, myReactionTime]);

    useEffect(() => {
        if (streamClient && gameChannelId) {
            
            setCanStartGame(true);

            const handleMemberUpdated = (event) => {
                
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


    const checkBothPlayersPresent = async () => {
        if (streamChannel) {
            try {
                const members = await streamChannel.queryMembers({});
                return members.members.length === 2;
            } catch (err) {
                console.error('Error checking members:', err);
            }
        }
        return false;
    };
    useEffect(() => {
        if (!streamChannel) return;

        const updateCanStartGame = async () => {
            const bothPresent = await checkBothPlayersPresent();
            setCanStartGame(bothPresent);
        };

        updateCanStartGame();

        const handleMemberChange = () => {
            updateCanStartGame();
        };

        streamChannel.on('member.added', handleMemberChange);
        streamChannel.on('member.removed', handleMemberChange);

        return () => {
            streamChannel.off('member.added', handleMemberChange);
            streamChannel.off('member.removed', handleMemberChange);
        };
    }, [streamChannel]);


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
        setMyReactionTime(0);

        if (streamChannel && canStartGame && !isGameActive) {
            console.log('Attempting to send start game message:', streamChannel);
            if (streamChannel.sendMessage) {
                const messageToSend = { text: '!start-game' };
                console.log('Sending message:', messageToSend);
                streamChannel.sendMessage(messageToSend)
                    .then((result) => console.log('Message sent successfully:', result))
                    .catch((error) => console.error('Error sending message:', error));

            } else {
                console.error('streamChannel.sendMessage is not available yet.');
            }
        }
    };

    const startGame = () => {

        console.log("startGame called");
        setStartTime(Date.now());
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        setGameResult(null);
        setCanReact(false);
        setIsReacting(false);
        hasGameStartedRef.current = true;
        setIsGameActive(true);
        const minDelay = 5000; // 5 seconds
        const maxDelay = 10000; // 10 seconds
        const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;

        reactionTimeout.current = setTimeout(() => {
            const now = Date.now();
            setMyReactionTime(0);
            setStartTime(now);
            setCanReact(true);
            console.log("Reaction time window started at:", now);
        }, randomDelay);
    };

    const handlePlayAgain = () => {
        setStartTime(0);
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        setGameResult(null);
        setCanReact(false);
        setIsReacting(false);
        hasGameStartedRef.current = false;
        setIsGameActive(false);
        setCanStartGame(true); 
    };

    const handleSubmitReaction = () => {
        if (isGameActive && canReact && !isReacting && streamChannel) {
            console.log('handleSubmitReaction called');
            setCanReact(false); 
            console.log('canReact set to false in handleSubmitReaction');
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
            let result = '';
            if (player1Time < player2Time) {
                result = 'You won!';
            } else if (player2Time < player1Time) {
                result = 'You Lost!';
            } else {
                result = 'It\'s a tie!';
            }
            console.log('Game result determined:', result);
            setGameResult(String(result));
            setIsGameActive(false);
            console.log('isGameActive set to false');
            clearTimeout(reactionTimeout.current);
            setCanReact(false);
            console.log('canReact set to false');
            hasGameStartedRef.current = false;
            console.log('hasGameStartedRef set to false');
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

    const handleNewMessageChange = (e) => {
        setNewMessage(e.target.value);
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
                    <GameChat
                        messages={messages}
                        newMessage={newMessage}
                        onNewMessageChange={handleNewMessageChange}
                        onSendMessage={sendMessage}
                    />

                    {!isGameActive && gameChannelId && canStartGame && !gameResult ? (
                        <Button onClick={handleStartGameButtonClick} disabled={!canStartGame}>
                            Start Game
                        </Button>
                    ) : isGameActive ? (
                        <GameControls
                            isGameActive={isGameActive}
                            canReact={canReact}
                            isReacting={isReacting}
                            myReactionTime={myReactionTime}
                            onSubmitReaction={handleSubmitReaction}
                            onStartGame={handleStartGameButtonClick} 
                        />
                    ) : gameResult ? (
                        <ResultsDisplay
                            gameResult={gameResult}
                            myReactionTime={myReactionTime}
                            opponentReactionTime={opponentReactionTime}
                            onEndGame={handleEndGame}
                            onPlayAgain={handlePlayAgain}
                        />
                    ) : (
                        <p>Waiting for opponent to accept the challenge.</p>
                    )}
                </div>
            )}
        </GameContainer>
    );
}

export default Game;