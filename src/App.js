import React, { useState, useEffect } from 'react';
import './App.css';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const ffmpeg = createFFmpeg({ log: true });


function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [mp3, setMp3] = useState();
  const [mp4, setMp4] = useState();
  const [image, setImage] = useState();
  const [site, setSite] = useState();
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState([0]);
  const [end, setEnd] = useState([9999]);
  const [videoSpeed, setVideoSpeed] = useState([1]);
  const [audioSpeed, setAudioSpeed] = useState([1]);

  const load = async () => { // FFMPEG startup
    await ffmpeg.load();
    setReady(true);
  }

  useEffect(() => { // Start FFMPEG on page load
    load();
    setSite("MP4 to GIF")
  }, [])

  const convertToGif = async () => { // Convert given mp4 file to gif form
    try {

      ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));
      setLoading(true);

      await ffmpeg.run('-i', 'test.mp4', '-t', `${end}`, '-ss', `${start}`, '-f', 'gif', 'out.gif');
      const data = ffmpeg.FS('readFile', 'out.gif');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));

      setGif(url)
      setLoading(false);
    } catch (err) { alert("Processing, please wait.") }
  }


  const convertToMp3 = async () => { // Convert given mp4 file to mp3 form
    try {

      ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));
      setLoading(true);

      await ffmpeg.run('-i', 'test.mp4', '-t', `${end}`, '-ss', `${start}`, '-f', 'mp3', 'out.mp3');
      const data = ffmpeg.FS('readFile', 'out.mp3');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/mp3' }));

      setMp3(url)
      setLoading(false);
    } catch (err) { alert("Currently processing a file") }
  }


  const convertToMp4 = async () => { // Edit properties of given mp4 file
    try {

      ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));
      setLoading(true);

      await ffmpeg.run('-i', 'test.mp4', '-t', `${end}`, '-ss', `${start}`, '-filter_complex',
        '[0:v]setpts=' + `${videoSpeed}` + '*PTS[v];[0:a]atempo=' + `${audioSpeed}` + '[a]', '-map', '[v]', '-map', '[a]', 'out.mp4');
      const data = ffmpeg.FS('readFile', 'out.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

      setMp4(url)
      setLoading(false);
    } catch (err) { alert("Currently processing a file") }
  }

  const convertMp3ToMp4 = async () => { // Change Mp3 to Mp4 file with image
    try {

      ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(video)); //Save fetched video to filesystem
      ffmpeg.FS('writeFile', 'image.jpg', await fetchFile(image)); //Save fetched image to filesystem
      setLoading(true);

      await ffmpeg.run('-i', 'image.jpg', '-i', 'audio.mp3', '-c:v', 'libx264', '-tune', 'stillimage', '-c:a', '-copy', 'out.mp4');
      const data = ffmpeg.FS('readFile', 'out.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

      setMp4(url)
      setLoading(false);
    } catch (err) { alert("Currently processing a file") }
  }


  return ready ? (

    <div className="App">
      <Router>

        <div id="mobile-error"><h1>This application does not function on mobile devices</h1></div>
        <div id="navbar-1">
          <Link className="nav-item" to="/mp34" onClick={(e) => setSite("MP4 to MP4")}>MP4 to GIF</Link>
          <Link className="nav-item" to="/" onClick={(e) => setSite("MP4 to GIF")}>MP4 to GIF</Link>
          <Link className="nav-item" to="/mp3" onClick={(e) => setSite("MP4 to MP3")}>MP4 to MP3</Link>
          <Link className="nav-item" to="/mp4" onClick={(e) => setSite("Edit MP4")}>Edit MP4</Link>
        </div>

        <h1>{site}</h1>

        <label for="file-upload" class="custom-file-upload">
          Upload file
        </label>
        <input id="file-upload" type="file" onChange={(e) => setVideo(e.target.files?.item(0))} />

        {video &&
          <>
            <br />
            <video
              controls
              width="350"
              src={URL.createObjectURL(video)}>
            </video>

            <div id="clip-length-div">
              <h3>Clip length (seconds)</h3>
              <label for="startInput" class="time-label">Start:</label>
              <input id="startInput" type="text" onChange={(e) => setStart(e.target.value)} />
              <label for="endInput" class="time-label">End:</label>
              <input id="endInput" type="text" onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div>

              <Switch>
                <Route path="/" exact>
                  <button className="button-convert" onClick={convertToGif}>Convert to GIF</button>
                  {gif && <div id="gif-container"><img alt="Output gif" src={gif} width="350" />
                    <div>
                      <a id="gif-download" href={gif} download="file">Save File</a>
                    </div>
                  </div>}
                </Route>

                <Route path="/mp34" exact>
                  <label for="image-upload" class="custom-image-upload">
                    Upload file
                  </label>
                  <input id="image-upload" type="file" onChange={(e) => setImage(e.target.files?.item(0))} />
                  <button className="button-convert" onClick={convertMp3ToMp4}>Convert Mp3 to Mp4</button>
                  {mp4 && <div id="mp4-container"><audio controls="controls" src={mp4} type="video/mp4" />
                    <div>
                      <a id="mp4-download" href={mp4} download="file">Save File</a>
                    </div>
                  </div>}
                </Route>

                <Route path="/mp3" exact>
                  <button className="button-convert" onClick={convertToMp3}>Convert to MP3</button>
                  {mp3 && <div id="mp3-container"><audio controls="controls" src={mp3} type="audio/mp3" />
                    <div>
                      <a id="gif-download" href={mp3} download="file">Save File</a>
                    </div>
                  </div>}
                </Route>

                <Route path="/mp4" exact>
                  <div id="speedButtons-div">
                    <h3>Clip speed: {audioSpeed}</h3>
                    <button className="speedButtons" type="text" onClick={(e) => setAudioSpeed("0.5") + setVideoSpeed("1.5")}>0.5x</button>
                    <button className="speedButtons" type="text" onClick={(e) => setAudioSpeed("1") + setVideoSpeed("1")}>1x</button>
                    <button className="speedButtons" type="text" onClick={(e) => setAudioSpeed("1.5") + setVideoSpeed("0.75")}>1.5x</button>
                    <button className="speedButtons" type="text" onClick={(e) => setAudioSpeed("2") + setVideoSpeed("0.5")}>2x</button>
                  </div>
                  <button className="button-convert" onClick={convertToMp4}>Convert to MP4</button>
                  {mp4 && <div id="mp4-container"><video controls="controls" src={mp4} type="video/mp4" width="350" />
                    <div>
                      <a id="mp4-download" href={mp4} download="file">Save File</a>
                    </div>
                  </div>}
                </Route>
              </Switch>
              {loading && <Loader
                type="Puff"
                color="#00BFFF"
                height={100}
                width={100}
                timeout={60000}
              />}
            </div>
          </>}
      </Router>
    </div>

  )
    :
    (
      <>
        <div id="initiateScreen">
          <h1>Initializing application</h1>
          <Loader
            type="Puff"
            color="#00BFFF"
            height={100}
            width={100}
            timeout={3000}
          />
        </div>
      </>
    );
}

export default App;
