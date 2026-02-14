import model from './assets/socialmedia_model.json';

export default class SpamDetector {
  constructor() {
    this.vocab = {};
    this.classes = [];
    this.classLogPrior = [];
    this.featureLogProb = [];
    this.ready = false;
  }

  async loadModel() {
    try {
      // Directly use the imported model
      this.vocab = model.vocab || {};
      this.classes = model.classes || [];
      this.classLogPrior = model.class_log_prior || [];
      this.featureLogProb = model.feature_log_prob || [];

      if (
        !this.vocab ||
        !this.classes.length ||
        !this.classLogPrior.length ||
        !this.featureLogProb.length
      ) {
        throw new Error('Model data is incomplete');
      }

      this.ready = true;
      console.log('Model loaded locally');
    } catch (error) {
      console.error('Failed to load local model:', error.message);
      throw error;
    }
  }

  tokenize(text) {
    const tokens = text.toLowerCase().split(/\W+/);
    const vector = new Array(Object.keys(this.vocab).length).fill(0);
    for (const token of tokens) {
      if (!token) continue;
      const index = this.vocab[token];
      if (index !== undefined) {
        vector[index]++;
      }
    }
    return vector;
  }

  predict(text) {
    if (!this.ready) {
      throw new Error('Model not loaded yet');
    }

    const inputVec = this.tokenize(text);

    const scores = this.classLogPrior.map((prior, classIdx) => {
      const featureProbs = this.featureLogProb[classIdx];
      let score = prior;
      for (let i = 0; i < inputVec.length; i++) {
        score += inputVec[i] * featureProbs[i];
      }
      return score;
    });

    const bestIndex = scores.indexOf(Math.max(...scores));
    return this.classes[bestIndex];
  }
}
