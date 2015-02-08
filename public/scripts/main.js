function assert(condition, msg) {
  if (!condition) {
    throw 'Assertion failed' + (msg ? ': ' + msg: '');
  }
}

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

var DUMMY_AIRPORT_PAIRS = [
  {values: ['SFO', 'BWI']},
  {values: ['OAK', 'BWI']},
  {values: ['BWI', 'SFO']},
  {values: ['BWI', 'OAK']}
];

React.render(
  <Table headings={["From", "To"]} rows={DUMMY_AIRPORT_PAIRS} />,
  document.getElementById('content')
);
