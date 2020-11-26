import React from 'react';
import ReactDom from 'react-dom';
import * as fs from 'fs';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';
import { fireEvent, render } from '@testing-library/react';
import { fileURLToPath } from 'url';


interface SquarePropsInterface {
}

interface SquareStateInterface {
  file: File;
  //fileName: string;
  //test
}



class MovieForm extends React.Component<SquarePropsInterface, SquareStateInterface> {
  constructor(props:SquarePropsInterface) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  private getFileInput(file:File): Promise<string | ArrayBuffer | null> {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () { resolve(reader.result); };
      reader.readAsBinaryString(file); // here the file can be read in different way Text, DataUrl, ArrayBuffer
  });
  }

  private manageUploadedFile(binary:string, file: File) {
    console.log('the file size is '+binary.length);
    console.log('the file name is '+file.name);
    this.setState({
      file:file,
    });
  }

  private async videoConverter(file:File):Promise<File> {
      const ffmpeg = createFFmpeg({
        log: true,
      });
      
      await ffmpeg.load();
      ffmpeg.FS('writeFile',file.name,await fetchFile(file));
      await ffmpeg.run('-i',file.name, 'audio.wav');
      return ffmpeg.FS('readFile','audio.wav');
    
  }
  private handleChange(event:React.ChangeEvent<HTMLInputElement>) {
    /*
    const ffmpeg = createFFmpeg({
      log: true,
    });
    
    ffmpeg.load();
    //@ts-ignore
    ffmpeg.FS('writeFile','video.mp4',await fetchFile(event.target.files[0]));
    ffmpeg.run('-i', 'video.mp4', 'audio.wav');
    //errorハンドリングしてない、なんでエラー
    //ffmpeg.FS('readFile','audio.wav');
    Download();
    //downloadしたい
    
    function Download() {
      return <a id="download" href="#" download="./audio.wav"></a>;
    }
    */
    if (event.target.files !== null) {
      Array.from(event.target.files).forEach(file => {
        this.getFileInput(file)
          .then((binary) => {
            if (typeof binary === 'string'){
              this.manageUploadedFile(binary,file);
            } else {
              console.log("binary is not string");
            }
          }).catch(function (reason) {
            console.log('error during upload ${reason}');
            event.target.value = '';
          })
      })
    }
  }
  handleSubmit = (event:React.FormEvent<HTMLFormElement>):void => {
    event.preventDefault();
    const result = this.videoConverter(this.state.file);
    
  }
  render() {
    return (
    <div>
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="file" accept = "video/mp4" onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
    );
  }
}

export default MovieForm;

