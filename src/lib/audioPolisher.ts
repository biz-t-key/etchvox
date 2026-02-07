/**
 * Audio Polisher Utility
 * Applies professional audio processing filters to voice recordings.
 */

export async function polishAudio(blob: Blob): Promise<Blob> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create OfflineAudioContext for rendering the polished audio
    const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    // 1. Source Node
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // 2. Highpass Filter (80Hz) - Removes low-end rumble
    const hpFilter = offlineContext.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.value = 80;

    // 3. EQ Boost (4000Hz) - Increases clarity and "presence"
    const eqBoost = offlineContext.createBiquadFilter();
    eqBoost.type = 'peaking';
    eqBoost.frequency.value = 4000;
    eqBoost.Q.value = 1.0;
    eqBoost.gain.value = 3.0;

    // 4. Dynamics Compressor - Balances the volume peaks
    const compressor = offlineContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, offlineContext.currentTime);
    compressor.knee.setValueAtTime(30, offlineContext.currentTime);
    compressor.ratio.setValueAtTime(4, offlineContext.currentTime);
    compressor.attack.setValueAtTime(0.005, offlineContext.currentTime);
    compressor.release.setValueAtTime(0.05, offlineContext.currentTime);

    // 5. Normalizer / Gain Node
    const gainNode = offlineContext.createGain();
    gainNode.gain.value = 1.2; // Slight overall boost

    // Connect the chain
    source.connect(hpFilter);
    hpFilter.connect(eqBoost);
    eqBoost.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(offlineContext.destination);

    // Start rendering
    source.start(0);
    const renderedBuffer = await offlineContext.startRendering();

    // Convert AudioBuffer to WAV Blob
    return audioBufferToWav(renderedBuffer);
}

/**
 * Helper: Encodes AudioBuffer to WAV format
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // Write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved samples
    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF); // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        offset++;
    }

    return new Blob([bufferArray], { type: 'audio/wav' });

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}
