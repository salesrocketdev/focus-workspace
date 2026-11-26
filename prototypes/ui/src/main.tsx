import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/inter';
import './styles.css';
import './editor.css';
import './layout.css';
import './icons.css';
import './ui.css';
import './grid.css';
import './calendar.css';
import './activities.css';
import './preferences.css';
import './history.css';
import './appearance.css';
import './form-controls.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);