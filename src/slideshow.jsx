import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import KeyHandler, { KEYUP } from 'react-key-handler';

class SlideShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { index: 0 };

    this.keyPressed = this.keyPressed.bind(this);
    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
  }

  keyPressed(e) {
    console.log(e.key);
  }

  prev() {
    if (this.state.index-1 >= 0) {
      this.setState({ index: this.state.index-1 });
    }
  }

  next() {
    if (this.state.index+1 < this.props.pages.length) {
      this.setState({ index: this.state.index+1 });
    }
  }

  render() {
    const page = this.props.pages[this.state.index];

    return (
      <div>
        <KeyHandler keyEventName={KEYUP} keyValue="ArrowLeft" onKeyHandle={this.prev} />
        <KeyHandler keyEventName={KEYUP} keyValue="h" onKeyHandle={this.prev} />
        <KeyHandler keyEventName={KEYUP} keyValue="k" onKeyHandle={this.prev} />
        <KeyHandler keyEventName={KEYUP} keyValue="ArrowRight" onKeyHandle={this.next} />
        <KeyHandler keyEventName={KEYUP} keyValue="l" onKeyHandle={this.next} />
        <KeyHandler keyEventName={KEYUP} keyValue="j" onKeyHandle={this.prev} />

        <ReactCSSTransitionGroup
            transitionName="example"
            transitionAppear={true}
            transitionAppearTimeout={200}
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
          <div className="page" key={page.id}>
            <div dangerouslySetInnerHTML={{ __html: page.contents }} />
          </div>
        </ReactCSSTransitionGroup>

        <div className="pager">
          <button onClick={this.prev}>Prev</button>
          <span>{this.state.index+1} / {this.props.pages.length}</span>
          <button onClick={this.next}>Next</button>
        </div>
      </div>
    );
  }
}

const mainElement = document.getElementById("main");
const pages = JSON.parse(mainElement.dataset.contents);

ReactDOM.render(<SlideShow pages={pages} />, mainElement);
