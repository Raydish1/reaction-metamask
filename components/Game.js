import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3';
import { StreamChat } from 'stream-chat';
import sha256 from 'js-sha256';

import { GameContainer, Input, Button } from './styles';
import ReadyIndicator from './ReadyIndicator';
import ResultsDisplay from './ResultsDisplay';
import GameChat from './GameChat';
import GameControls from './GameControls'; 
import erc20ABI from '../utils/erc20ABI.json'; 
import reactiongameABI from '../utils/reactionGameABI.json';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const erc20Address = process.env.NEXT_PUBLIC_ERC20_ADDRESS; 

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
    const myReactionTimeRef = useRef(0);


    const [isWagerEnabled, setIsWagerEnabled] = useState(false);
    const [wagerAmount, setWagerAmount] = useState('');
    const [isWagerGame, setIsWagerGame] = useState(false);
    const [wagerAmountDisplay, setWagerAmountDisplay] = useState(0);
    const [opponentWagerAmountInput, setOpponentWagerAmountInput] = useState('');
    const [wagerAcceptedByMe, setWagerAcceptedByMe] = useState(false);
    const [wagerAcceptedByOpponent, setWagerAcceptedByOpponent] = useState(false);
    const [wageredGameInfo, setWageredGameInfo] = useState(null);

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
                        reactiongameABI, 
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
                console.log(event.message, event.message.text, isWagerGame, wagerAcceptedByMe, wagerAcceptedByOpponent, hasGameStartedRef.current)
                if (
                    event.message &&
                    event.message.text === '!start-game' &&
                    (!isWagerGame || (isWagerGame && wagerAcceptedByMe && wagerAcceptedByOpponent)) &&
                    !hasGameStartedRef.current
                ) {
                    console.log('Received !start-game, calling startGame');
                    hasGameStartedRef.current = true;
                    startGame();
                } else if (event.user.id !== account && event.message.text.startsWith('reacted in ')) {
                    const time = parseInt(event.message.text.split(' ')[2].slice(0, -2));
                    setOpponentReactionTime(time);
                    if (myReactionTimeRef.current > 0) {
                        console.log(myReactionTime)
                        console.log(myReactionTimeRef.current)
                        evaluateWinner(myReactionTimeRef.current, time);
                    }
                }
            });

            if (streamChannel && streamChannel.data.wager) {
                setIsWagerGame(true);
                setWagerAmountDisplay(streamChannel.data.wagerAmount);
                fetchWageredGameInfo(web3.utils.hexToBytes(gameChannelId));
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
            setWagerAcceptedByMe(false);
            setWagerAcceptedByOpponent(false);
        }

        return () => {
            if (channelInstance && typeof channelInstance.isWatching === 'function' && channelInstance.isWatching()) {
                channelInstance.stopWatching();
            }
            hasGameStartedRef.current = false;
        };
    }, [streamClient, gameChannelId, account, myReactionTime, web3]);

    useEffect(() => {
        if (streamClient && gameChannelId) {
            const handleMemberUpdated = (event) => {
                console.log('Channel member updated:', event);
            };

            streamClient.on('channel.member.updated', handleMemberUpdated);

            return () => {
                if (streamClient) {
                    streamClient.off('channel.member.updated', handleMemberUpdated);
                }
            };
        }
    }, [streamClient, gameChannelId]);

    useEffect(() => {
        if (streamClient && account) {
            const handleMemberAdded = (event) => {
                if (event.member.user_id === account && event.channel && event.channel.id) {
                    // Check if you were the challenger
                    if (event.channel.data.challenger === account) {
                        console.log("You initiated the challenge and joined the channel.");
                        setGameChannelId(event.channel.id);
                        setIsWagerGame(event.channel.data.gameType === 'wager');
                        setWagerAmountDisplay(parseFloat(event.channel.data.wagerAmount || 0));
                        setPendingChallengeChannelId(null); // Clear pending challenge state
                        setChallengerAddress(null);
                        setOpponentAddress(event.channel.members.find(member => member.user_id !== account)?.user_id || '');
                    } else {
                        // Handle the case where you were challenged by someone else
                        const potentialChallenger = event.channel.members.find(member => member.user_id !== account)?.user_id;
                        if (potentialChallenger) {
                            const sortedAddresses = [account, potentialChallenger].sort();
                            const expectedChannelId = sha256(sortedAddresses.join('-')).substring(0, 64);
                            if (event.channel.id === expectedChannelId && !gameChannelId && event.channel.data.gameType === 'wager') {
                                setPendingChallengeChannelId(event.channel.id);
                                setChallengerAddress(potentialChallenger);
                                setIsWagerGame(true);
                                setWagerAmountDisplay(event.channel.data.wagerAmount);
                            } else if (event.channel.id === expectedChannelId && !gameChannelId) {
                                setPendingChallengeChannelId(event.channel.id);
                                setChallengerAddress(potentialChallenger);
                                setIsWagerGame(false);
                                setWagerAmountDisplay(0);
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
    }, [streamClient, account, gameChannelId]);

    useEffect(() => {
        if (wageredGameInfo) {
            setWagerAcceptedByMe(wageredGameInfo.player1 === account ? wageredGameInfo.player1AcceptedWager : wageredGameInfo.player2AcceptedWager);
            setWagerAcceptedByOpponent(wageredGameInfo.player1 !== account ? wageredGameInfo.player1AcceptedWager : wageredGameInfo.player2AcceptedWager);
        }
    }, [wageredGameInfo, account]);

    const fetchWageredGameInfo = async (gameIdBytes) => {
        if (contract && gameIdBytes) {
            try {
                const info = await contract.methods.getWageredGameInfo(gameIdBytes).call();
                setWageredGameInfo(info);
            } catch (error) {
                console.error('Error fetching wagered game info:', error);
            }
        }
    };

    const handleChallengeClick = async () => {
        if (account && opponentAddress && isWagerEnabled && parseFloat(wagerAmount) > 0) {
            try {
                const tokenContract = new web3.eth.Contract(erc20ABI, erc20Address);
                const wagerAmountWei = web3.utils.toWei(wagerAmount.toString(), 'ether');
    
                await tokenContract.methods.approve(contractAddress, wagerAmountWei).send({ from: account });
    
                const sortedAddresses = [account, opponentAddress].sort();
                const combinedString = `${sortedAddresses[0].substring(0, 10)}-${sortedAddresses[1].substring(0, 10)}`; // Take first 10 chars
                const shortChannelId = `wager-${combinedString}`;
    
                await contract.methods.createWageredGame(
                    opponentAddress,
                    wagerAmountWei
                ).send({ from: account, value: web3.utils.toWei(process.env.NEXT_PUBLIC_ENTRY_FEE || '0', 'ether') });
    
                const channel = streamClient.channel('messaging', shortChannelId, {
                    members: [account, opponentAddress],
                    gameType: 'wager',
                    wagerAmount,
                    challenger: account,
                    challenged: opponentAddress,
                    status: 'pending',
                });
    
                await channel.create();
                setPendingChallengeChannelId(shortChannelId);
                setWagerAmountDisplay(parseFloat(wagerAmount));
                alert(`Challenged ${opponentAddress} with a wager of ${wagerAmount} RC! Waiting for them to accept.`);
    
            } catch (error) {
                console.error("Error creating wagered challenge:", error);
                alert(`Failed to create wagered challenge: ${error.message}`);
            }
        } else if (account && opponentAddress && !isWagerEnabled) {
            const sortedAddresses = [account, opponentAddress].sort();
            const combinedString = `${sortedAddresses[0].substring(0, 10)}-${sortedAddresses[1].substring(0, 10)}`; // Take first 10 chars
            const shortChannelId = `game-${combinedString}`;
    
            const channel = streamClient.channel('messaging', shortChannelId, {
                members: [account, opponentAddress],
            });
    
            try {
                await channel.create();
                setGameChannelId(shortChannelId);
                alert(`Challenged ${opponentAddress}!`);
            } catch (error) {
                console.error("Error creating challenge channel:", error);
                alert(`Failed to create challenge: ${error.message}`);
            }
        } else {
            alert("Please connect your wallet, enter a valid opponent address and wager amount if enabled.");
        }
    };
    const handleAcceptChallenge = async () => {
        if (pendingChallengeChannelId && streamClient && challengerAddress && isWagerGame && parseFloat(opponentWagerAmountInput) === wagerAmountDisplay) {
            try {
                const tokenContract = new web3.eth.Contract(erc20ABI, erc20Address);
                const approvalAmount = web3.utils.toWei(opponentWagerAmountInput.toString(), 'ether');
                await tokenContract.methods.approve(contractAddress, approvalAmount).send({ from: account });

                await contract.methods.acceptWager(
                    web3.utils.hexToBytes(pendingChallengeChannelId),
                    approvalAmount
                ).send({ from: account, value: web3.utils.toWei('0.001', 'ether') }); // Include a small entry fee if needed

                setGameChannelId(pendingChallengeChannelId);
                setStreamChannel(streamClient.channel('messaging', pendingChallengeChannelId));
                streamClient.channel('messaging', pendingChallengeChannelId).watch();
                setPendingChallengeChannelId(null);
                setOpponentAddress(challengerAddress);
                setChallengerAddress(null);
                alert('Wager accepted! You are now in the game channel.');
            } catch (error) {
                console.error('Error accepting wager:', error);
                alert('Failed to accept wager.');
            }
        } else if (pendingChallengeChannelId && streamClient && challengerAddress) {
            setGameChannelId(pendingChallengeChannelId);
            setStreamChannel(streamClient.channel('messaging', pendingChallengeChannelId));
            streamClient.channel('messaging', pendingChallengeChannelId).watch();
            setPendingChallengeChannelId(null);
            setOpponentAddress(challengerAddress);
            setChallengerAddress(null);
            alert('Challenge accepted! You are now in the game channel.');
        } else {
            alert('Wager amount does not match or challenge info is missing.');
        }
    };

    const handleStartGameButtonClick = async () => {
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        setGameResult(null);
    
        if (streamChannel && !isGameActive) {
            try {
                const channelState = await streamChannel.query({ watch: true, state: true });
                console.log(channelState)
                const memberCount = channelState.watcher_count;
    
                if (memberCount !== 2) {
                    alert('You need exactly 2 players in the channel to start the game.');
                    return;
                }
    
                if (!isWagerGame || (isWagerGame && wagerAcceptedByMe && wagerAcceptedByOpponent)) {
                    const messageToSend = { text: '!start-game' };
                    streamChannel.sendMessage(messageToSend)
                        .then((result) => console.log('Message sent successfully:', result))
                        .catch((error) => console.error('Error sending message:', error));
                } else {
                    alert('Both players need to accept the wager before starting.');
                }
            } catch (error) {
                console.error('Error checking channel member count:', error);
                alert('Failed to check member count.');
            }
        } else {
            console.log("Can't start game: channel not ready or game already active.");
        }
    };
    
    const resetGameState = () => {
        setMyReactionTime(0);
        setOpponentReactionTime(0);
        myReactionTimeRef.current = 0;
        
        setGameResult(null);
        setCanReact(false);
        setIsReacting(false);
        hasGameStartedRef.current = false;
        setIsGameActive(false);
        clearTimeout(reactionTimeout.current);
    };
    const startGame = () => {
        console.log("startGame called");
        myReactionTimeRef.current = 0;
        setStartTime(Date.now());
        setMyReactionTime(0);
        setOpponentReactionTime(0);
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
            setCanReact(true);console.log("Reaction time window started at:", now);
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
    
            if (isWagerGame && contract && gameChannelId) {
                try {
                    await contract.methods.submitReactionTime(web3.utils.hexToBytes(gameChannelId), reactionTimeMs).send({ from: account });
                    setIsReacting(false);
                    // Winner evaluation for wagered games will likely be triggered by a smart contract event
                } catch (error) {
                    console.error('Error submitting reaction time to contract:', error);
                    setIsReacting(false);
                    alert('Failed to submit reaction time to contract.');
                }
            } else {
                // For unwagered games, winner evaluation happens locally
                setIsReacting(false); // No contract interaction, so immediately stop reacting state
                if (opponentReactionTime > 0) {
                    evaluateWinner(reactionTimeMs, opponentReactionTime);
                }
            }
        }
    };

    const evaluateWinner = (player1Time, player2Time) => {
        if (player1Time > 0 && player2Time > 0 && (!gameResult || gameResult == null)) {
            let reactresult = '';
            if (player1Time < player2Time) {
                reactresult = 'You won!';
            } else if (player2Time < player1Time) {
                reactresult = 'You Lost!';
            } else {
                reactresult = 'It\'s a tie!';
            }
            console.log('Game result determined:', reactresult);
            console.log(player1Time, player2Time)
            setGameResult(reactresult);
            setIsGameActive(false);
            console.log('isGameActive set to false');
            clearTimeout(reactionTimeout.current);
            setCanReact(false);
            console.log('canReact set to false');
            hasGameStartedRef.current = false;
            console.log('hasGameStartedRef set to false');
        }
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
        setPendingChallengeChannelId(null);
        setChallengerAddress(null);
        setOpponentAddress('');
        setIsWagerGame(false);
        setWagerAmountDisplay(0);
        setWagerAcceptedByMe(false);
        setWagerAcceptedByOpponent(false);
        setWageredGameInfo(null);
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
            <h1>Decentralized Reaction Game (Wager not functional yet)</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
    
            {!streamClient ? (
                <p>Connecting to Stream Chat...</p>
            ) : pendingChallengeChannelId ? (
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
                    ) : (!isGameActive && (!isWagerGame || (wagerAcceptedByMe && wagerAcceptedByOpponent))) ? (
                        <Button
                            onClick={handleStartGameButtonClick}
                            disabled={isWagerGame && (!wagerAcceptedByMe || !wagerAcceptedByOpponent)}
                        >
                            Start Game
                        </Button>
                    ) : isWagerGame && (!wagerAcceptedByMe || !wagerAcceptedByOpponent) ? (
                        <p>Waiting for both players to accept the wager.</p>
                    ) : (
                        <p>Waiting for opponent to accept the challenge.</p>
                    )}
    
                    
                </div>
            )}
        </GameContainer>
    );}
export default Game;    