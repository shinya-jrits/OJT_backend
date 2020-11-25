import React from 'react';
import ReactDom from 'react-dom';
import * as fs from 'fs';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';
import { render } from '@testing-library/react';


interface SquarePropsInterface {
  //value: String;
  fileInput: FileList;
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
    this.fileInput = React.createRef();
  }
  handleChange = async (event:React.ChangeEvent<HTMLInputElement>):Promise<void> => {
    const ffmpeg = createFFmpeg({
      log: true,
    });
    
    await ffmpeg.load();
    //@ts-ignore
    ffmpeg.FS('writeFile','video.mp4',await fetchFile(event.target.files[0]));
    await ffmpeg.run('-i', 'video.mp4', 'audio.wav');
    //errorハンドリングしてない、なんでエラー
    //ffmpeg.FS('readFile','audio.wav');
    Download();
    //downloadしたい
    
    function Download() {
      return <a id="download" href="#" download="./audio.wav"></a>;
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
          <input type="file" accept = "video/mp4" value={this.state.value} onChange={ (e) => this.handleChange(e.target.files)} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
    );
  }
}

export default MovieForm;

