import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import Dash from './components/dashboard';
import vplayer from './components/vplayer'; 

const container = document.getElementById('root');

ReactDOM.render(<vplayer url='http://006.mp4'/>,container);
