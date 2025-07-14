import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, MapPin, Languages, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Award, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const userData = {
    name: 'राज कुमार',
    phone: '+91 9876543210',
    location: 'शिमला, हिमाचल प्रदेश',
    joinDate: 'जनवरी 2024',
    reportsSubmitted: 15,
    issuesResolved: 12,
    points: 480,
    badge: 'सक्रिय नागरिक'
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'प्रोफ़ाइल संपादित करें',
      icon: <Edit size={20} color="#666" />,
      color: '#4ECDC4'
    },
    {
      id: 'my-reports',
      title: 'मेरी रिपोर्ट्स',
      icon: <Activity size={20} color="#666" />,
      color: '#FF9933'
    },
    {
      id: 'achievements',
      title: 'उपलब्धियां',
      icon: <Award size={20} color="#666" />,
      color: '#FFE66D'
    },
    {
      id: 'language',
      title: 'भाषा सेटिंग्स',
      icon: <Languages size={20} color="#666" />,
      color: '#95E1D3'
    },
    {
      id: 'privacy',
      title: 'गोपनीयता और सुरक्षा',
      icon: <Shield size={20} color="#666" />,
      color: '#F38BA8'
    },
    {
      id: 'help',
      title: 'सहायता और समर्थन',
      icon: <HelpCircle size={20} color="#666" />,
      color: '#B19CD9'
    }
  ];

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'edit-profile':
        Alert.alert('प्रोफ़ाइल संपादन', 'यह फीचर जल्द ही उपलब्ध होगा');
        break;
      case 'my-reports':
        Alert.alert('मेरी रिपोर्ट्स', 'आपकी सभी रिपोर्ट्स यहाँ दिखेंगी');
        break;
      case 'achievements':
        Alert.alert('उपलब्धियां', 'आपकी सभी उपलब्धियां और बैज यहाँ दिखेंगे');
        break;
      case 'language':
        Alert.alert('भाषा', 'भाषा चुनने का विकल्प जल्द ही आएगा');
        break;
      case 'privacy':
        Alert.alert('गोपनीयता', 'गोपनीयता सेटिंग्स यहाँ होंगी');
        break;
      case 'help':
        Alert.alert('सहायता', 'सहायता केंद्र में आपका स्वागत है');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'लॉग आउट',
      'क्या आप वाकई लॉग आउट करना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { text: 'लॉग आउट', style: 'destructive' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF9933', '#FFFFFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#138808', '#4ECDC4']}
              style={styles.avatar}
            >
              <User size={40} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userPhone}>{userData.phone}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#fff" />
            <Text style={styles.userLocation}>{userData.location}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>आपकी गतिविधि</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.reportsSubmitted}</Text>
              <Text style={styles.statLabel}>रिपोर्ट्स भेजी</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.issuesResolved}</Text>
              <Text style={styles.statLabel}>हल किए गए</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.points}</Text>
              <Text style={styles.statLabel}>पॉइंट्स</Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <Award size={24} color="#FFE66D" />
            <Text style={styles.badgeText}>{userData.badge}</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>सेटिंग्स</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#666" />
              <Text style={styles.settingText}>सूचनाएं</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E5E5', true: '#FF9933' }}
              thumbColor={notificationsEnabled ? '#fff' : '#fff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MapPin size={20} color="#666" />
              <Text style={styles.settingText}>स्थान ट्रैकिंग</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#E5E5E5', true: '#FF9933' }}
              thumbColor={locationEnabled ? '#fff' : '#fff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Settings size={20} color="#666" />
              <Text style={styles.settingText}>वॉइस रिकॉर्डिंग</Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: '#E5E5E5', true: '#FF9933' }}
              thumbColor={voiceEnabled ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>मेनू</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  {item.icon}
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Info */}
        <View style={styles.accountContainer}>
          <Text style={styles.sectionTitle}>खाता जानकारी</Text>
          <Text style={styles.accountText}>सदस्य बने: {userData.joinDate}</Text>
          <Text style={styles.accountText}>ऐप संस्करण: 1.0.0</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF4757" />
          <Text style={styles.logoutText}>लॉग आउट</Text>
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
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLocation: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 24,
  },
  statsContainer: {
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  settingsContainer: {
    marginTop: 8,
  },
  settingItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '600',
  },
  menuContainer: {
    marginTop: 8,
  },
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 20,
    color: '#999',
  },
  accountContainer: {
    marginTop: 8,
  },
  accountText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4757',
    fontWeight: '600',
    marginLeft: 8,
  },
});