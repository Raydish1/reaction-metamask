import React from 'react';
import { ChatContainer, Message, ChatInputContainer, ChatInput, ChatButton, Ch3} from './styles';

function GameChat({ messages, newMessage, onNewMessageChange, onSendMessage }) {
    return (
        <div>
            <Ch3>Chat with Opponent</Ch3>
            <ChatContainer>
                {messages.map((msg) => (
                    <Message key={msg.id}>
                        <strong>{msg.user.id.substring(0, 8)}...:</strong> {msg.text}
                    </Message>
                ))}
            </ChatContainer>
            <ChatInputContainer>
                <ChatInput
                    type="text"
                    placeholder="Type your message"
                    value={newMessage}
                    onChange={onNewMessageChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSendMessage(); }}
                />
                <ChatButton onClick={onSendMessage} disabled={!newMessage}>
                    Send
                </ChatButton>
            </ChatInputContainer>
        </div>
    );
}

export default React.memo(GameChat);