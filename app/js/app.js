import React from 'react';
import ReactDOM from 'react-dom';

function HelloWorld() {
    return (
        <a class="nav-link" href="#">React</a>
    );
}

ReactDOM.render(
    <HelloWorld/>, document.querySelector('#isconnected')
);