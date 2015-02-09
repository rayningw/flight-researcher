function assert(condition, msg) {
  if (!condition) {
    throw 'Assertion failed' + (msg ? ': ' + msg: '');
  }
}

var AIRPORT_PAIRS_URL = "/api/v1/airport_pairs";
var DATE_PAIRS_URL = "/api/v1/date_pairs";

var ParameterBox = React.createClass({

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

  getInitialState: function() {
    return {rows: []};
  },

  componentDidMount: function() {
    this.loadTable();
  },

  render: function() {
    return (
      <div className="parameter-box">
        <div className="label">{this.props.label}</div>
        <Table headings={this.props.headings} rows={this.state.rows} />
      </div>
    );
  }

});

var Table = React.createClass({

  render: function() {
    assert(this.props.headings.length == 2);
    
    var width = this.props.width || 300;
    var colWidth = width / 2;

    var rowNodes = this.props.rows.map(function(row) {
      return (
        <div className="row">
          <div style={{width: colWidth}}>{row.values[0]}</div>
          <div style={{width: colWidth}}>{row.values[1]}</div>
        </div>
      );
    });

    return (
      <div className="table">
        <div className="header row">
          <div style={{width: colWidth}}>{this.props.headings[0]}</div>
          <div style={{width: colWidth}}>{this.props.headings[1]}</div>
        </div>

        {rowNodes}
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

