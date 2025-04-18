import styled, { keyframes } from 'styled-components';

export const GameContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
`;

export const Input = styled.input`
    padding: 10px;
    margin: 10px;
`;

export const Button = styled.button`
    padding: 10px 20px;
    margin: 10px;
    font-size: 1.1em;
    cursor: pointer;
`;

export const ResultsDisplayContainer = styled.div`
    margin-top: 20px;
    font-size: 1.5em;
    text-align: center;
`;

export const ReactionPrompt = styled.div`
    font-size: 2em;
    margin-bottom: 20px;
`;

const blink = keyframes`
    50% { opacity: 0; }
`;

export const ReadyIndicatorContainer = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: red;
    margin-bottom: 20px;
    opacity: ${({ ready }) => (ready ? 1 : 0.5)};
    background-color: ${({ ready }) => (ready ? 'green' : 'red')};
`;

export const ChatContainer = styled.div`
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
    width: 300px;
    max-height: 200px;
    overflow-y: auto;
`;

export const Message = styled.div`
    margin-bottom: 5px;
`;

export const ChatInputContainer = styled.div`
    display: flex;
    width: 300px;
`;

export const ChatInput = styled.input`
    flex-grow: 1;
    padding: 8px;
    margin-right: 5px;
`;

export const ChatButton = styled(Button)`
    padding: 8px 15px;
`;

export const GameControlsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
`;