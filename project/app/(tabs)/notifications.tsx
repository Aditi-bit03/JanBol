import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle, MessageSquare, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'update',
      title: 'आपकी रिपोर्ट को अपडेट मिला',
      message: 'सड़क पर गड्ढे की समस्या - कार्य प्रगति में है',
      time: '2 घंटे पहले',
      isRead: false,
      priority: 'medium',
      issueId: 'RPT001'
    },
    {
      id: 2,
      type: 'resolved',
      title: 'समस्या हल हो गई',
      message: 'पानी की कमी की समस्या का समाधान हो गया है',
      time: '4 घंटे पहले',
      isRead: false,
      priority: 'high',
      issueId: 'RPT002'
    },
    {
      id: 3,
      type: 'feedback',
      title: 'फीडबैक की जरूरत',
      message: 'कृपया हाल ही में हल की गई समस्या पर अपनी राय दें',
      time: '1 दिन पहले',
      isRead: true,
      priority: 'low',
      issueId: 'RPT003'
    },
    {
      id: 4,
      type: 'system',
      title: 'सिस्टम अपडेट',
      message: 'JanBol ऐप में नए फीचर्स जोड़े गए हैं',
      time: '2 दिन पहले',
      isRead: true,
      priority: 'low',
      issueId: null
    },
    {
      id: 5,
      type: 'urgent',
      title: 'तत्काल ध्यान चाहिए',
      message: 'आपके क्षेत्र में आपातकालीन सेवा की जरूरत',
      time: '3 दिन पहले',
      isRead: false,
      priority: 'critical',
      issueId: 'RPT004'
    }
  ]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'update': return <Clock size={20} color="#4ECDC4" />;
      case 'resolved': return <CheckCircle size={20} color="#138808" />;
      case 'feedback': return <MessageSquare size={20} color="#FF9933" />;
      case 'urgent': return <AlertTriangle size={20} color="#FF4757" />;
      default: return <Bell size={20} color="#666" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF4757';
      case 'high': return '#FF6B6B';
      case 'medium': return '#4ECDC4';
      case 'low': return '#95E1D3';
      default: return '#888';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    Alert.alert(
      'सूचना हटाएं',
      'क्या आप इस सूचना को हटाना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { 
          text: 'हटाएं', 
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== id));
          }
        }
      ]
    );
  };

  const handleNotificationPress = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.issueId) {
      Alert.alert(
        'इश्यू विवरण',
        `इश्यू ID: ${notification.issueId}\n\n${notification.message}`,
        [{ text: 'ठीक है' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF9933', '#FFFFFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>सूचनाएं</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSubtitle}>अपडेट्स और अलर्ट्स</Text>
      </LinearGradient>

      {/* Action Buttons */}
      {unreadCount > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <CheckCircle size={16} color="#138808" />
            <Text style={styles.markAllText}>सभी को पढ़ा हुआ मार्क करें</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>कोई सूचना नहीं</Text>
            <Text style={styles.emptySubtitle}>अभी तक कोई नई सूचना नहीं मिली है</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadCard
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                <View style={styles.notificationActions}>
                  <View style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(notification.priority) }
                  ]} />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <X size={16} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              {notification.issueId && (
                <View style={styles.issueIdContainer}>
                  <Text style={styles.issueIdText}>इश्यू ID: {notification.issueId}</Text>
                </View>
              )}
              {!notification.isRead && (
                <View style={styles.unreadIndicator} />
              )}
            </TouchableOpacity>
          ))
        )}
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  badgeContainer: {
    backgroundColor: '#FF4757',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  markAllText: {
    color: '#138808',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9933',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  notificationActions: {
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  issueIdContainer: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  issueIdText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9933',
  },
});