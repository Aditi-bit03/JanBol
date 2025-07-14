/**
 * Notification Service for JanBol Platform
 * Handles push notifications, SMS, and voice notifications
 */

interface NotificationConfig {
  title: string;
  body: string;
  type: 'update' | 'resolved' | 'feedback' | 'urgent' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  issueId?: string;
  userId: string;
  channels: ('push' | 'sms' | 'voice')[];
  language: string;
  scheduledTime?: Date;
}

interface SMSConfig {
  phone: string;
  message: string;
  language: string;
}

interface VoiceCallConfig {
  phone: string;
  message: string;
  language: string;
  voiceType: 'male' | 'female';
}

export class NotificationService {
  private static instance: NotificationService;
  
  // Notification templates in multiple languages
  private templates = {
    'hindi': {
      'update': 'आपकी रिपोर्ट #{issueId} को अपडेट मिला है। स्थिति: {status}',
      'resolved': 'बधाई हो! आपकी रिपोर्ट #{issueId} का समाधान हो गया है।',
      'feedback': 'कृपया रिपोर्ट #{issueId} पर अपनी राय दें।',
      'urgent': 'आपके क्षेत्र में तत्काल ध्यान की जरूरत है।',
      'system': 'JanBol ऐप में नए अपडेट उपलब्ध हैं।'
    },
    'english': {
      'update': 'Your report #{issueId} has been updated. Status: {status}',
      'resolved': 'Congratulations! Your report #{issueId} has been resolved.',
      'feedback': 'Please provide feedback on report #{issueId}.',
      'urgent': 'Urgent attention needed in your area.',
      'system': 'New updates available in JanBol app.'
    },
    'punjabi': {
      'update': 'ਤੁਹਾਡੀ ਰਿਪੋਰਟ #{issueId} ਨੂੰ ਅਪਡੇਟ ਮਿਲਿਆ ਹੈ।',
      'resolved': 'ਵਧਾਈ! ਤੁਹਾਡੀ ਰਿਪੋਰਟ #{issueId} ਦਾ ਹੱਲ ਹੋ ਗਿਆ ਹੈ।',
      'feedback': 'ਕਿਰਪਾ ਕਰਕੇ ਰਿਪੋਰਟ #{issueId} ਬਾਰੇ ਆਪਣੀ ਰਾਏ ਦਿਓ।',
      'urgent': 'ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਤੁਰੰਤ ਧਿਆਨ ਦੀ ਲੋੜ ਹੈ।',
      'system': 'JanBol ਐਪ ਵਿੱਚ ਨਵੇ ਅਪਡੇਟ ਉਪਲਬਧ ਹਨ।'
    }
  };

  // SMS gateway configuration
  private smsConfig = {
    apiUrl: 'https://api.textlocal.in/send/',
    apiKey: process.env.SMS_API_KEY || 'demo-key',
    sender: 'JANBOL'
  };

