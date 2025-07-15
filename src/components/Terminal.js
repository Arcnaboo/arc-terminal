import React, { useState, useEffect, useRef } from 'react';
import { commandProcessor } from '../utils/commandProcessor';
import { asciiLogo } from '../utils/asciiArt';
import './Terminal.css';

const Terminal = () => {
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    // Display welcome message and ASCII logo on load
    const welcomeMessage = {
      type: 'system',
      content: asciiLogo,
      timestamp: new Date().toLocaleTimeString()
    };
    
    const systemInfo = {
      type: 'system',
      content: 'Arc Corp Terminal v2.1.0\nWelcome to the future of computing.\n\nType "help" for available commands.',
      timestamp: new Date().toLocaleTimeString()
    };

    setTimeout(() => {
      setHistory([welcomeMessage, systemInfo]);
      setIsLoading(false);
    }, 1000);

    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

useEffect(() => {
  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: "smooth" // or "auto" if you want instant jump
      });
    }
  };

  // Short delay ensures DOM renders
  const timeout = setTimeout(scrollToBottom, 30);

  return () => clearTimeout(timeout);
}, [history]);



  useEffect(() => {
    // Keep input focused
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleCommand = (command) => {
    if (command.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString();
    
    // Add command to history
    const commandEntry = {
      type: 'command',
      content: command,
      timestamp
    };

    // Process command and get response
    const response = commandProcessor(command.trim());
    const responseEntry = {
      type: 'response',
      content: response,
      timestamp
    };

    setHistory(prev => [...prev, commandEntry, responseEntry]);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Handle special commands
    if (command.trim().toLowerCase() === 'exit') {
      setTimeout(() => {
        window.location.href = 'https://akgur.com/landing.html';
      }, 1000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for commands
      const commands = ['help', 'roadmap', 'synaptron', 'arcos', 'deck', 'email', 'ascii', 'exit'];
      const matching = commands.filter(cmd => cmd.startsWith(currentInput.toLowerCase()));
      if (matching.length === 1) {
        setCurrentInput(matching[0]);
      }
    }
  };

  const renderHistoryItem = (item, index) => {
    if (item.type === 'command') {
      return (
        <div key={index} className="terminal-line command-line">
          <span className="prompt">user@arccorp:~$ </span>
          <span className="command">{item.content}</span>
        </div>
      );
    } else if (item.type === 'response') {
      return (
        <div key={index} className="terminal-line response-line">
          <pre className="response-content">{item.content}</pre>
        </div>
      );
    } else if (item.type === 'system') {
      return (
        <div key={index} className="terminal-line system-line">
          <pre className="system-content">{item.content}</pre>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="terminal-container">
        <div className="terminal-screen">
          <div className="loading-screen">
            <div className="loading-text">
              <span className="blinking">█</span> Initializing Arc Corp Terminal...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-container">
      <div className="terminal-screen" ref={terminalRef}>
        <div className="terminal-header">
          <div className="window-controls">
            <div className="control close"></div>
            <div className="control minimize"></div>
            <div className="control maximize"></div>
          </div>
          <div className="terminal-title">Arc Corp Terminal</div>
        </div>
        
        <div className="terminal-body">
          {history.map((item, index) => renderHistoryItem(item, index))}
          
          <div className="terminal-line current-line">
            <span className="prompt">user@arccorp:~$ </span>
            <span className="cursor blinking">█</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              autoComplete="off"
              spellCheck="false"
            />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;