import React from "react";
import ReactDOM from "react-dom";
import { DatePicker } from "antd";
import "antd/dist/antd.css";

import { subscribeToTimer } from './socket';

class HelloMessage extends React.Component {
  state = {
    timestamp: "waiting..."
  };
  componentDidMount() {
    subscribeToTimer((timestamp) => this.setState({
      timestamp
    }));
  }
  render() {
    return (
      <div>
        Hello {this.props.name} <DatePicker /> {this.state.timestamp}
      </div>
    );
  }
}

ReactDOM.render(<HelloMessage name="Jane" />, document.getElementById("app"));
