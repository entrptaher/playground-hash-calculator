import React from "react";
import ReactDOM from "react-dom";
import { Table, Divider, Tag, Button } from "antd";
import "antd/dist/antd.css";

import { subscribeToTimer, asyncSocket, socket } from "./socket";

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
    await asyncSocket("addOne");
    await this.getAll();
  };

  removeOne = async _id => {
    asyncSocket("removeOne", { _id });
    await this.getAll();
  };

  render() {
    const columns = [
      {
        title: "Worker ID",
        dataIndex: "_id"
      },
      {
        title: "Consumer ID",
        dataIndex: "consumerId"
      },
      {
        title: "Producer ID",
        dataIndex: "producerId"
      },
      {
        title: "Hash",
        dataIndex: "hash"
      },
      {
        title: "operation",
        dataIndex: "operation",
        render: (text, record) => (
          <Button onClick={() => this.removeOne(record._id)}>Remove</Button>
        )
      }
    ];

    return (
      <div>
        Socket inside this page: {socket.io.engine.id}
        <Button onClick={this.addOne}>Add</Button>
        <Table columns={columns} dataSource={this.state.hashes} rowKey="_id"/>
      </div>
    );
  }
}

ReactDOM.render(<HelloMessage name="Jane" />, document.getElementById("app"));
