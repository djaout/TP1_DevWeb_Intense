
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

   </style>
  <video id="maVideo" width="620" height="440" src="myComponents/assets/imgs/LesDalton.mp4" controls  type="video/mp4">
  </video>
  
<section >
<div class="controls">
    <label>60Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 0);"></input>
  <output id="gain0">0 dB</output>
  </div>
  <div class="controls">
    <label>170Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 1);"></input>
<output id="gain1">0 dB</output>
  </div>
  <div class="controls">
    <label>350Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 2);"></input>
<output id="gain2">0 dB</output>
  </div>
  <div class="controls">
    <label>1000Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 3);"></input>
<output id="gain3">0 dB</output>
  </div>
  <div class="controls">
    <label>3500Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 4);"></input>
<output id="gain4">0 dB</output>
  </div>
  <div class="controls">
    <label>10000Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 5);"></input>
<output id="gain5">0 dB</output>
  </div>
</section>

<section>
  <div class="topnav">
      <button  id="playButton" type="button" class="btn btn-outline-secondary" onclick="video.play();">play</button>
      <button id="pauseButton" type="button" class="btn btn-outline-secondary" onclick="video.pause();">pause</button>
  
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
    //buil an equalizer with multiple biquad filters

    var ctx = window.AudioContext || window.webkitAudioContext;
    var context = new ctx();
    this.video = this.shadowRoot.querySelector("#maVideo");
    this.video.loop = true;

    var sourceNode = context.createMediaElementSource(this.video);

    this.video.onplay = function() {
      context.resume();
    }
    
    this.declareListeners();
    this.declareListenersPause();
    
    // create the equalizer. It's a set of biquad Filters
    
    var filters = [];
    
        // Set filters
        [60, 170, 350, 1000, 3500, 10000].forEach(function(freq, i) {
          var eq = context.createBiquadFilter();
          eq.frequency.value = freq;
          eq.type = "peaking";
          eq.gain.value = 0;
          filters.push(eq);
        });
    
     // Connect filters in serie
       sourceNode.connect(filters[0]);
       for(var i = 0; i < filters.length - 1; i++) {
          filters[i].connect(filters[i+1]);
        }
    
    // connect the last filter to the speakers
    filters[filters.length - 1].connect(context.destination);
    //this.changeGain(0,1); this.changeGain(0,2);this.changeGain(0,3);this.changeGain(0,4);this.changeGain(0,5);
  }
  
  changeGain(sliderVal,nbFilter) {
    var value = parseFloat(sliderVal);
    this.filters[nbFilter].gain.value = value;
    
    // update output labels
    var output = document.querySelector("#gain"+nbFilter);
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
        e.src = this.basePath  + "/" + imagePath;
        //console.log("After fix : wc src as " + e.getAttribute("src"));
			}
		});
  }
  
  declareListeners() {
    this.shadowRoot.querySelector("#playButton").addEventListener("click", (event) => {
      this.play();
    });

    this.shadowRoot
      .querySelector("#knob-1")
      .addEventListener("input", (event) => {
        this.setVolume(event.target.value);
      });
  }

  declareListenersPause() {
    this.shadowRoot.querySelector("#pauseButton").addEventListener("click", (event) => {
      this.pause();
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

  pause(){
    this.video.pause();
  }
}



customElements.define("my-audioplayer", MyAudioPlayer);

