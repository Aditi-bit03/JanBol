/**
 * AI Service for JanBol Platform
 * Handles voice processing, language detection, and issue classification
 */

interface VoiceProcessingResult {
  transcription: string;
  language: string;
  confidence: number;
  duration: number;
}

interface IssueClassification {
  category: string;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  confidence: number;
  urgencyScore: number;
}

interface LocationContext {
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  district: string;
  state: string;
}

export class AIService {
  private static instance: AIService;
  
  // Language mappings for Indian languages
  private languageMap = {
    'hi': 'hindi',
    'pa': 'punjabi',
    'gu': 'gujarati',
    'mr': 'marathi',
    'ta': 'tamil',
    'en': 'english',
    'bn': 'bengali',
    'te': 'telugu',
    'kn': 'kannada',
    'ml': 'malayalam'
  };

  // Issue categories with Hindi translations
  private issueCategories = {
    'roads': {
      name: 'सड़क और परिवहन',
      keywords: ['सड़क', 'गड्ढे', 'ट्रैफिक', 'बस', 'रिक्शा', 'पार्किंग'],
      subcategories: ['potholes', 'traffic', 'street_lights', 'signage']
    },
    'water': {
      name: 'पानी की आपूर्ति',
      keywords: ['पानी', 'नल', 'टंकी', 'बोरवेल', 'कमी', 'गुणवत्ता'],
      subcategories: ['shortage', 'quality', 'leakage', 'pressure']
    },
    'electricity': {
      name: 'बिजली',
      keywords: ['बिजली', 'कटौती', 'ट्रांसफार्मर', 'मीटर', 'वोल्टेज', 'बिल'],
      subcategories: ['outage', 'billing', 'infrastructure', 'voltage']
    },
    'garbage': {
      name: 'कचरा प्रबंधन',
      keywords: ['कचरा', 'गंदगी', 'सफाई', 'डस्टबिन', 'कलेक्शन'],
      subcategories: ['collection', 'disposal', 'bins', 'segregation']
    },
    'healthcare': {
      name: 'स्वास्थ्य सेवा',
      keywords: ['अस्पताल', 'डॉक्टर', 'दवा', 'इलाज', 'एम्बुलेंस'],
      subcategories: ['facilities', 'staff', 'medicines', 'emergency']
    },
    'education': {
      name: 'शिक्षा',
      keywords: ['स्कूल', 'शिक्षक', 'किताबें', 'फीस', 'बिल्डिंग'],
      subcategories: ['infrastructure', 'teachers', 'resources', 'fees']
    }
  };

  // Sentiment keywords
  private sentimentKeywords = {
    negative: ['समस्या', 'परेशानी', 'गुस्सा', 'गलत', 'बुरा', 'खराब', 'टूटा'],
    positive: ['अच्छा', 'बेहतर', 'सुधार', 'धन्यवाद', 'खुश', 'संतुष्ट'],
    urgent: ['तुरंत', 'जल्दी', 'आपातकाल', 'इमरजेंसी', 'फौरन']
  };

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Simulates voice-to-text conversion with language detection
   */
  async processVoiceInput(audioBlob: Blob): Promise<VoiceProcessingResult> {
    // Simulate processing delay
    await this.delay(2000);

    // Mock transcriptions in different languages
    const mockTranscriptions = [
      {
        text: 'हमारे इलाके में पानी की बहुत कमी है। नल से पानी नहीं आ रहा है।',
        language: 'hindi',
        confidence: 0.92
      },
      {
        text: 'ਸਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਸੜਕਾਂ ਦੀ ਹਾਲਤ ਬਹੁਤ ਖਰਾਬ ਹੈ।',
        language: 'punjabi',
        confidence: 0.88
      },
      {
        text: 'The street lights are not working properly in our area.',
        language: 'english',
        confidence: 0.95
      }
    ];

    const randomResult = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

    return {
      transcription: randomResult.text,
      language: randomResult.language,
      confidence: randomResult.confidence,
      duration: 3.5
    };
  }

  /**
   * Classifies issues using NLP and keyword matching
   */
  async classifyIssue(text: string, location?: LocationContext): Promise<IssueClassification> {
    await this.delay(1000);

    const words = text.toLowerCase().split(' ');
    let bestMatch = { category: 'other', score: 0 };
    let detectedKeywords: string[] = [];

    // Keyword-based classification
    for (const [categoryId, categoryData] of Object.entries(this.issueCategories)) {
      let score = 0;
      const categoryKeywords: string[] = [];

      for (const keyword of categoryData.keywords) {
        if (words.some(word => word.includes(keyword.toLowerCase()))) {
          score += 1;
          categoryKeywords.push(keyword);
        }
      }

      if (score > bestMatch.score) {
        bestMatch = { category: categoryId, score };
        detectedKeywords = categoryKeywords;
      }
    }

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(text);
    
    // Priority calculation
    const priority = this.calculatePriority(text, sentiment, bestMatch.category);
    
    // Urgency score
    const urgencyScore = this.calculateUrgencyScore(text);

    return {
      category: bestMatch.category,
      subcategory: this.detectSubcategory(bestMatch.category, text),
      priority,
      sentiment,
      keywords: detectedKeywords,
      confidence: Math.min(bestMatch.score / 3, 1),
      urgencyScore
    };
  }

