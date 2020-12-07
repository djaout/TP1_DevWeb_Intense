
import './lib/webaudio-controls.js';

const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
  return `${base}`;
};



const template = document.createElement("template");
template.innerHTML = `
  <style>
  .section{
    text-align: center;
}
 button{
     background-color:rgb(224,255,255);
 }
 div.controls label {
  display: inline-block;
  text-align: center;
  width: 50px;
}
   </style>
  <video id="maVideo" width="620" height="440" src="myComponents/assets/imgs/LesDalton.mp4" controls  type="video/mp4">
  </video>
  
<section >
<div class="controls">
    <label>60Hz</label>
    <input id="gn0" type="range" value="0" step="1" min="-30" max="30"></input>
  <output id="gain0">0 dB</output>
  </div>
  <div class="controls">
    <label>170Hz</label>
    <input id="gn1" type="range" value="0" step="1" min="-30" max="30" ></input>
<output id="gain1">0 dB</output>
  </div>
  <div class="controls">
    <label>350Hz</label>
    <input id="gn2"  type="range" value="0" step="1" min="-30" max="30" ></input>
<output id="gain2">0 dB</output>
  </div>
  <div class="controls">
    <label>1000Hz</label>
    <input id="gn3" type="range" value="0" step="1" min="-30" max="30" ></input>
<output id="gain3">0 dB</output>
  </div>
  <div class="controls">
    <label>3500Hz</label>
    <input id="gn4" type="range" value="0" step="1" min="-30" max="30"></input>
<output id="gain4">0 dB</output>
  </div>
  <div class="controls">
    <label>10000Hz</label>
    <input id="gn5" type="range" value="0" step="1" min="-30" max="30"></input>
<output id="gain5">0 dB</output>
  </div>
</section>

<section>
  <div class="topnav">
      <button  id="playButton" type="button" class="btn btn-outline-secondary">play</button>
      <button id="pauseButton" type="button" class="btn btn-outline-secondary">pause</button>
  
    </div>
    <webaudio-knob id="knob-1" src="./assets/imgs/button.png" min="0" max="1" step="0.10"></webaudio-knob>
</section>
        `;

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.volume = 1;
    this.attachShadow({ mode: "open" });
    //this.shadowRoot.innerHTML = template;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.basePath = getBaseURL(); // url absolu du composant
    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePaths();
  }

  connectedCallback() {
    this.video = this.shadowRoot.querySelector("#maVideo");
    this.video.loop = true;
    //buil an equalizer with multiple biquad filters
    let audioContext = new AudioContext();
    let playerNode = audioContext.createMediaElementSource(this.video); // noeud speakers
    this.filters = [];


    let mediaElement = this.shadowRoot.getElementById('maVideo');
    mediaElement.onplay = (e) => { audioContext.resume(); }

    // fix for autoplay policy
    mediaElement.addEventListener('play', () => audioContext.resume());

    // Set filters
    [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
      var eq = audioContext.createBiquadFilter();
      eq.frequency.value = freq;
      eq.type = "peaking";
      eq.gain.value = 0;
      this.filters.push(eq);
    });
    // Connect filters in serie
    playerNode.connect(this.filters[0]);
    for (var i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1]);
    }

    this.filters[this.filters.length - 1].connect(audioContext.destination);
    this.declareListeners();

  }

  changeGain(sliderVal, nbFilter) {
    var value = parseFloat(sliderVal);
    this.filters[nbFilter].gain.value = value;

    // update output labels
    var output = this.shadowRoot.querySelector("#gain" + nbFilter);
    output.value = value + " dB";
  }

  fixRelativeImagePaths() {
    // change webaudiocontrols relative paths for spritesheets to absolute
    let webaudioControls = this.shadowRoot.querySelectorAll(
      'webaudio-knob, webaudio-slider, webaudio-switch, img'
    );
    webaudioControls.forEach((e) => {
      let currentImagePath = e.getAttribute('src');
      if (currentImagePath !== undefined) {
        //console.log("Got wc src as " + e.getAttribute("src"));
        let imagePath = e.getAttribute('src');
        //e.setAttribute('src', this.basePath  + "/" + imagePath);
        e.src = this.basePath + "/" + imagePath;
        //console.log("After fix : wc src as " + e.getAttribute("src"));
      }
    });
  }

  declareListeners() {
    this.shadowRoot.querySelector("#playButton").addEventListener("click", (event) => {
      this.play();
    });

    this.shadowRoot.querySelector("#pauseButton").addEventListener("click", (event) => {
      this.pause();
    });

    this.shadowRoot.querySelector("#gn0").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 0);
    });

    this.shadowRoot.querySelector("#gn1").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 1);
    });

    this.shadowRoot.querySelector("#gn2").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 2);
    });
    this.shadowRoot.querySelector("#gn3").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 3);
    });

    this.shadowRoot.querySelector("#gn4").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 4);
    });

    this.shadowRoot.querySelector("#gn5").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 5);
    });


    this.shadowRoot
      .querySelector("#knob-1")
      .addEventListener("input", (event) => {
        this.setVolume(event.target.value);
      });
  }


  // API
  setVolume(val) {
    this.video.volume = val;
  }

  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }

  mute() {
    this.video.muted() = true;
  }
}



customElements.define("my-audioplayer", MyAudioPlayer);

