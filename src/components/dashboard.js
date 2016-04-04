import React, {Component} from 'react';

class Dashboard extends Component{

  static defaultProps = {
    name: 'Worldwse'
  };

	render(){
    // const {name} = this.props;
		return(<div id="layout"><div class="segment">{name}</div></div>);
	}
}

export default Dashboard;