import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Mic, TriangleAlert as AlertTriangle, TrendingUp, Users, CircleCheck as CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [stats, setStats] = useState({
    totalIssues: 1247,
    resolvedIssues: 856,
    activeUsers: 23456,
    avgResolutionTime: '7.2'
  });

  const [recentIssues, setRecentIssues] = useState([
    {
      id: 1,
      title: 'सड़क पर गड्ढे',
      location: 'मंडी रोड, शिमला',
      status: 'pending',
      priority: 'high',
      timeAgo: '2 घंटे पहले'
    },
    {
      id: 2,
      title: 'पानी की कमी',
      location: 'गांव पंचायत, बिलासपुर',
      status: 'in-progress',
      priority: 'critical',
      timeAgo: '5 घंटे पहले'
    },
    {
      id: 3,
      title: 'बिजली की समस्या',
      location: 'सेक्टर 15, चंडीगढ़',
      status: 'resolved',
      priority: 'medium',
      timeAgo: '1 दिन पहले'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF6B6B';
      case 'in-progress': return '#4ECDC4';
      case 'resolved': return '#45B7D1';
      default: return '#888';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF4757';
      case 'high': return '#FF9F43';
      case 'medium': return '#26D0CE';
      case 'low': return '#6C5CE7';
      default: return '#888';
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
          <Text style={styles.greeting}>नमस्ते! 🙏</Text>
          <Text style={styles.title}>JanBol में आपका स्वागत है</Text>
          <Text style={styles.subtitle}>आपकी आवाज़, आपका समाधान</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>आज की स्थिति</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <AlertTriangle size={24} color="#FF9933" />
              <Text style={styles.statNumber}>{stats.totalIssues}</Text>
              <Text style={styles.statLabel}>कुल मुद्दे</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle size={24} color="#138808" />
              <Text style={styles.statNumber}>{stats.resolvedIssues}</Text>
              <Text style={styles.statLabel}>हल किए गए</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={24} color="#4ECDC4" />
              <Text style={styles.statNumber}>{stats.activeUsers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>सक्रिय उपयोगकर्ता</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>{stats.avgResolutionTime}</Text>
              <Text style={styles.statLabel}>औसत समाधान (दिन)</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>त्वरित कार्रवाई</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#FF9933', '#FF6B6B']}
                style={styles.actionGradient}
              >
                <Mic size={32} color="#fff" />
                <Text style={styles.actionText}>आवाज़ से रिपोर्ट करें</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#138808', '#4ECDC4']}
                style={styles.actionGradient}
              >
                <MapPin size={32} color="#fff" />
                <Text style={styles.actionText}>मुद्दे देखें</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Issues */}
        <View style={styles.issuesContainer}>
          <Text style={styles.sectionTitle}>हाल के मुद्दे</Text>
          {recentIssues.map((issue) => (
            <View key={issue.id} style={styles.issueCard}>
              <View style={styles.issueHeader}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
                  <Text style={styles.priorityText}>{issue.priority}</Text>
                </View>
              </View>
              <View style={styles.issueDetails}>
                <MapPin size={14} color="#666" />
                <Text style={styles.issueLocation}>{issue.location}</Text>
              </View>
              <View style={styles.issueFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                  <Text style={styles.statusText}>{issue.status}</Text>
                </View>
                <Text style={styles.timeAgo}>{issue.timeAgo}</Text>
              </View>
            </View>
          ))}
        </View>
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
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
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
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  issuesContainer: {
    marginTop: 8,
    paddingBottom: 100,
  },
  issueCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  issueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  issueLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
  },
});