import React from 'react';
import { ReadyIndicatorContainer } from './styles';

function ReadyIndicator({ ready }) {
    return <ReadyIndicatorContainer ready={ready} />;
}

export default ReadyIndicator;