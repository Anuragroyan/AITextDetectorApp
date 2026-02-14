import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
} from 'react-native';

import { predictSarcasm } from './sarcasmdetector';
import SpamDetector from './socialmediaDetector';

export default function App() {
  const [text, setText] = useState('');
  const [sarcasmResult, setSarcasmResult] = useState(null);
  const [platformResult, setPlatformResult] = useState('');
  const [loading, setLoading] = useState(true);
  const detectorRef = useRef(null);

  useEffect(() => {
    const initModel = async () => {
      detectorRef.current = new SpamDetector();
      await detectorRef.current.loadModel();
      setLoading(false);
    };
    initModel().catch(() => Alert.alert('Error', 'Failed to load model'));
  }, []);

  const handleSarcasm = () => {
    if (!text.trim()) {
      Alert.alert('Input Required', 'Enter text first');
      return;
    }
    const prediction = predictSarcasm(text);
    setSarcasmResult(prediction);
  };

  const handlePlatform = () => {
    Keyboard.dismiss();
    if (!text.trim()) {
      Alert.alert('Input Required', 'Enter text first');
      return;
    }
    const result = detectorRef.current.predict(text);
    setPlatformResult(result);
  };

  const handleClear = () => {
    setText('');
    setSarcasmResult(null);
    setPlatformResult('');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading model...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>AI Text Analyzer</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter text..."
        value={text}
        onChangeText={setText}
        multiline
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSarcasm}>
          <Text style={styles.buttonText}>Detect Sarcasm</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePlatform}>
          <Text style={styles.buttonText}>Detect Platform</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {sarcasmResult && (
        <Text style={styles.result}>
          Sarcasm: {sarcasmResult.label} ({(sarcasmResult.confidence * 100).toFixed(2)}%)
        </Text>
      )}

      {platformResult !== '' && (
        <Text style={styles.result}>
          Platform: {platformResult}
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 100,
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
  },
  clearButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
