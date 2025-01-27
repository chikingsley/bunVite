# AudioWorkletNode

**Baseline Widely available**

*Secure context required:* This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.

**Note:** Although the interface is available outside secure contexts, the `BaseAudioContext.audioWorklet` property is not, thus custom `AudioWorkletProcessor`s cannot be defined outside them.

The `AudioWorkletNode` interface of the Web Audio API represents a base class for a user-defined `AudioNode`, which can be connected to an audio routing graph along with other nodes. It has an associated `AudioWorkletProcessor`, which does the actual audio processing in a Web Audio rendering thread.

Inheritance chain: EventTarget → AudioNode → AudioWorkletNode

## Constructor

### `AudioWorkletNode()`
Creates a new instance of an `AudioWorkletNode` object.

## Instance Properties

*Inherits properties from its parent, `AudioNode`*

### `AudioWorkletNode.port` (Read only)
Returns a `MessagePort` used for bidirectional communication between the node and its associated `AudioWorkletProcessor`. The other end is available under the `port` property of the processor.

### `AudioWorkletNode.parameters` (Read only)
Returns an `AudioParamMap` — a collection of `AudioParam` objects. They are instantiated during the creation of the underlying `AudioWorkletProcessor`. If the `AudioWorkletProcessor` has a static `parameterDescriptors` getter, the `AudioParamDescriptor` array returned from it is used to create `AudioParam` objects on the `AudioWorkletNode`.

## Events

### `processorerror`
Fired when an error is thrown in associated `AudioWorkletProcessor`. Once fired, the processor and consequently the node will output silence throughout its lifetime.

## Example

Here's an example of creating a custom `AudioWorkletNode` that outputs random noise:

First, define the custom `AudioWorkletProcessor` in a separate file:

```javascript
// random-noise-processor.js
class RandomNoiseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    });
    return true;
  }
}

registerProcessor("random-noise-processor", RandomNoiseProcessor);
```

Then in the main script:

```javascript
const audioContext = new AudioContext();
await audioContext.audioWorklet.addModule("random-noise-processor.js");
const randomNoiseNode = new AudioWorkletNode(
  audioContext,
  "random-noise-processor",
);
randomNoiseNode.connect(audioContext.destination);
```

# AudioWorklet

**Baseline Widely available**

*Secure context required:* This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.

The `AudioWorklet` interface of the Web Audio API is used to supply custom audio processing scripts that execute in a separate thread to provide very low latency audio processing.

The worklet's code is run in the `AudioWorkletGlobalScope` global execution context, using a separate Web Audio thread which is shared by the worklet and other audio nodes.

Access the audio context's instance of `AudioWorklet` through the `BaseAudioContext.audioWorklet` property.

## Properties and Methods

The `AudioWorklet` interface inherits properties and methods from `Worklet` but does not define any of its own.

## Events

The `AudioWorklet` interface does not have any events to which it responds.

For complete examples of custom audio node creation, refer to the `AudioWorkletNode` documentation.