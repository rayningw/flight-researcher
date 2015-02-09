function assert(condition, msg) {
  if (!condition) {
    throw 'Assertion failed' + (msg ? ': ' + msg: '');
  }
}

var AIRPORT_PAIRS_URL = "/api/v1/airport_pairs";
var DATE_PAIRS_URL = "/api/v1/date_pairs";

var ParameterBox = React.createClass({

  getInitialState: function() {
    return {rows: []};
  },

  componentDidMount: function() {
    this.loadTable();
  },

  loadTable: function() {
    console.log('Loading table for: ' + this.props.label);

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({rows: data.rows});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  saveTable: function(rows) {
    console.log('Saving table for: ' + this.props.label);

    $.ajax({
      url: this.props.url,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        rows: rows
      }),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleUpdate: function(newRows) {
    console.log('Saving: ' + this.props.label + ' with:', newRows);
    this.setState({rows: newRows});
    this.saveTable(newRows);
  },

  render: function() {
    return (
      <div className="parameter-box">
        <div className="label">{this.props.label}</div>
        <Table headings={this.props.headings} rows={this.state.rows} onUpdate={this.handleUpdate} />
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
            <input ref="value1" type="text" defaultValue={this.props.values[0]}></input>
          </div>
          <div style={{width: this.props.colWidth}}>
            <input ref="value2" type="text" defaultValue={this.props.values[1]}></input>
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
  <div>
    <ParameterBox label="Airport Pairs" headings={["From", "To"]} url={AIRPORT_PAIRS_URL} />
    <ParameterBox label="Dates" headings={["Depart", "Return"]} url={DATE_PAIRS_URL} />
  </div>,
  document.getElementById('content')
);

