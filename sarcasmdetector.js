import modelData from './assets/sarcasm_model.json';  // Adjust path as needed

function textToVector(text, vocab) {
  const vector = new Array(Object.keys(vocab).length).fill(0);
  const words = text.toLowerCase().split(/\W+/);
  words.forEach(word => {
    if (word in vocab) {
      vector[vocab[word]] += 1;
    }
  });
  return vector;
}

export function predictSarcasm(text) {
  const { vocab, classes, class_log_prior, feature_log_prob } = modelData;
  const inputVec = textToVector(text, vocab);

  const logProbs = class_log_prior.map((prior, classIndex) => {
    let logProb = prior;
    inputVec.forEach((count, wordIndex) => {
      if (count > 0) {
        logProb += count * feature_log_prob[classIndex][wordIndex];
      }
    });
    return logProb;
  });

  const maxIndex = logProbs.indexOf(Math.max(...logProbs));
  return {
    label: classes[maxIndex] === 1 ? 'sarcastic' : 'not sarcastic',
    confidence: softmax(logProbs)[maxIndex]
  };
}

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(x => Math.exp(x - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}
