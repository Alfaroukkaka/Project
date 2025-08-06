import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Dimensions,
  RefreshControl,
  Share,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b%3Dscid%3D6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid%3Da3412ad4-1a13-47ce-91a5-c07730964f35&sktid%3Da48cca56-e6da-484e-a814-9c849652bcb3&skt%3D2025-07-28T18%3A06%3A40Z&ske%3D2025-07-29T18%3A06%3A40Z&sks%3Db&skv%3D2024-08-04&sig%3DmmdQBfXRs7Lj0oawM9bB0iG/Apj/eLBFsmCKhmAq7nw%3D';

export default function GovernmentDashboard({ navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalPoints: 0,
    monthlyDonations: [],
    monthlyUsers: [],
    recentActivities: [],
    environmentalImpact: {
      wasteReduced: 0,
      co2Saved: 0,
      waterSaved: 0,
    },
    userGrowth: 0,
    donationGrowth: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // New state for chart navigation
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
  const [currentPeriodStart, setCurrentPeriodStart] = useState(new Date());
  const [chartData, setChartData] = useState({
    donations: [],
    users: []
  });
  
  // Load government data on component mount
  useEffect(() => {
    loadGovernmentData();
  }, []);
  
  // Update chart data when view mode or period changes
  useEffect(() => {
    updateChartData();
  }, [viewMode, currentPeriodStart]);
  
  // Load all data for government dashboard
  const loadGovernmentData = async () => {
    try {
      // Get all users
      const usersJson = await AsyncStorage.getItem('users');
      const usersData = usersJson ? JSON.parse(usersJson) : [];
      
      // Get dashboard data
      const dashboardDataJson = await AsyncStorage.getItem('dashboardData');
      const dashboardData = dashboardDataJson ? JSON.parse(dashboardDataJson) : {
        donations: [],
        users: []
      };
      
      // Calculate statistics
      let totalPoints = 0;
      let wasteReduced = 0;
      let co2Saved = 0;
      let waterSaved = 0;
      
      // Combine donations from dashboard data and user data
      const allDonations = [...dashboardData.donations];
      
      usersData.forEach(user => {
        totalPoints += user.points || 0;
        
        // Add user registration to dashboard data if not already there
        if (user.createdAt && !dashboardData.users.some(u => u.userEmail === user.email)) {
          dashboardData.users.push({
            date: user.createdAt,
            type: 'user',
            user: user.name,
            userEmail: user.email,
            userType: user.type,
          });
        }
        
        // Collect donations from user data (for backward compatibility)
        if (user.donationHistory) {
          user.donationHistory.forEach(donation => {
            allDonations.push({
              id: donation.id,
              date: donation.date,
              type: 'donation',
              userName: user.name,
              userEmail: user.email,
              foodType: donation.foodType || 'Unknown',
              weight: donation.weight || 'Unknown',
              people: donation.people,
              status: donation.status,
              timestamp: new Date(donation.date).getTime()
            });
            
            // Environmental impact calculations
            wasteReduced += 2.5; // kg per donation
            co2Saved += 4.2; // kg CO2 per donation
            waterSaved += 1000; // liters per donation
          });
        }
      });
      
      // Save updated dashboard data
      await AsyncStorage.setItem('dashboardData', JSON.stringify(dashboardData));
      
      // Generate initial chart data
      const weeklyDonationsData = generateWeeklyData(allDonations);
      const weeklyUsersData = generateWeeklyData(dashboardData.users);
      
      // Calculate growth rates
      const userGrowth = calculateGrowthRate(weeklyUsersData);
      const donationGrowth = calculateGrowthRate(weeklyDonationsData);
      
      // Sort recent activities by date
      const recentActivities = allDonations
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setStats({
        totalUsers: usersData.length,
        totalDonations: allDonations.length,
        totalPoints,
        monthlyDonations: weeklyDonationsData,
        monthlyUsers: weeklyUsersData,
        recentActivities,
        environmentalImpact: {
          wasteReduced: wasteReduced.toFixed(1),
          co2Saved: co2Saved.toFixed(1),
          waterSaved: waterSaved.toFixed(0),
        },
        userGrowth,
        donationGrowth,
      });
      
      // Store raw data for chart updates
      setChartData({
        donations: allDonations,
        users: dashboardData.users
      });
    } catch (error) {
      console.error('Error loading government data:', error);
    }
  };
  
  // Update chart data based on current view mode and period
  const updateChartData = () => {
    if (chartData.donations.length === 0 || chartData.users.length === 0) return;
    
    let donationsData, usersData;
    
    if (viewMode === 'weekly') {
      donationsData = generateWeeklyData(chartData.donations);
      usersData = generateWeeklyData(chartData.users);
    } else {
      donationsData = generateMonthlyData(chartData.donations);
      usersData = generateMonthlyData(chartData.users);
    }
    
    // Calculate growth rates
    const userGrowth = calculateGrowthRate(usersData);
    const donationGrowth = calculateGrowthRate(donationsData);
    
    setStats(prev => ({
      ...prev,
      monthlyDonations: donationsData,
      monthlyUsers: usersData,
      userGrowth,
      donationGrowth
    }));
  };
  
  // Generate weekly data for charts - starting from Friday
  const generateWeeklyData = (items) => {
    const today = new Date(currentPeriodStart);
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
    
    // Calculate the most recent Friday
    let lastFriday = new Date(today);
    if (currentDay >= 5) { // If today is Friday or later
      lastFriday.setDate(today.getDate() - (currentDay - 5));
    } else { // If today is before Friday
      lastFriday.setDate(today.getDate() - (currentDay + 2));
    }
    
    const data = [];
    
    // Generate data for the last 6 weeks, each starting from Friday
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(lastFriday);
      weekStart.setDate(lastFriday.getDate() - i * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Thursday)
      
      // Count items for this week
      const count = items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekStart && itemDate <= weekEnd;
      }).length;
      
      // Format week label as "Fri MM/DD"
      const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      
      data.push({
        week: weekLabel,
        count,
        weekStart,
        weekEnd,
      });
    }
    
    return data;
  };
  
  // Generate monthly data for charts
  const generateMonthlyData = (items) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date(currentPeriodStart).getMonth();
    const currentYear = new Date(currentPeriodStart).getFullYear();
    const data = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i >= 0 ? currentYear : currentYear - 1;
      const monthName = monthNames[monthIndex];
      
      // Count items for this month
      const count = items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === monthIndex && itemDate.getFullYear() === year;
      }).length;
      
      data.push({
        week: monthName, // Using 'week' property for consistency
        count,
        monthIndex,
        year,
      });
    }
    
    return data;
  };
  
  // Calculate growth rate
  const calculateGrowthRate = (data) => {
    if (data.length < 2) return 0;
    
    const currentPeriod = data[data.length - 1].count;
    const previousPeriod = data[data.length - 2].count;
    
    if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
    
    return ((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1);
  };
  
  // Navigate to previous period
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentPeriodStart);
    if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() - 7); // Go back one week
    } else {
      newDate.setMonth(newDate.getMonth() - 1); // Go back one month
    }
    setCurrentPeriodStart(newDate);
  };
  
  // Navigate to next period
  const goToNextPeriod = () => {
    const newDate = new Date(currentPeriodStart);
    if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + 7); // Go forward one week
    } else {
      newDate.setMonth(newDate.getMonth() + 1); // Go forward one month
    }
    setCurrentPeriodStart(newDate);
  };
  
  // Go to current period
  const goToCurrentPeriod = () => {
    setCurrentPeriodStart(new Date());
  };
  
  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'weekly' ? 'monthly' : 'weekly');
  };
  
  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadGovernmentData();
    setRefreshing(false);
  };
  
  // Share government report
  const shareReport = async () => {
    try {
      const report = `
Tawfeer Government Report
Generated on: ${new Date().toLocaleString()}
Key Statistics:
- Total Registered Users: ${stats.totalUsers}
- Total Food Donations: ${stats.totalDonations}
- Total Points: ${stats.totalPoints}
- User Growth Rate: ${stats.userGrowth}%
- Donation Growth Rate: ${stats.donationGrowth}%
${viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Donations:
${stats.monthlyDonations.map(item => `${item.week}: ${item.count}`).join('\n')}
${viewMode === 'weekly' ? 'Weekly' : 'Monthly'} User Registrations:
${stats.monthlyUsers.map(item => `${item.week}: ${item.count}`).join('\n')}
Environmental Impact:
- Food Waste Reduced: ${stats.environmentalImpact.wasteReduced} kg
- CO2 Emissions Saved: ${stats.environmentalImpact.co2Saved} kg
- Water Saved: ${stats.environmentalImpact.waterSaved} liters
This report demonstrates the positive impact of Tawfeer on UAE's sustainability goals.
      `;
      await Share.share({
        message: report,
        title: 'Tawfeer Government Report',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };
  
  // Logout function
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
            Alert.alert('Logged Out', 'You have been successfully logged out');
          },
        },
      ]
    );
  };
  
  // Render line chart
  const renderLineChart = (data, title, color, growthRate) => {
    const maxValue = Math.max(...data.map(item => item.count), 1);
    const chartWidth = width - 130; // Adjusted for padding
    const chartHeight = 80; // Reduced height for padding
    const padding = 15; // Inner padding for all sides
    const stepX = chartWidth / (data.length - 1);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={styles.growthIndicator}>
            <FontAwesome5 
              name={growthRate >= 0 ? "arrow-up" : "arrow-down"} 
              size={12} 
              color={growthRate >= 0 ? "#4CAF50" : "#F44336"} 
            />
            <Text style={[styles.growthRate, { color: growthRate >= 0 ? "#4CAF50" : "#F44336" }]}>
              {growthRate >= 0 ? '+' : ''}{growthRate}%
            </Text>
          </View>
        </View>
        
        {/* Chart navigation controls */}
        <View style={styles.chartControls}>
          <TouchableOpacity onPress={goToPreviousPeriod} style={styles.navButton}>
            <Ionicons name="chevron-back" size={16} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleViewMode} style={styles.viewModeButton}>
            <Text style={styles.viewModeText}>{viewMode === 'weekly' ? 'Weekly' : 'Monthly'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToCurrentPeriod} style={styles.currentPeriodButton}>
            <Text style={styles.currentPeriodText}>Current</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextPeriod} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartArea}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>{maxValue}</Text>
            <Text style={styles.yAxisLabel}>{Math.floor(maxValue * 0.66)}</Text>
            <Text style={styles.yAxisLabel}>{Math.floor(maxValue * 0.33)}</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
          
          {/* Chart content with clear boundaries */}
          <View style={styles.chartContent}>
            {/* Grid lines */}
            <View style={styles.gridLines}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
            </View>
            
            {/* Chart boundary box with padding */}
            <View style={styles.chartBoundary}>
              {/* Line chart */}
              <View style={styles.lineChartContainer}>
                {/* Line path */}
                <View style={styles.linePath}>
                  {data.map((item, index) => {
                    if (index === 0) return null;
                    const prevItem = data[index - 1];
                    const x1 = (index - 1) * stepX + padding; // Add padding
                    const y1 = padding + (chartHeight - (prevItem.count / maxValue) * chartHeight); // Add top padding
                    const x2 = index * stepX + padding; // Add padding
                    const y2 = padding + (chartHeight - (item.count / maxValue) * chartHeight); // Add top padding
                    
                    // Calculate line segment properties
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    return (
                      <View
                        key={`line-${index}`}
                        style={[
                          styles.lineSegment,
                          {
                            left: x1,
                            top: y1,
                            width: length,
                            transform: [{ rotate: `${angle}deg` }],
                            backgroundColor: color,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
                
                {/* Data points and labels */}
                {data.map((item, index) => {
                  const x = index * stepX + padding; // Add padding
                  const y = padding + (chartHeight - (item.count / maxValue) * chartHeight); // Add top padding
                  
                  return (
                    <View key={index}>
                      {/* Data point */}
                      <View style={[styles.dataPoint, { backgroundColor: color, left: x - 4, top: y - 4 }]} />
                      
                      {/* Value label */}
                      <Text style={[styles.dataValue, { left: x - 10, top: y - 20 }]}>
                        {item.count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            
            {/* X-axis labels - positioned below the chart */}
            <View style={styles.xAxisContainer}>
              {data.map((item, index) => {
                const x = index * stepX + padding; // Match data point positioning
                
                return (
                  <Text
                    key={`x-label-${index}`}
                    style={[
                      styles.xAxisLabel,
                      {
                        left: x - 15, // Center the label under the point
                        position: 'absolute',
                      }
                    ]}
                  >
                    {item.week}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  // Render activity item
  const renderActivityItem = (item, index) => {
    let icon, iconColor, actionText;
    
    if (item.type === 'donation') {
      icon = 'hand-holding-heart';
      iconColor = '#4CAF50';
      actionText = `Donation ${item.status}`;
    } else if (item.type === 'request') {
      icon = 'hand-holding-medical';
      iconColor = '#FF9800';
      actionText = `Request ${item.status}`;
    } else {
      icon = 'user-plus';
      iconColor = '#2196F3';
      actionText = 'Registration';
    }
    
    return (
      <View key={index} style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: iconColor }]}>
          <FontAwesome5 name={icon} size={14} color="#fff" />
        </View>
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityUser}>{item.userName}</Text>
            <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.activityAction}>{actionText}</Text>
          {item.foodType && (
            <Text style={styles.activityFoodType}>{item.foodType}</Text>
          )}
        </View>
      </View>
    );
  };
  
  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <SafeAreaView style={styles.container}>
        {/* Header - Single Line */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Government Dashboard</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={shareReport} style={styles.headerButton}>
              <Ionicons name="share" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Key Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
              <FontAwesome5 name="users" size={20} color="#fff" />
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Users</Text>
              <View style={styles.growthBadge}>
                <FontAwesome5 name={stats.userGrowth >= 0 ? "arrow-up" : "arrow-down"} size={8} color="#fff" />
                <Text style={styles.growthText}>{stats.userGrowth}%</Text>
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
              <FontAwesome5 name="donate" size={20} color="#fff" />
              <Text style={styles.statNumber}>{stats.totalDonations}</Text>
              <Text style={styles.statLabel}>Donations</Text>
              <View style={styles.growthBadge}>
                <FontAwesome5 name={stats.donationGrowth >= 0 ? "arrow-up" : "arrow-down"} size={8} color="#fff" />
                <Text style={styles.growthText}>{stats.donationGrowth}%</Text>
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
              <FontAwesome5 name="star" size={20} color="#fff" />
              <Text style={styles.statNumber}>{stats.totalPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
          
          {/* Vertical Line Charts */}
          <View style={styles.chartsContainer}>
            {renderLineChart(stats.monthlyDonations, `${viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Donations`, '#4CAF50', stats.donationGrowth)}
            {renderLineChart(stats.monthlyUsers, `${viewMode === 'weekly' ? 'Weekly' : 'Monthly'} User Growth`, '#2196F3', stats.userGrowth)}
          </View>
          
          {/* Environmental Impact */}
          <View style={styles.impactContainer}>
            <Text style={styles.sectionTitle}>Environmental Impact</Text>
            <View style={styles.impactCards}>
              <View style={styles.impactCard}>
                <FontAwesome5 name="weight" size={18} color="#4CAF50" />
                <Text style={styles.impactValue}>{stats.environmentalImpact.wasteReduced}</Text>
                <Text style={styles.impactLabel}>kg Waste</Text>
              </View>
              <View style={styles.impactCard}>
                <FontAwesome5 name="cloud" size={18} color="#2196F3" />
                <Text style={styles.impactValue}>{stats.environmentalImpact.co2Saved}</Text>
                <Text style={styles.impactLabel}>kg CO₂</Text>
              </View>
              <View style={styles.impactCard}>
                <FontAwesome5 name="tint" size={18} color="#FF9800" />
                <Text style={styles.impactValue}>{stats.environmentalImpact.waterSaved}</Text>
                <Text style={styles.impactLabel}>Liters Water</Text>
              </View>
            </View>
          </View>
          
          {/* Recent Activities */}
          <View style={styles.activitiesContainer}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <View style={styles.activitiesList}>
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map(renderActivityItem)
              ) : (
                <Text style={styles.emptyText}>No recent activities</Text>
              )}
            </View>
          </View>
          
          {/* Bottom spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(18,18,18,0.9)',
  },
  
  // Header - Single Line
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 10,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  content: {
    flex: 1,
    padding: 15,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: width * 0.3,
    height: 100,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  growthText: {
    fontSize: 9,
    color: '#fff',
    marginLeft: 2,
  },
  
  // Vertical Line Charts
  chartsContainer: {
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthRate: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Chart Controls
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  currentPeriodButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 15,
  },
  currentPeriodText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Line Chart Area
  chartArea: {
    flexDirection: 'row',
    height: 180, // Total height including x-axis labels
  },
  yAxis: {
    width: 35,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 40, // Space for x-axis labels
    paddingRight: 8,
    height: 110, // Match chart height + padding
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110, // Chart height + padding
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  
  // Chart Boundary Box with padding
  chartBoundary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110, // Chart height + padding
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  
  // Line Chart Specific
  lineChartContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  linePath: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    transformOrigin: '0% 0%',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  dataValue: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    width: 20,
    zIndex: 3,
  },
  
  // X-axis labels container
  xAxisContainer: {
    position: 'absolute',
    top: 115, // Position below the chart + padding
    left: 0,
    right: 0,
    height: 30, // Height for x-axis labels
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 5,
  },
  xAxisLabel: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    width: 50, // Width for x-axis labels
  },
  
  // Environmental Impact
  impactContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  impactCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: width * 0.3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 3,
  },
  impactLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  
  // Recent Activities
  activitiesContainer: {
    marginBottom: 20,
  },
  activitiesList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', 
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activityDate: {
    fontSize: 10,
    color: '#999',
  },
  activityAction: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityFoodType: {
    fontSize: 11,
    color: '#999',
    marginTop: 1,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
