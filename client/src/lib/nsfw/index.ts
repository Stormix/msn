// Heavily based on: https://github.com/infinitered/nsfwjs/
// License: MIT
// Author: Infinite Red, Inc.

import * as tf from '@tensorflow/tfjs'

export enum NSFW_CLASSES {
  Drawing,
  Hentai,
  Neutral,
  Porn,
  Sexy
}

interface ModelOptions {
  size: number
  type?: string
}

export type predictionType = {
  className: (typeof NSFW_CLASSES)[keyof typeof NSFW_CLASSES]
  probability: number
}

const BASE_PATH = 'https://d1zv2aa70wpiur.cloudfront.net/tfjs_quant_nsfw_mobilenet'
const IMAGE_SIZE = 224 // default to Mobilenet v2

export const loadModel = async (base = BASE_PATH, options: ModelOptions = { size: IMAGE_SIZE }) => {
  // Default size is IMAGE_SIZE - needed if just type option is used
  options.size = options.size || IMAGE_SIZE
  const nsfwnet = new NSFWJS(base, options)
  await nsfwnet.load()
  return nsfwnet
}

const getTopKClasses = async (logits: tf.Tensor2D, topK: number): Promise<Array<predictionType>> => {
  const values = await logits.data()

  const valuesAndIndices = []
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({ value: values[i], index: i })
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value
  })
  const topkValues = new Float32Array(topK)
  const topkIndices = new Int32Array(topK)
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value
    topkIndices[i] = valuesAndIndices[i].index
  }

  const topClassesAndProbs: predictionType[] = []
  for (let i = 0; i < topkIndices.length; i++) {
    const index = topkIndices[i]
    topClassesAndProbs.push({
      className: Object.values(NSFW_CLASSES)[index] as NSFW_CLASSES, // TODO: double check this
      probability: topkValues[i]
    })
  }
  return topClassesAndProbs
}

export class NSFWJS {
  public endpoints: string[] = []
  public model: tf.LayersModel | tf.GraphModel | undefined

  private options: ModelOptions
  private path: string
  private intermediateModels: { [layerName: string]: tf.LayersModel } = {}
  private normalizationOffset: tf.Scalar

  constructor(cdnUrl: string, options: ModelOptions) {
    this.options = options
    this.normalizationOffset = tf.scalar(255)
    this.path = `${cdnUrl}/model.json`
  }

  async load() {
    const { size, type } = this.options
    if (type === 'graph') {
      this.model = await tf.loadGraphModel(this.path)
    } else {
      // this is a Layers Model
      this.model = await tf.loadLayersModel(this.path)
      this.endpoints = this.model.layers.map((l) => l.name)
    }

    // Warmup the model.
    const result = tf.tidy(() => this.model?.predict(tf.zeros([1, size, size, 3]))) as tf.Tensor
    await result.data()
    result.dispose()
  }

  /**
   * Infers through the model. Optionally takes an endpoint to return an
   * intermediate activation.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   * video, or canvas.
   * @param endpoint The endpoint to infer through. If not defined, returns
   * logits.
   */
  infer(
    img: tf.Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    endpoint?: string
  ): tf.Tensor {
    if (endpoint != null && this.endpoints.indexOf(endpoint) === -1) {
      throw new Error(`Unknown endpoint ${endpoint}. Available endpoints: ` + `${this.endpoints}.`)
    }

    return tf.tidy(() => {
      if (!(img instanceof tf.Tensor)) {
        img = tf.browser.fromPixels(img)
      }

      // Normalize the image from [0, 255] to [0, 1].
      const normalized = img.toFloat().div(this.normalizationOffset) as tf.Tensor3D

      // Resize the image to
      let resized = normalized
      const { size } = this.options
      // check width and height if resize needed
      if (img.shape[0] !== size || img.shape[1] !== size) {
        const alignCorners = true
        resized = tf.image.resizeBilinear(normalized, [size, size], alignCorners)
      }

      // Reshape to a single-element batch so we can pass it to predict.
      const batched = resized.reshape([1, size, size, 3])

      let model: tf.LayersModel | tf.GraphModel
      if (endpoint == null) {
        model = this.model!
      } else {
        if ((this.model as tf.LayersModel)?.layers && this.intermediateModels[endpoint] == null) {
          const layer = (this.model as tf.LayersModel).layers.find((l) => l.name === endpoint)!
          this.intermediateModels[endpoint] = tf.model({
            inputs: (this.model as tf.LayersModel).inputs,
            outputs: layer.output
          })
        }
        model = this.intermediateModels[endpoint]
      }

      // return logits
      return model.predict(batched) as tf.Tensor2D
    })
  }

  /**
   * Classifies an image from the 5 classes returning a map of
   * the most likely class names to their probability.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   * video, or canvas.
   * @param topk How many top values to use. Defaults to 5
   */
  async classify(
    img: tf.Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    topk = 5
  ): Promise<Array<predictionType>> {
    const logits = this.infer(img) as tf.Tensor2D
    const classes = await getTopKClasses(logits, topk)
    logits.dispose()
    return classes
  }
}
