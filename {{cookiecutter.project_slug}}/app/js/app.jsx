{% if cookiecutter.use_bootstrap == 'y' %}const jQuery = require('jquery');
const Popper = require('popper.js');
// export for others scripts to use
window.$ = jQuery;
window.jQuery = jQuery;
window.Popper = Popper;

require('bootstrap');
{% endif %}
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
