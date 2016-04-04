import React, {Component} from 'react';

class App extends Component{

  static defaultProps = {
    name: 'Worldwse'
  };

	render(){
    	const {name} = this.props;
		return(<div><h1>Hello {name}</h1></div>);
	}

}

export default App;