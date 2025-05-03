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
    border: 2px solid #000;
    border-radius: 4px;
    height: 200px; 
    overflow-y: auto;
    padding: 10px;
    margin-right:10px;
    background-color:rgb(173, 215, 249);
`;

export const Ch3 = styled.h3`
text-align:center;
`;
export const Message = styled.div`
    padding: 8px 0;
    border-bottom: 0px solid #eee;
    &:last-child {
        border-bottom: none;
    }
    strong {
        font-weight: bold;
        margin-right: 5px;
    }
`;

export const ChatInputContainer = styled.div`
    display: flex;
    margin-top: 10px;
    margin-right:10px;
`;

export const ChatInput = styled.input`
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
`;

export const ChatButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 1rem;
    &:hover {
        background-color: #0056b3;
    }
    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;
export const GameControlsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
`;