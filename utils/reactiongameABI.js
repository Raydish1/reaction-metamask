const reactiongameABI = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_gameId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_wagerAmount",
				"type": "uint256"
			}
		],
		"name": "acceptWager",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_opponent",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_wagerAmount",
				"type": "uint256"
			}
		],
		"name": "createWageredGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_initialOwner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_wagerToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_entryFee",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "gameId",
				"type": "bytes32"
			},
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
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_gameId",
				"type": "bytes32"
			},
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
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "gameId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "wagerAmount",
				"type": "uint256"
			}
		],
		"name": "WagerAccepted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "gameId",
				"type": "bytes32"
			},
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
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "wagerAmount",
				"type": "uint256"
			}
		],
		"name": "WageredGameCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "gameId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "player1ReactionTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "player2ReactionTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "wagerAmount",
				"type": "uint256"
			}
		],
		"name": "WageredGameEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "gameId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "WinningsDistributed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "entryFee",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "gamesPlayed",
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
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getAverageReactionTime",
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
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getLosses",
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
				"internalType": "bytes32",
				"name": "_gameId",
				"type": "bytes32"
			}
		],
		"name": "getWageredGameInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player1",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "player2",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "player1ReactionTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "player2ReactionTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "wagerAmount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "gameEnded",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "winner",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "player1AcceptedWager",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "player2AcceptedWager",
						"type": "bool"
					}
				],
				"internalType": "struct ReactionGameWithWagers.WageredGame",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getWins",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "losses",
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
		"name": "owner",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "totalReactionTime",
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
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "wageredGames",
		"outputs": [
			{
				"internalType": "address",
				"name": "player1",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "player2",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "player1ReactionTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "player2ReactionTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "wagerAmount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "gameEnded",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "player1AcceptedWager",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "player2AcceptedWager",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "wagerToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
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
				"name": "",
				"type": "address"
			}
		],
		"name": "wins",
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
export default reactiongameABI;