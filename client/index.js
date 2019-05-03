import React from "react";
import ReactDOM from "react-dom";
import { DatePicker } from "antd";
import "antd/dist/antd.css";

import { subscribeToTimer, asyncSocket } from "./socket";

class HelloMessage extends React.Component {
  state = {
    hashes: []
  };
  componentDidMount() {
    this.getAll();
    subscribeToTimer(this.updateAll);
  }

  updateAll = payload => {
    const hashes = this.state.hashes.slice(0);
    let memberIndex = hashes.findIndex(e => e._id === payload.id);
    hashes[memberIndex] = payload.data;
    this.setState({
      hashes
    });
  };

  getAll = () => {
    asyncSocket("init").then(data => {
      this.setState({ hashes: data });
    });
  };

  addOne = async () => {
    const data = await asyncSocket("addOne");
    await this.getAll()
  };

  removeOne = async _id => {
    asyncSocket("removeOne", {_id});
    await this.getAll()
  };

  render() {
    return (
      <div>
        <button onClick={this.addOne}>Add</button>
        {this.state.hashes.map(e => {
          return (
            <div key={e._id}>
              {e._id} {e.hash} <button onClick={() => this.removeOne(e._id)}>Remove</button>
            </div>
          );
        })}
      </div>
    );
  }
}

ReactDOM.render(<HelloMessage name="Jane" />, document.getElementById("app"));