  // Voice call configuration
  private voiceConfig = {
    apiUrl: 'https://api.exotel.com/v1/Accounts/',
    accountSid: process.env.VOICE_ACCOUNT_SID || 'demo-sid',
    token: process.env.VOICE_TOKEN || 'demo-token'
  };

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Sends notifications through multiple channels
   */
  async sendNotification(config: NotificationConfig): Promise<{
    success: boolean;
    results: Array<{ channel: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ channel: string; success: boolean; error?: string }> = [];

    // Generate localized message
    const message = this.generateMessage(config);

    // Send through each requested channel
    for (const channel of config.channels) {
      try {
        switch (channel) {
          case 'push':
            await this.sendPushNotification(config, message);
            results.push({ channel: 'push', success: true });
            break;
          
          case 'sms':
            await this.sendSMS({
              phone: config.userId, // Assuming userId contains phone number
              message: message.body,
              language: config.language
            });
            results.push({ channel: 'sms', success: true });
            break;
          
          case 'voice':
            await this.makeVoiceCall({
              phone: config.userId,
              message: message.body,
              language: config.language,
              voiceType: 'female'
            });
            results.push({ channel: 'voice', success: true });
            break;
        }
      } catch (error) {
        results.push({ 
          channel, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const success = results.some(r => r.success);
    return { success, results };
  }

  /**
   * Sends push notification
   */
  private async sendPushNotification(
    config: NotificationConfig,
    message: { title: string; body: string }
  ): Promise<void> {
    // Mock implementation - would integrate with FCM
    console.log('Sending push notification:', {
      to: config.userId,
      title: message.title,
      body: message.body,
      data: {
        type: config.type,
        issueId: config.issueId,
        priority: config.priority
      }
    });

    // Simulate API call delay
    await this.delay(500);
  }

  /**
   * Sends SMS notification
   */
  private async sendSMS(config: SMSConfig): Promise<void> {
    // Mock implementation - would integrate with SMS gateway
    console.log('Sending SMS:', {
      to: config.phone,
      message: config.message,
      language: config.language
    });

    // Simulate API call
    await this.delay(800);

    // In production, would make actual API call:
    /*
    const response = await fetch(this.smsConfig.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: this.smsConfig.apiKey,
        numbers: config.phone,
        sender: this.smsConfig.sender,
        message: config.message
      })
    });
    */
  }

  /**
   * Makes voice call for notifications
   */
  private async makeVoiceCall(config: VoiceCallConfig): Promise<void> {
    // Mock implementation - would integrate with voice service
    console.log('Making voice call:', {
      to: config.phone,
      message: config.message,
      language: config.language,
      voice: config.voiceType
    });

    // Simulate API call
    await this.delay(1200);

    // In production, would make actual API call to voice service
  }

  /**
   * Generates localized notification message
   */
  private generateMessage(config: NotificationConfig): { title: string; body: string } {
    const language = config.language || 'hindi';
    const templates = this.templates[language as keyof typeof this.templates] || this.templates.hindi;
    
    let body = templates[config.type] || templates.system;
    
    // Replace placeholders
    if (config.issueId) {
      body = body.replace('{issueId}', config.issueId);
    }
    
    return {
      title: config.title,
      body
    };
  }

  /**
   * Sends bulk notifications for area-wide alerts
   */
  async sendBulkNotification(
    userIds: string[],
    message: string,
    type: NotificationConfig['type'],
    priority: NotificationConfig['priority'] = 'medium'
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.sendNotification({
          title: 'महत्वपूर्ण सूचना',
          body: message,
          type,
          priority,
          userId,
          channels: ['push', 'sms'],
          language: 'hindi'
        });
        sent++;
      } catch (error) {
        failed++;
        console.error(`Failed to send notification to ${userId}:`, error);
      }
    }

    return { sent, failed };
  }

  /**
   * Schedules future notifications
   */
  async scheduleNotification(
    config: NotificationConfig,
    scheduleTime: Date
  ): Promise<string> {
    const notificationId = `scheduled_${Date.now()}_${Math.random()}`;
    
    // Mock implementation - would use a job queue in production
    const delay = scheduleTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(async () => {
        await this.sendNotification(config);
      }, delay);
    }

    return notificationId;
  }

  /**
   * Sends issue status update notifications
   */
  async notifyIssueUpdate(
    issueId: string,
    userId: string,
    status: string,
    message?: string,
    language: string = 'hindi'
  ): Promise<void> {
    await this.sendNotification({
      title: 'रिपोर्ट अपडेट',
      body: message || `आपकी रिपोर्ट ${issueId} की स्थिति बदली गई है।`,
      type: 'update',
      priority: 'medium',
      issueId,
      userId,
      channels: ['push', 'sms'],
      language
    });
  }

  /**
   * Sends issue resolution notifications
   */
  async notifyIssueResolution(
    issueId: string,
    userId: string,
    language: string = 'hindi'
  ): Promise<void> {
    await this.sendNotification({
      title: 'समस्या हल',
      body: `बधाई हो! आपकी रिपोर्ट ${issueId} का समाधान हो गया है।`,
      type: 'resolved',
      priority: 'high',
      issueId,
      userId,
      channels: ['push', 'sms', 'voice'],
      language
    });
  }

  /**
   * Requests feedback after issue resolution
   */
  async requestFeedback(
    issueId: string,
    userId: string,
    language: string = 'hindi'
  ): Promise<void> {
    // Send immediate notification
    await this.sendNotification({
      title: 'फीडबैक अनुरोध',
      body: `कृपया रिपोर्ट ${issueId} पर अपनी राय दें।`,
      type: 'feedback',
      priority: 'low',
      issueId,
      userId,
      channels: ['push'],
      language
    });

    // Schedule follow-up SMS after 24 hours
    const followUpTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.scheduleNotification({
      title: 'फीडबैक रिमाइंडर',
      body: `कृपया अपनी रिपोर्ट ${issueId} पर फीडबैक दें।`,
      type: 'feedback',
      priority: 'low',
      issueId,
      userId,
      channels: ['sms'],
      language,
      scheduledTime: followUpTime
    });
  }

  /**
   * Sends emergency alerts
   */
  async sendEmergencyAlert(
    area: string,
    userIds: string[],
    alertMessage: string,
    language: string = 'hindi'
  ): Promise<void> {
    await this.sendBulkNotification(
      userIds,
      `आपातकाल: ${alertMessage}`,
      'urgent',
      'critical'
    );

    // Also trigger voice calls for critical alerts
    for (const userId of userIds) {
      await this.makeVoiceCall({
        phone: userId,
        message: `आपातकालीन सूचना: ${alertMessage}`,
        language,
        voiceType: 'female'
      });
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const notificationService = NotificationService.getInstance();