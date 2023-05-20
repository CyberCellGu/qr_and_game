(() => {
    // Define constants
    const SENSITIVITY_FACTOR = 2;
    const AUDIO_BUFFER_SIZE = 4096;
  
    // Get DOM elements
    const soundLevelElement= document.getElementById('sound-level');
    const fillPercentageElement = document.getElementById('fill-percentage');
  
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported');
      return;
    }
  
    // Access the user's microphone using getUserMedia
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Create an audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
  
        // Create an audio source from the microphone stream
        const source = audioContext.createMediaStreamSource(stream);
  
        // Create a script processor node to process the audio data
        const scriptNode = audioContext.createScriptProcessor(AUDIO_BUFFER_SIZE, 1, 1);
  
        // Connect the source to the script processor
        source.connect(scriptNode);
  
        // Connect the script processor to the audio context destination
        scriptNode.connect(audioContext.destination);
  
        //Process the audio data
        scriptNode.onaudioprocess = event => {
          // Get the sound data from the input buffer
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
  
          // Calculate the sound level (RMS value) of the input data
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
  
          // Adjust the sound level sensitivity
          let adjustedRms = rms * SENSITIVITY_FACTOR;
  
          // Limit the adjusted sound level to a maximum of 1
          adjustedRms = Math.min(adjustedRms, 1);
  
          // Update the sound level bar width and fill percentage
          soundLevelElement.style.width = `${adjustedRms * 100}%`;
          fillPercentageElement.textContent = `${Math.round(adjustedRms * 100)}%`;
  
          // Check if the sound level has reached 100%
          if (adjustedRms >= 1) {
            // Stop processing the audio
            scriptNode.disconnect();
  
            // Display a message to the user
            const messageElement = document.createElement('div');
            messageElement.textContent = 'Congratulations, you are a winner!';
            messageElement.style.color = 'green';
            messageElement.style.fontWeight = 'bold';
            messageElement.style.marginTop= '20px';
            messageElement.style.textAlign = 'center';
            document.body.appendChild(messageElement);

            setTimeout(function() {
                messageElement.remove();
              }, 4000); // 4000 milliseconds = 4 seconds              
          }
        };
      })
      .catch(error => {
        console.error(error);
      });
  })();