import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.onmessage = (event) => {
      setMessage(event.data);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
      <div className="App">
        <h1>WebSocket Test</h1>
        <p>Message from server: {message}</p>
      </div>
  );
}

export default App;
