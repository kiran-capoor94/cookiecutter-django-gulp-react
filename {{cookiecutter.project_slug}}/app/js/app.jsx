import React from 'react';
import ReactDOM from 'react-dom';

const App = () => (
  <div id="content">
    <h1>Hello, React</h1>
  </div>
);

ReactDOM.render(
  <App />,
  document.getElementById('app'),
);
