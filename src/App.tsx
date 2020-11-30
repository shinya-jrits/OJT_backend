import React from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';



interface SquarePropsInterface {
}

interface SquareStateInterface {
  file: File;
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

    const result = this.videoConverter(this.state.file);
    result.then((result) => {
      const data = window.URL.createObjectURL(new Blob([result]));
      const url = document.createElement('a');
      url.href=data;
      url.setAttribute('download','audio.wav');
      url.click();
    })
    event.preventDefault();//ページ遷移を防ぐため
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

