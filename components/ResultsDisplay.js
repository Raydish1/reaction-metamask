import React from 'react';
import { ResultsDisplayContainer, Button } from './styles';

function ResultsDisplay({ gameResult, myReactionTime, opponentReactionTime, onEndGame, onPlayAgain }) {
    return (
        <ResultsDisplayContainer key={gameResult}>
            <h2>Game Over!</h2>
            <p>{gameResult}</p>
            {myReactionTime > 0 && <p>Your Reaction Time: {myReactionTime} ms</p>}
            {opponentReactionTime > 0 && <p>Opponent's Reaction Time: {opponentReactionTime} ms</p>}
            <Button onClick={onEndGame}>End Game</Button>
            <Button onClick={onPlayAgain}>Play Again</Button>
        </ResultsDisplayContainer>
    );
}

export default ResultsDisplay;