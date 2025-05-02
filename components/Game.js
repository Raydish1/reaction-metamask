import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3';
import { StreamChat } from 'stream-chat';
import sha256 from 'js-sha256';

import { GameContainer, Input, Button } from './styles';
import ReadyIndicator from './ReadyIndicator';
import ResultsDisplay from './ResultsDisplay';
import GameChat from './GameChat';
import GameControls from './GameControls';
import erc20ABI from '../utils/erc20ABI.js';
import reactiongameABI from '../utils/reactiongameABI.js';
import factoryABI from '../utils/factoryABI.js';

const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const erc20Address = process.env.NEXT_PUBLIC_ERC20_ADDRESS; // Make sure this is in your .env file
const entryFee = '0';

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
    const [canStartGame, setCanStartGame] = useState(false);
    const hasGameStartedRef = useRef(false);
    const myReactionTimeRef = useRef(0);
    const opponentReactionTimeRef = useRef(0);

    const [factory, setFactory] = useState(null);

    const [isWagerEnabled, setIsWagerEnabled] = useState(false);
    const [wagerAmount, setWagerAmount] = useState('');
    const [isWagerGame, setIsWagerGame] = useState(false);
    const [wagerAmountDisplay, setWagerAmountDisplay] = useState(0);
    const [wageredGameInfo, setWageredGameInfo] = useState(null);
    const hasOpponentSubmittedReaction = useRef(false);

    useEffect(() => {
        const initWeb3AndStream = async () => {
            
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
                    
                  
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    
                    const factoryInstance = new web3Instance.eth.Contract(factoryABI, factoryAddress);
setFactory(factoryInstance);

                    
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

            const watchChannel = async () => {
                try {
                    await channelInstance.watch();
                    console.log('Successfully watching channel:', channelInstance);
                    fetchChannelHistory();
                } catch (error) {
                    console.error('Error watching channel:', error);
                    setError('Failed to join chat channel.');
                }
            };

            watchChannel();

            channelInstance.on('message.new', (event) => {
                console.log('New message received:', event);
                setMessages(currentMessages => [...currentMessages, event]);
                if (
                    event.message &&
                    event.message.text === '!start-game'
                ) {
                    console.log('Received !start-game, calling startGame');
                    hasGameStartedRef.current = true;
                    startGame();
                } else if (event.user.id !== account && event.message.text.startsWith('reacted in ')) {
                    const time = parseInt(event.message.text.split(' ')[2].slice(0, -2));
                    console.log(event.message.text)
                    console.log(time)
                    opponentReactionTimeRef.current = time;
                    console.log("Opponent reaction time: ", opponentReactionTimeRef)
                    if (myReactionTimeRef.current > 0) {
                        evaluateWinner(myReactionTimeRef.current, time);
                    }
                }
            });

            if (streamChannel && streamChannel.data.isWagerGame) {
                setIsWagerGame(true);
                setWagerAmountDisplay(parseFloat(streamChannel.data.wagerAmount || 0));
                //fetchWageredGameInfo(generateGameId(streamChannel.data.player1, streamChannel.data.player2, streamChannel.data.wagerAmount));
            } else {
                setIsWagerGame(false);
                setWagerAmountDisplay(0);
                setWageredGameInfo(null);
            }

        } else {
            setStreamChannel(null);
            setMessages([]);
            hasGameStartedRef.current = false;
            setIsWagerGame(false);
            setWagerAmountDisplay(0);
            setWageredGameInfo(null);
        }

        return () => {
            if (channelInstance && typeof channelInstance.isWatching === 'function' && channelInstance.isWatching()) {
                channelInstance.stopWatching();
            }
            hasGameStartedRef.current = false;
        };
    }, [streamClient, gameChannelId, account, web3]);

    useEffect(() => {
        if (streamClient && account) {
            const handleMemberAdded = (event) => {
                if (event.member.user_id === account && event.channel && event.channel.id) {
                    const channelData = event.channel.data;
                    if (channelData.isWagerGame && channelData.player1 && channelData.player2 && channelData.wagerAmount) {
                        const expectedGameId = generateGameId(channelData.player1, channelData.player2, channelData.wagerAmount);
                        if (event.channel.id === expectedGameId) {
                            setGameChannelId(event.channel.id);
                            setIsWagerGame(true);
                            setWagerAmountDisplay(parseFloat(channelData.wagerAmount));
                            setOpponentAddress(channelData.player1 === account ? channelData.player2 : channelData.player1);
                        }
                    } else if (!channelData.isWagerGame && channelData.members && channelData.members.includes(account)) {
                        const otherMember = channelData.members.find(id => id !== account);
                        if (otherMember) {
                            const sortedMembers = [account, otherMember].sort();
                            const expectedChannelId = `game-${sortedMembers[0].substring(0, 8)}-${sortedMembers[1].substring(0, 8)}`;
                            if (event.channel.id === expectedChannelId) {
                                setGameChannelId(event.channel.id);
                                setIsWagerGame(false);
                                setWagerAmountDisplay(0);
                                setOpponentAddress(otherMember);
                            }
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
    }, [streamClient, account]);

    

    const generateGameId = (player1, player2, wager) => {
        const sortedPlayers = [player1.toLowerCase(), player2.toLowerCase()].sort();
        return sha256(`${sortedPlayers[0]}-${sortedPlayers[1]}-${wager}`);
    };

    const handleChallengeClick = async () => {
        if (account && opponentAddress) {
            const sorted = [account.toLowerCase(), opponentAddress.toLowerCase()].sort();
            let player1 = sorted[0]
            let player2 = sorted[0]
const wager = parseFloat(wagerAmount);

if (isWagerEnabled && wager > 0) {
    const wagerWei = web3.utils.toWei(wager.toString(), 'ether');
    //const gameId = web3.utils.soliditySha3(sorted[0], sorted[1], wagerWei);   

    try {
        let gameAddress = await factory.methods.getGame(sorted[0], sorted[1], wagerWei).call();

        if (gameAddress === '0x0000000000000000000000000000000000000000') {
            const tx = await factory.methods
                .createGame(erc20Address, wagerWei, sorted[0], sorted[1])
                .send({ from: account });
            gameAddress = tx.events.GameCreated.returnValues.gameAddress;
        }

        const tokenContract = new web3.eth.Contract(erc20ABI, erc20Address);
        await tokenContract.methods.approve(gameAddress, wagerWei).send({ from: account });

        const gameContract = new web3.eth.Contract(reactiongameABI, gameAddress);
        console.log("Account:", account);
console.log("Game address:", gameAddress);
console.log("Token contract:", tokenContract);

        await gameContract.methods.join().send({ from: account });
        setContract(gameContract);
        const gameId = web3.utils.soliditySha3(player1, player2, wagerWei).slice(2);
        const channel = streamClient.channel('messaging', gameId, {
            members: [account, opponentAddress],
            isWagerGame: true,
            wagerAmount: wager,
            player1: sorted[0],
            player2: sorted[1],
        });
        await channel.create();

        setStreamChannel(channel);
        setGameChannelId(gameId);
        setIsWagerGame(true);
        setWagerAmountDisplay(wager);

        alert(`Game ready at ${gameAddress}`);
    } catch (err) {
        console.error('Error creating or joining wagered game:', err);
        alert('Error starting game.');
    }
}
 else if (!isWagerEnabled) {
                const sortedAddresses = [account, opponentAddress].sort();
                const shortChannelId = `game-${sortedAddresses[0].substring(0, 8)}-${sortedAddresses[1].substring(0, 8)}`;
                const channel = streamClient.channel('messaging', shortChannelId, {
                    members: [account, opponentAddress],
                    isWagerGame: false,
                });
                try {
                    await channel.create();
                    setGameChannelId(shortChannelId);
                    setIsWagerGame(false);
                    setWagerAmountDisplay(0);
                    alert(`Challenged ${opponentAddress}!`);
                } catch (error) {
                    console.error("Error creating challenge channel:", error);
                    alert(`Failed to create challenge: ${error.message}`);
                }
            } else {
                alert("Please enter a valid opponent address and wager amount if enabled.");
            }
        } else {
            alert("Please connect your wallet and enter an opponent address.");
        }
    };
    const resolveGame = async (winnerAddress) => {
        if (!contract || !account || !web3) return;
        try {
          await contract.methods.resolveGame(winnerAddress).send({ from: account });
          console.log(`Resolved game. Winner: ${winnerAddress}`);
        } catch (err) {
          console.error('Error resolving game:', err);
          alert('Failed to resolve game on chain.');
        }
      };
    const handleStartGameButtonClick = async () => {
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        setGameResult(null);
        hasOpponentSubmittedReaction.current = false;
        hasGameStartedRef.current = false; // Reset game started flag

        if (gameChannelId && !isGameActive) {
            try {
                const channelState = await streamChannel.query({ watch: true, state: true });
                const memberCount = channelState.watcher_count;

                if (memberCount !== 2) {
                    alert('You need exactly 2 players in the channel to start the game.');
                    return;
                }

                const messageToSend = { text: '!start-game' };
                streamChannel.sendMessage(messageToSend)
                    .then((result) => console.log('Message sent successfully:', result))
                    .catch((error) => console.error('Error sending message:', error));

            } catch (error) {
                console.error("Error querying channel state:", error);
                alert("Failed to start game, please try again.");
            }
        } else {
            alert("Please create or join a channel to start the game.");
        }
    };

    const startGame = () => {
        console.log("startGame called");
        myReactionTimeRef.current = 0;
        setStartTime(Date.now());
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        opponentReactionTimeRef.current = 0;
        setGameResult(null);
        setCanReact(false);
        setIsReacting(false);
        hasGameStartedRef.current = true;
        setIsGameActive(true);
        const minDelay = 2000; // Reduced delay for testing
        const maxDelay = 5000;
        const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;

        reactionTimeout.current = setTimeout(() => {
            const now = Date.now();
            setMyReactionTime(0);
            setStartTime(now);
            setCanReact(true);
            console.log("Reaction time window started at:", now);
        }, randomDelay);
    };

    const handleSubmitReaction = async () => {
        if (isGameActive && canReact && !isReacting && streamChannel) {
            console.log('handleSubmitReaction called');
            setCanReact(false);
            console.log('canReact set to false in handleSubmitReaction');
            setIsReacting(true);
            const reactionTimeMs = Date.now() - startTime;
            console.log(reactionTimeMs)
            setMyReactionTime(reactionTimeMs);
            myReactionTimeRef.current = reactionTimeMs;
            console.log(myReactionTime);
            streamChannel.sendMessage({ text: `reacted in ${reactionTimeMs}ms` });
    
            
                // For unwagered games, winner evaluation happens locally
                setIsReacting(false); // No contract interaction, so immediately stop reacting state
                if (opponentReactionTimeRef.current > 0) {
                    evaluateWinner(reactionTimeMs, opponentReactionTimeRef.current);
                }
            
        }
    };

   

    const evaluateWinner = async (myTime, opponentTime) => {
        console.log("evaluating winner")
        let winner = null;
      
        if (myTime < opponentTime) {
          setGameResult('You won!');
          winner = account;
        } else if (opponentTime < myTime) {
          setGameResult('You lost!');
          winner = opponentAddress;
        } else {
          setGameResult('It\'s a tie!');
          setIsGameActive(false);
          return;
        }
      
        setIsGameActive(false);
      
        // Only the winner calls resolveGame
        if (isWagerGame && contract && winner === account) {
          try {
            await contract.methods.resolveGame(winner).send({ from: account });
            console.log(`Resolved game in contract. Winner: ${winner}`);
          } catch (err) {
            console.error('Failed to resolve game:', err);
          }
        }
      };
      
    

    const handleInputChange = (event) => {
        setOpponentAddress(event.target.value);
    };

    const handleWagerToggle = (event) => {
        setIsWagerEnabled(event.target.checked);
        setWagerAmount(''); // Reset wager amount when toggling
    };

    const handleWagerAmountChange = (event) => {
        setWagerAmount(event.target.value);
    };

    const sendMessage = async () => {
        if (streamChannel && newMessage) {
            try {
                await streamChannel.sendMessage({ text: newMessage });
                setNewMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    
    const handleEndGame = async () => {
        setIsGameActive(false);
        setStartTime(0);
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        setGameResult(null);
        setCanReact(false);
        clearTimeout(reactionTimeout.current);

        if (streamChannel) {
            try {
                await streamChannel.removeMembers([account]);
                await streamChannel.stopWatching(); // optional but good for cleanup
                console.log("Left the channel successfully.");
            } catch (error) {
                console.error("Failed to leave the channel:", error);
            }
        }
        setGameChannelId(null);
        setStreamChannel(null);
        setMessages([]);
        
        
        setOpponentAddress('');
        setIsWagerGame(false);
        setWagerAmountDisplay(0);
     
        setWageredGameInfo(null);
    };
    
    return (
        <GameContainer>
            <h1>Decentralized Reaction Game (Wager Functional)</h1>
            {account && (
  <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '-10px' }}>
    Connected as: {account}
  </p>
)}
            {error && <p style={{ color: 'red' }}>{error}</p>}
    
            {!streamClient ? (
                <p>Connecting to Stream Chat...</p>
            ) : false ? (
                <div>
                    <p>{challengerAddress ? `${challengerAddress.substring(0, 8)}...` : 'A player'} has challenged you to a
                        {isWagerGame ? ` wagered game of ${wagerAmountDisplay} tokens!` : ' game!'}</p>
                    {isWagerGame && (
                        <input
                            type="number"
                            placeholder={`Enter ${wagerAmountDisplay} to accept`}
                            value={opponentWagerAmountInput}
                            onChange={(e) => setOpponentWagerAmountInput(e.target.value)}
                        />
                    )}
                    <Button
                        onClick={handleAcceptChallenge}
                        disabled={isWagerGame && (isNaN(parseFloat(opponentWagerAmountInput)) || parseFloat(opponentWagerAmountInput) !== wagerAmountDisplay)}
                    >
                        Accept Challenge
                    </Button>
                </div>
            ) : !gameChannelId ? (
                <div>
                    <Input
                        type="text"
                        placeholder="Opponent's Wallet Address"
                        value={opponentAddress}
                        onChange={(e) => setOpponentAddress(e.target.value)}
                    />
                    <label>
                        Enable Wager:
                        <input
                            type="checkbox"
                            checked={isWagerEnabled}
                            onChange={(e) => setIsWagerEnabled(e.target.checked)}
                        />
                    </label>
                    {isWagerEnabled && (
                        <input
                            type="number"
                            placeholder="Wager Amount (in your token)"
                            value={wagerAmount}
                            onChange={(e) => setWagerAmount(e.target.value)}
                        />
                    )}
                    <Button
                        onClick={handleChallengeClick}
                        disabled={!opponentAddress || (isWagerEnabled && !(parseFloat(wagerAmount) > 0))}
                    >
                        Challenge Player
                    </Button>
                    {gameChannelId && <p>Game channel created with {opponentAddress}.</p>}
                </div>
            ) : (
                <div>
                    {isWagerGame && <p>Wager Amount: {wagerAmountDisplay} tokens</p>}
    
                    <GameChat
                        messages={messages}
                        newMessage={newMessage}
                        onNewMessageChange={handleNewMessageChange}
                        onSendMessage={sendMessage}
                    />
    
    {gameResult ? (
    <ResultsDisplay
        gameResult={gameResult}
        myReactionTime={myReactionTime}
        opponentReactionTime={opponentReactionTime}
        onEndGame={handleEndGame}
        onPlayAgain={handleStartGameButtonClick} // No play again for wagered games
    />
) : isGameActive ? (
    <GameControls
        isGameActive={isGameActive}
        canReact={canReact}
        isReacting={isReacting}
        myReactionTime={myReactionTime}
        onSubmitReaction={handleSubmitReaction}
        onStartGame={handleStartGameButtonClick}
    />
) : (!isGameActive && contract) ? (
    <Button onClick={handleStartGameButtonClick}>
        Start Game
    </Button>
) : (
    <p>Waiting for opponent to accept the challenge.</p>
)}

    
                    
                </div>
            )}
        </GameContainer>
    );}

export default Game;