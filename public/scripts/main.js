function assert(condition, msg) {
  if (!condition) {
    throw 'Assertion failed' + (msg ? ': ' + msg: '');
  }
}

var AIRPORT_PAIRS_URL = "/api/v1/airport_pairs";
var DATE_PAIRS_URL = "/api/v1/date_pairs";

var App = React.createClass({

  getInitialState: function() {
    return {
      airportPairs: [],
      datePairs: []
    };
  },

  componentDidMount: function() {
    this.loadTable('airportPairs', this.props.airportPairsUrl);
    this.loadTable('datePairs', this.props.datePairsUrl);
  },

  loadTable: function(key, url) {
    console.log('Loading table for: ' + key);

    $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
        var newState = {};
        newState[key] = data.rows;
        this.setState(newState);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  saveTable: function(key, url, rows) {
    console.log('Saving table for: ' + key);

    $.ajax({
      url: url,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        rows: rows
      }),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var makeHandleUpdate = function(key, url) {
      return function(newRows) {
        console.log('Updating: ' + key + ' with:', newRows);

        var newState = {};
        newState[key] = newRows;
        this.setState(newState);

        this.saveTable(key, url, newRows);
      }.bind(this);
    }.bind(this);

    return (
      <div>
        <ParameterBox label="Airport Pairs"
                      headings={["From", "To"]}
                      rows={this.state.airportPairs}
                      onUpdate={makeHandleUpdate('airportPairs', this.props.airportPairsUrl)}
                      type="text" />
        <ParameterBox label="Dates"
                      headings={["Depart", "Return"]}
                      rows={this.state.datePairs}
                      onUpdate={makeHandleUpdate('datePairs', this.props.datePairsUrl)}
                      type="date" />
        <GoBox airportPairs={this.state.airportPairs} datePairs={this.state.datePairs} />
      </div>
    );
  }

});

var GoBox = React.createClass({

  generateUrls: function() {
    var urls = [];
    this.props.airportPairs.forEach(function(airportPair) {
      this.props.datePairs.forEach(function(datePair) {
        var url = 'https://www.google.com/flights/#search;f=' +
                  airportPair.values[0] + ';t=' + airportPair.values[1] + ';d=' +
                  datePair.values[0] + ';r=' + datePair.values[1];
        urls.push(url);
      }, this);
    }, this);
    return urls;
  },

  handleOpenAll: function() {
    this.generateUrls().forEach(function(url) {
      window.open(url, '_blank');
    }, this);
  },

  render: function() {
    var linkNodes = this.generateUrls().map(function(url) {
      return (
        <li><a href={url} target='_blank'>{url}</a></li>
      );
    });

    return (
      <div className="go-box">
        <div className="heading">Generated URLs</div>
        <ul>
          {linkNodes}
        </ul>
        <div className="open-all">
          <div>This will open {linkNodes.length} tabs (you may have to disable your popup blocker):</div>
          <button onClick={this.handleOpenAll}>Open All</button>
        </div>
      </div>
    );
  }

});

var ParameterBox = React.createClass({

  render: function() {
    return (
      <div className="parameter-box">
        <div className="label">{this.props.label}</div>
        <Table headings={this.props.headings} rows={this.props.rows} type={this.props.type} onUpdate={this.props.onUpdate} />
      </div>
    );
  }

});

var TableRow = React.createClass({

  getInitialState: function() {
    return {isEdit: this.props.isEdit}
  },

  handleEdit: function(event) {
    assert(!this.state.isEdit);
    this.setState({isEdit: true});
  },

  handleSave: function(event) {
    assert(this.state.isEdit);

    var newValues = [
      this.refs.value1.getDOMNode().value.trim(),
      this.refs.value2.getDOMNode().value.trim()
    ];

    if (!newValues[0] || !newValues[1]) {
      return;
    }
    
    this.setState({isEdit: false});
    this.props.onUpdate(newValues);
  },

  handleDelete: function(event) {
    assert(!this.state.isEdit);
    this.props.onDelete();
  },

  render: function() {
    if (this.state.isEdit) {
      return (
        <div className="row">
          <div style={{width: this.props.colWidth}}>
            <input ref="value1" type={this.props.type} defaultValue={this.props.values[0]}></input>
          </div>
          <div style={{width: this.props.colWidth}}>
            <input ref="value2" type={this.props.type} defaultValue={this.props.values[1]}></input>
          </div>
          <div className="actions" style={{width: this.props.actionsColWidth}}>
            <a href="#" className="action" onClick={this.handleSave}>Save</a>
          </div>
        </div>
      )
    }
    else {
      return (
        <div className="row">
          <div ref="col1" style={{width: this.props.colWidth}}>{this.props.values[0]}</div>
          <div ref="col2" style={{width: this.props.colWidth}}>{this.props.values[1]}</div>
          <div className="actions" style={{width: this.props.actionsColWidth}}>
            <a href="#" className="action" onClick={this.handleEdit}>Edit</a>
            <a href="#" className="action" onClick={this.handleDelete}>Delete</a>
          </div>
        </div>
      );
    }
  }

});

var Table = React.createClass({

  render: function() {
    assert(this.props.headings.length == 2);

    var ACTIONS_COL_WIDTH = 100;
    
    var width = this.props.width || 300;
    var colWidth = width / 2;

    // Existing rows
    var rowNodes = this.props.rows.map(function(row, idx) {
      var handleUpdate = function(newValues) {
        var newRows = this.props.rows.slice();
        newRows[idx] = {
          values: newValues
        };
        this.props.onUpdate(newRows);
      }.bind(this);

      var handleDelete = function() {
        var newRows = this.props.rows.slice();
        newRows.splice(idx, 1);
        this.props.onUpdate(newRows);
      }.bind(this);

      return <TableRow key={idx}
                       type={this.props.type}
                       colWidth={colWidth}
                       actionsColWidth={ACTIONS_COL_WIDTH}
                       values={row.values}
                       onUpdate={handleUpdate}
                       onDelete={handleDelete} />
    }.bind(this));

    // New row to add
    var handleAdd = function(values) {
      var newRows = this.props.rows.slice();
      newRows.push({values: values});
      this.props.onUpdate(newRows);
    }.bind(this);

    var addRowNode = (
      <TableRow key={this.props.rows.length}
                type={this.props.type}
                colWidth={colWidth}
                actionsColWidth={ACTIONS_COL_WIDTH}
                values={['', '']}
                onUpdate={handleAdd}
                onDelete={$.noop}
                isEdit={true} />
    );

    // Heading and rows
    return (
      <div className="table">
        <div className="header row">
          <div style={{width: colWidth}}>{this.props.headings[0]}</div>
          <div style={{width: colWidth}}>{this.props.headings[1]}</div>
          <div style={{width: ACTIONS_COL_WIDTH}}>&nbsp;</div>
        </div>

        {rowNodes}

        {addRowNode}

      </div>
    );
  }

});

React.render(
  <App airportPairsUrl={AIRPORT_PAIRS_URL} datePairsUrl={DATE_PAIRS_URL} />,
  document.getElementById('content')
);

