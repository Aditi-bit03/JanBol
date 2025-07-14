import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, MapPin, Send, Camera, FileText, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReportScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('शिमला, हिमाचल प्रदेश');
  const [transcription, setTranscription] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const languages = [
    { code: 'hindi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'punjabi', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'gujarati', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'marathi', name: 'मराठी', flag: '🇮🇳' },
    { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'english', name: 'English', flag: '🇬🇧' }
  ];

  const categories = [
    { id: 'roads', name: 'सड़क और परिवहन', icon: '🛣️', color: '#FF6B6B' },
    { id: 'water', name: 'पानी की आपूर्ति', icon: '💧', color: '#4ECDC4' },
    { id: 'electricity', name: 'बिजली', icon: '⚡', color: '#FFE66D' },
    { id: 'garbage', name: 'कचरा प्रबंधन', icon: '🗑️', color: '#95E1D3' },
    { id: 'healthcare', name: 'स्वास्थ्य सेवा', icon: '🏥', color: '#F38BA8' },
    { id: 'education', name: 'शिक्षा', icon: '📚', color: '#A8DADC' },
    { id: 'other', name: 'अन्य', icon: '📋', color: '#B19CD9' }
  ];

  const startRecording = () => {
    setIsRecording(true);
    // Simulate AI voice processing
    setTimeout(() => {
      const mockTranscriptions = [
        'हमारे इलाके में पानी की बहुत कमी है। नल से पानी नहीं आ रहा है। कृपया इस समस्या का समाधान करें।',
        'सड़क पर बहुत गड्ढे हैं। बारिश में चलना मुश्किल हो जाता है। ये गड्ढे भरवा दीजिए।',
        'बिजली की समस्या है। दिन में भी कई बार कट जाती है। इससे काम में बहुत परेशानी होती है।'
      ];
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      setTranscription(randomTranscription);
      
      // AI Analysis
      const analysis = {
        category: 'water',
        sentiment: 'negative',
        priority: 'high',
        confidence: 0.89,
        keywords: ['पानी', 'कमी', 'नल', 'समस्या']
      };
      setAiAnalysis(analysis);
      setSelectedCategory('water');
      setIsRecording(false);
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const submitReport = () => {
    if (!transcription || !selectedCategory) {
      Alert.alert('त्रुटि', 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    Alert.alert(
      'सफलता!',
      'आपकी रिपोर्ट सफलतापूर्वक भेज दी गई है। हम जल्द ही इस पर कार्रवाई करेंगे।',
      [{ text: 'ठीक है' }]
    );

    // Reset form
    setTranscription('');
    setSelectedCategory('');
    setAiAnalysis(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF9933', '#FFFFFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>मुद्दा रिपोर्ट करें</Text>
        <Text style={styles.headerSubtitle}>आपकी आवाज़ से बदलाव लाएं</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>भाषा चुनें</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageScroll}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang.code && styles.languageButtonActive
                ]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageText,
                  selectedLanguage === lang.code && styles.languageTextActive
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Voice Recording */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>आवाज़ रिकॉर्डिंग</Text>
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <LinearGradient
                colors={isRecording ? ['#FF4757', '#FF6B6B'] : ['#FF9933', '#FF6B6B']}
                style={styles.recordButtonGradient}
              >
                {isRecording ? (
                  <MicOff size={40} color="#fff" />
                ) : (
                  <Mic size={40} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.recordingText}>
              {isRecording ? 'रिकॉर्डिंग हो रही है...' : 'रिकॉर्डिंग शुरू करने के लिए दबाएं'}
            </Text>
          </View>
        </View>

        {/* Transcription */}
        {transcription ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>आपका संदेश</Text>
            <TextInput
              style={styles.transcriptionInput}
              value={transcription}
              onChangeText={setTranscription}
              multiline
              placeholder="आपका संदेश यहाँ दिखेगा..."
            />
          </View>
        ) : null}

        {/* AI Analysis */}
        {aiAnalysis ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI विश्लेषण</Text>
            <View style={styles.analysisCard}>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>श्रेणी:</Text>
                <Text style={styles.analysisValue}>पानी की आपूर्ति</Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>प्राथमिकता:</Text>
                <Text style={[styles.analysisValue, { color: '#FF6B6B' }]}>उच्च</Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>विश्वसनीयता:</Text>
                <Text style={styles.analysisValue}>{Math.round(aiAnalysis.confidence * 100)}%</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>श्रेणी चुनें</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive,
                  { borderColor: category.color }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>स्थान</Text>
          <View style={styles.locationCard}>
            <MapPin size={20} color="#FF9933" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={submitReport}>
          <LinearGradient
            colors={['#138808', '#4ECDC4']}
            style={styles.submitGradient}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.submitText}>रिपोर्ट भेजें</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  languageScroll: {
    marginBottom: 8,
  },
  languageButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    borderColor: '#FF9933',
    backgroundColor: '#FFF5E6',
  },
  languageFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  languageText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  languageTextActive: {
    color: '#FF9933',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
  },
  recordButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  recordButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  transcriptionInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  analysisCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  analysisValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  categoryCardActive: {
    backgroundColor: '#FFF5E6',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 32,
    marginBottom: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});