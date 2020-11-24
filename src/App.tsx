import React from 'react';
import ReactDom from 'react-dom';
import fs from 'fs';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';
import { render } from '@testing-library/react';


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
  handleChange = (event:React.ChangeEvent<HTMLInputElement>):void => {
    const ffmpeg = createFFmpeg({
      log: true,
    });
    
    async () => { //kakikata 無名関数はこういう書き方はできない,
      await ffmpeg.load();
      ffmpeg.FS('writeFile','video.mp4',await fetchFile(event.target.value));
      await ffmpeg.run('-i', 'video.mp4', 'audio.wav');
      const data = ffmpeg.FS('readFile', 'audio.wav');
      await fs.promises.writeFile('./test.wav',data);
      Download();
      //downloadしたい
    }
    function Download() {
      return <a id="download" href="#" download="./test.wav"></a>;
    }
      this.setState({value: event.target.value});
  }
  handleSubmit = (event:React.FormEvent<HTMLFormElement>):void => {
    
  }
  render() {
    return (
    <div>
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="file" accept = "video/mp4" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
    );
  }
}

export default MovieForm;

