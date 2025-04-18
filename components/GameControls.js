import React from 'react';
import { Button, ReactionPrompt, GameControlsContainer } from './styles';
import ReadyIndicator from './ReadyIndicator';

function GameControls({ isGameActive, canReact, isReacting, myReactionTime, onSubmitReaction, onStartGame }) {
    return (
        <GameControlsContainer>
            {isGameActive ? (
                <div>
                    <ReactionPrompt>React when the indicator turns green!</ReactionPrompt>
                    <ReadyIndicator ready={canReact} />
                    <Button onClick={onSubmitReaction} disabled={!canReact || isReacting || myReactionTime > 0}>
                        {isReacting ? 'Reacting...' : myReactionTime > 0 ? 'Reacted!' : 'React!'}
                    </Button>
                    {myReactionTime > 0 && <p>Your reaction time: {myReactionTime} ms</p>}
                </div>
            ) : (
                <Button onClick={onStartGame} disabled={!onStartGame}>
                    Start Game
                </Button>
            )}
        </GameControlsContainer>
    );
}

export default GameControls;