  /**
   * Analyzes sentiment of the text
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const words = text.toLowerCase().split(' ');
    
    let negativeScore = 0;
    let positiveScore = 0;

    for (const word of words) {
      if (this.sentimentKeywords.negative.some(kw => word.includes(kw))) {
        negativeScore++;
      }
      if (this.sentimentKeywords.positive.some(kw => word.includes(kw))) {
        positiveScore++;
      }
    }

    if (negativeScore > positiveScore) return 'negative';
    if (positiveScore > negativeScore) return 'positive';
    return 'neutral';
  }

  /**
   * Calculates priority based on various factors
   */
  private calculatePriority(
    text: string, 
    sentiment: string, 
    category: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    let score = 0;

    // Base priority by category
    const categoryPriorities = {
      'healthcare': 3,
      'water': 3,
      'electricity': 2,
      'roads': 2,
      'garbage': 1,
      'education': 1
    };

    score += categoryPriorities[category as keyof typeof categoryPriorities] || 1;

    // Sentiment impact
    if (sentiment === 'negative') score += 1;

    // Urgency keywords
    const urgentWords = ['तुरंत', 'जल्दी', 'आपातकाल', 'इमरजेंसी'];
    if (urgentWords.some(word => text.includes(word))) score += 2;

    // Determine priority
    if (score >= 5) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculates urgency score (0-100)
   */
  private calculateUrgencyScore(text: string): number {
    let score = 50; // Base score

    // Urgent keywords
    if (this.sentimentKeywords.urgent.some(kw => text.includes(kw))) {
      score += 30;
    }

    // Negative sentiment
    if (this.sentimentKeywords.negative.some(kw => text.includes(kw))) {
      score += 20;
    }

    // Multiple issues mentioned
    if (text.length > 100) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Detects subcategory within main category
   */
  private detectSubcategory(category: string, text: string): string {
    const subcategoryKeywords = {
      'roads': {
        'potholes': ['गड्ढे', 'holes'],
        'traffic': ['ट्रैफिक', 'jam'],
        'street_lights': ['बत्ती', 'lights'],
        'signage': ['साइन', 'board']
      },
      'water': {
        'shortage': ['कमी', 'shortage'],
        'quality': ['गुणवत्ता', 'quality', 'गंदा'],
        'leakage': ['लीकेज', 'leak'],
        'pressure': ['प्रेशर', 'pressure']
      }
    };

    const categoryMap = subcategoryKeywords[category as keyof typeof subcategoryKeywords];
    if (!categoryMap) return 'general';

    for (const [subcat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => text.includes(kw))) {
        return subcat;
      }
    }

    return 'general';
  }

  /**
   * Generates summary of the issue
   */
  async generateIssueSummary(
    classification: IssueClassification, 
    transcription: string,
    location?: LocationContext
  ): Promise<string> {
    await this.delay(500);

    const categoryName = this.issueCategories[classification.category as keyof typeof this.issueCategories]?.name || 'अन्य';
    const locationStr = location ? `${location.locality}, ${location.district}` : 'अज्ञात स्थान';

    return `${categoryName} की समस्या ${locationStr} में रिपोर्ट की गई। प्राथमिकता: ${classification.priority}। मुख्य बिंदु: ${classification.keywords.join(', ')}।`;
  }

  /**
   * Translates text between Indian languages (mock implementation)
   */
  async translateText(text: string, targetLanguage: string): Promise<string> {
    await this.delay(1000);

    // Mock translations
    const translations: Record<string, Record<string, string>> = {
      'hindi': {
        'english': 'There is a serious water shortage problem in our area.',
        'punjabi': 'ਸਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਪਾਣੀ ਦੀ ਭਾਰੀ ਕਮੀ ਹੈ।'
      }
    };

    return translations['hindi']?.[targetLanguage] || text;
  }

  /**
   * Validates and enhances location data
   */
  async enhanceLocationData(
    latitude: number, 
    longitude: number
  ): Promise<LocationContext> {
    await this.delay(800);

    // Mock location enhancement
    return {
      latitude,
      longitude,
      address: 'मॉल रोड, रिज',
      locality: 'द रिज',
      district: 'शिमला',
      state: 'हिमाचल प्रदेश'
    };
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const aiService = AIService.getInstance();