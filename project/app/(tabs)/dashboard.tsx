import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, TrendingUp, MapPin, Users, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const timeframes = [
    { id: 'day', label: 'आज' },
    { id: 'week', label: 'सप्ताह' },
    { id: 'month', label: 'महीना' },
    { id: 'year', label: 'वर्ष' }
  ];

  const filters = [
    { id: 'all', label: 'सभी', color: '#333' },
    { id: 'pending', label: 'लंबित', color: '#FF6B6B' },
    { id: 'in-progress', label: 'प्रगति में', color: '#4ECDC4' },
    { id: 'resolved', label: 'हल किया गया', color: '#138808' }
  ];

  const issuesByCategory = [
    { category: 'सड़क', count: 156, percentage: 32, color: '#FF6B6B' },
    { category: 'पानी', count: 134, percentage: 28, color: '#4ECDC4' },
    { category: 'बिजली', count: 98, percentage: 20, color: '#FFE66D' },
    { category: 'कचरा', count: 67, percentage: 14, color: '#95E1D3' },
    { category: 'अन्य', count: 32, percentage: 6, color: '#B19CD9' }
  ];

  const regionData = [
    { region: 'शिमला', issues: 89, resolved: 67, percentage: 75 },
    { region: 'चंडीगढ़', issues: 76, resolved: 45, percentage: 59 },
    { region: 'बिलासपुर', issues: 54, resolved: 38, percentage: 70 },
    { region: 'मंडी', issues: 43, resolved: 31, percentage: 72 },
    { region: 'कुल्लू', issues: 32, resolved: 28, percentage: 88 }
  ];

  const trendingIssues = [
    { title: 'सड़क पर गड्ढे', count: 34, trend: '+12%', color: '#FF6B6B' },
    { title: 'पानी की कमी', count: 28, trend: '+8%', color: '#4ECDC4' },
    { title: 'बिजली कटौती', count: 19, trend: '-5%', color: '#FFE66D' },
    { title: 'कचरा संग्रह', count: 15, trend: '+3%', color: '#95E1D3' }
  ];

  const stats = {
    totalIssues: 1247,
    resolvedToday: 23,
    avgResolutionTime: 7.2,
    satisfactionRate: 85,
    activeUsers: 23456
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF9933', '#FFFFFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>सिविक डैशबोर्ड</Text>
        <Text style={styles.headerSubtitle}>रियल-टाइम एनालिटिक्स</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe.id}
                style={[
                  styles.filterButton,
                  selectedTimeframe === timeframe.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedTimeframe(timeframe.id)}
              >
                <Text style={[
                  styles.filterText,
                  selectedTimeframe === timeframe.id && styles.filterTextActive
                ]}>
                  {timeframe.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>मुख्य आंकड़े</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <AlertTriangle size={24} color="#FF9933" />
              <Text style={styles.metricNumber}>{stats.totalIssues}</Text>
              <Text style={styles.metricLabel}>कुल मुद्दे</Text>
            </View>
            <View style={styles.metricCard}>
              <CheckCircle size={24} color="#138808" />
              <Text style={styles.metricNumber}>{stats.resolvedToday}</Text>
              <Text style={styles.metricLabel}>आज हल किए गए</Text>
            </View>
            <View style={styles.metricCard}>
              <Clock size={24} color="#4ECDC4" />
              <Text style={styles.metricNumber}>{stats.avgResolutionTime}</Text>
              <Text style={styles.metricLabel}>औसत समाधान (दिन)</Text>
            </View>
            <View style={styles.metricCard}>
              <TrendingUp size={24} color="#FF6B6B" />
              <Text style={styles.metricNumber}>{stats.satisfactionRate}%</Text>
              <Text style={styles.metricLabel}>संतुष्टि दर</Text>
            </View>
          </View>
        </View>

        {/* Issues by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>श्रेणी के अनुसार मुद्दे</Text>
          <View style={styles.chartContainer}>
            {issuesByCategory.map((item, index) => (
              <View key={index} style={styles.chartItem}>
                <View style={styles.chartItemHeader}>
                  <View style={styles.chartLabel}>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <Text style={styles.chartLabelText}>{item.category}</Text>
                  </View>
                  <Text style={styles.chartValue}>{item.count}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${item.percentage}%`, backgroundColor: item.color }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Regional Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>क्षेत्रीय प्रदर्शन</Text>
          {regionData.map((region, index) => (
            <View key={index} style={styles.regionCard}>
              <View style={styles.regionHeader}>
                <MapPin size={16} color="#FF9933" />
                <Text style={styles.regionName}>{region.region}</Text>
                <Text style={[
                  styles.regionPercentage,
                  { color: region.percentage >= 70 ? '#138808' : '#FF6B6B' }
                ]}>
                  {region.percentage}%
                </Text>
              </View>
              <View style={styles.regionStats}>
                <Text style={styles.regionStat}>कुल: {region.issues}</Text>
                <Text style={styles.regionStat}>हल किए गए: {region.resolved}</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${region.percentage}%`, 
                      backgroundColor: region.percentage >= 70 ? '#138808' : '#FF6B6B' 
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Trending Issues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ट्रेंडिंग मुद्दे</Text>
          {trendingIssues.map((issue, index) => (
            <View key={index} style={styles.trendingCard}>
              <View style={styles.trendingHeader}>
                <View style={[styles.colorDot, { backgroundColor: issue.color }]} />
                <Text style={styles.trendingTitle}>{issue.title}</Text>
              </View>
              <View style={styles.trendingStats}>
                <Text style={styles.trendingCount}>{issue.count}</Text>
                <Text style={[
                  styles.trendingTrend,
                  { color: issue.trend.startsWith('+') ? '#FF6B6B' : '#138808' }
                ]}>
                  {issue.trend}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Heatmap Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>इश्यू हीटमैप</Text>
          <View style={styles.heatmapContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4', '#138808']}
              style={styles.heatmapGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MapPin size={32} color="#fff" />
              <Text style={styles.heatmapText}>इंटरैक्टिव मैप</Text>
              <Text style={styles.heatmapSubtext}>मुद्दों का भौगोलिक वितरण</Text>
            </LinearGradient>
          </View>
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
  filtersContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: {
    backgroundColor: '#FF9933',
    borderColor: '#FF9933',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
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
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  chartLabelText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  chartValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  regionCard: {
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
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  regionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  regionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  regionStat: {
    fontSize: 12,
    color: '#666',
  },
  trendingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trendingTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  trendingStats: {
    alignItems: 'flex-end',
  },
  trendingCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  trendingTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  heatmapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 100,
  },
  heatmapGradient: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  heatmapSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
});