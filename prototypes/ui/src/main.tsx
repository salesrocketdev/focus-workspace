import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/inter';
import './styles.css';
import './editor.css';
import './layout.css';
import './icons.css';
import './ui.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);