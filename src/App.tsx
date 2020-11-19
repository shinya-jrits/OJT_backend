import React from 'react';
import ReactDom from 'react-dom';
import './App.css';


interface SquarePropsInterface {
  //value: String;
}

interface SquareStateInterface {
  value: string;
}

class MovieForm extends React.Component<SquarePropsInterface, SquareStateInterface> {
  constructor(props:SquarePropsInterface) {
    super(props);
    this.state = {value:''}
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange = (event:any) => {
    this.setState({value: event.target.value});
    
  }
  handleSubmit = (event:any) => {
    
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="file" accept = "video/mp4" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default MovieForm;

