import React from 'react';
import ReactDom from 'react-dom';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
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
  handleChange = (event:React.ChangeEvent<HTMLInputElement>):void => {
    const ffmpeg = createFFmpeg({
      log: true,
    });
    const fs = require('fs');
    async () => {
      await ffmpeg.load();
      ffmpeg.FS('writeFile','video.mp4',await fetchFile(event.target.value));
      await ffmpeg.run('-i', 'video.mp4', 'audio.wav');
      const data = ffmpeg.FS('readFile', 'audio.wav');
      await fs.promises.writeFile('./test.wav',data);
      //音声変換したい
    }
      this.setState({value: event.target.value});
  }
  handleSubmit = (event:React.FormEvent<HTMLFormElement>):void => {
    
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

