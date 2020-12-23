import React from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';
import axios from 'axios';

interface convertVideoToAudioStateInterface {
  videoFile: File;
  EmailAddress: string;
}

class MovieForm extends React.Component<{}, convertVideoToAudioStateInterface> {
  constructor(props: {}) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private async convertVideoToAudio(videoFile: File): Promise<File> {
    const ffmpeg = createFFmpeg({
      log: true,
    });
    await ffmpeg.load();
    const fetchedFile = await fetchFile(videoFile);
    ffmpeg.FS('writeFile', videoFile.name, fetchedFile);
    await ffmpeg.run('-i', videoFile.name, 'audio.wav');
    return ffmpeg.FS('readFile', 'audio.wav');
  }
  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files != null) {
      Array.from(event.target.files).forEach(file => {
        this.setState({
          videoFile: file,
        });
      })
    }
    if (event.target.value != null) {
      this.setState({
        EmailAddress: event.target.value,
      });
    }
  }
  handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {

    const result = this.convertVideoToAudio(this.state.videoFile);

    result.then((file) => {
      //postリクエスト
      console.log("post sending ")
      const params = new FormData();
      params.append('mail', this.state.EmailAddress);
      params.append('file', file);

      axios.post("http://localhost:4000/api/", params, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      })
        .then(function (responese) {
          console.log("post request success");
          window.alert("送信に成功しました");
        })
        .then(function (error) {
          console.log(console.error);
          window.alert("送信に失敗しました")
        });
    });

    //リリース前には削除予定
    /*result.then((result) => {
      const url = window.URL.createObjectURL(new Blob([result]));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.setAttribute('download', 'audio.wav');
      anchor.click();

    })*/
    event.preventDefault();//ページ遷移を防ぐため
  }
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            <p>メールアドレス:<input type="email" name="mail" onChange={this.handleChange} /></p>
            <p>ファイル:<input type="file" accept="video/mp4" onChange={this.handleChange} /></p>
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default MovieForm;

