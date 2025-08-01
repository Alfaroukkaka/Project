// AdminScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  FlatList,
  RefreshControl,
  Share,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminScreen({ navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalPoints: 0,
    activeUsers: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDonations, setUserDonations] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Load admin data on component mount
  useEffect(() => {
    loadAdminData();
  }, []);
  
  // Load all data for admin dashboard
  const loadAdminData = async () => {
    try {
      // Get all users
      const usersJson = await AsyncStorage.getItem('users');
      const usersData = usersJson ? JSON.parse(usersJson) : [];
      setUsers(usersData);
      
      // Calculate statistics
      let totalDonations = 0;
      let totalPoints = 0;
      let activeUsers = 0;
      usersData.forEach(user => {
        if (user.donationHistory) {
          totalDonations += user.donationHistory.length;
        }
        totalPoints += user.points || 0;
        if (user.points > 0) activeUsers++;
      });
      setStats({
        totalUsers: usersData.length,
        totalDonations,
        totalPoints,
        activeUsers,
      });
      
      // Collect all donations
      const allDonations = [];
      usersData.forEach(user => {
        if (user.donationHistory) {
          user.donationHistory.forEach(donation => {
            allDonations.push({
              ...donation,
              userName: user.name,
              userEmail: user.email,
            });
          });
        }
      });
      setDonations(allDonations);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };
  
  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };
  
  // View user details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setUserDonations(user.donationHistory || []);
    setShowUserModal(true);
  };
  
  // Delete user
  const deleteUser = (user) => {
    Alert.alert(
      t('confirmDelete'),
      `${t('deleteUser')} ${user.name}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const usersJson = await AsyncStorage.getItem('users');
              const usersData = usersJson ? JSON.parse(usersJson) : [];
              const updatedUsers = usersData.filter(u => u.email !== user.email);
              await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
              loadAdminData();
              Alert.alert(t('success'), t('userDeleted'));
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert(t('error'), t('tryAgain'));
            }
          },
        },
      ]
    );
  };
  
  // Share admin report
  const shareReport = async () => {
    try {
      const report = `
${t('adminReport')}
${t('generatedOn')}: ${new Date().toLocaleString()}
${t('totalAccounts')}: ${stats.totalUsers}
${t('totalDonations')}: ${stats.totalDonations}
${t('totalPoints')}: ${stats.totalPoints}
${t('activeUsers')}: ${stats.activeUsers}
${t('topUsers')}:
${users
  .sort((a, b) => (b.points || 0) - (a.points || 0))
  .slice(0, 5)
  .map((user, index) => `${index + 1}. ${user.name}: ${user.points || 0} ${t('points')}`)
  .join('\n')}
      `;
      await Share.share({
        message: report,
        title: t('adminReport'),
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };
  
  // Logout function
  const handleLogout = () => {
    Alert.alert(
      t('confirmLogout'),
      t('logoutConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: () => {
            // Navigate back to Welcome screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
            Alert.alert(t('logoutSuccess'), t('adminLoggedOut'));
          },
        },
      ]
    );
  };
  
  // Render user item
  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <FontAwesome5 name="user" size={24} color="#2196F3" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userType}>{item.type}</Text>
        </View>
        <View style={styles.userStats}>
          <Text style={styles.userPoints}>{item.points || 0} {t('points')}</Text>
          <Text style={styles.userDonations}>
            {item.donationHistory ? item.donationHistory.length : 0} {t('donations')}
          </Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => viewUserDetails(item)}
        >
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>{t('view')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteUser(item)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render donation item
  const renderDonationItem = ({ item }) => (
    <View style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <Text style={styles.donationTitle}>{t('donation')} #{item.id}</Text>
        <Text style={styles.donationDate}>{item.date}</Text>
      </View>
      <View style={styles.donationDetails}>
        <View style={styles.donationDetail}>
          <Text style={styles.donationLabel}>{t('user')}:</Text>
          <Text style={styles.donationValue}>{item.userName}</Text>
        </View>
        <View style={styles.donationDetail}>
          <Text style={styles.donationLabel}>{t('peopleServed')}:</Text>
          <Text style={styles.donationValue}>{item.people}</Text>
        </View>
        <View style={styles.donationDetail}>
          <Text style={styles.donationLabel}>{t('foodType')}:</Text>
          <Text style={styles.donationValue}>{item.foodType}</Text>
        </View>
        <View style={styles.donationDetail}>
          <Text style={styles.donationLabel}>{t('location')}:</Text>
          <Text style={styles.donationValue}>{item.location}</Text>
        </View>
        <View style={styles.donationDetail}>
          <Text style={styles.donationLabel}>{t('status')}:</Text>
          <Text style={[styles.donationValue, { color: '#4CAF50' }]}>{item.status}</Text>
        </View>
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('adminDashboard')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={shareReport} style={styles.headerButton}>
            <Ionicons name="share" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Ionicons name="log-out" size={24} color="#fff" />
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
        {/* Users Section - Now at the top */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('registeredUsers')}</Text>
            <Text style={styles.sectionCount}>({stats.totalUsers})</Text>
          </View>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={item => item.email}
            showsVerticalScrollIndicator={false}
          />
        </View>
        
        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
        >
          <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
            <FontAwesome5 name="users" size={24} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>{t('totalAccounts')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <FontAwesome5 name="hand-holding-heart" size={24} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalDonations}</Text>
            <Text style={styles.statLabel}>{t('totalDonations')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
            <FontAwesome5 name="star" size={24} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalPoints}</Text>
            <Text style={styles.statLabel}>{t('totalPoints')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
            <FontAwesome5 name="user-check" size={24} color="#fff" />
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>{t('activeUsers')}</Text>
          </View>
        </ScrollView>
        
        {/* Recent Donations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentDonations')}</Text>
            <Text style={styles.sectionCount}>({donations.length})</Text>
          </View>
          <FlatList
            data={donations.slice(0, 5)}
            renderItem={renderDonationItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
      
      {/* User Details Modal */}
      <Modal visible={showUserModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('userDetails')}</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedUser && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.userDetailCard}>
                  <View style={styles.userDetailHeader}>
                    <View style={styles.userDetailAvatar}>
                      <FontAwesome5 name="user" size={40} color="#2196F3" />
                    </View>
                    <View style={styles.userDetailInfo}>
                      <Text style={styles.userDetailName}>{selectedUser.name}</Text>
                      <Text style={styles.userDetailEmail}>{selectedUser.email}</Text>
                      <Text style={styles.userDetailType}>{selectedUser.type}</Text>
                    </View>
                  </View>
                  <View style={styles.userDetailStats}>
                    <View style={styles.userDetailStat}>
                      <Text style={styles.userDetailStatNumber}>
                        {selectedUser.points || 0}
                      </Text>
                      <Text style={styles.userDetailStatLabel}>{t('points')}</Text>
                    </View>
                    <View style={styles.userDetailStat}>
                      <Text style={styles.userDetailStatNumber}>
                        {selectedUser.donationHistory ? selectedUser.donationHistory.length : 0}
                      </Text>
                      <Text style={styles.userDetailStatLabel}>{t('donations')}</Text>
                    </View>
                  </View>
                  <View style={styles.userDetailSection}>
                    <Text style={styles.userDetailSectionTitle}>{t('contactInformation')}</Text>
                    <Text style={styles.userDetailText}>{t('phone')}: {selectedUser.phone}</Text>
                    {selectedUser.address && (
                      <Text style={styles.userDetailText}>{t('address')}: {selectedUser.address}</Text>
                    )}
                  </View>
                  <View style={styles.userDetailSection}>
                    <Text style={styles.userDetailSectionTitle}>{t('accountInformation')}</Text>
                    <Text style={styles.userDetailText}>{t('memberSince')}: {new Date(selectedUser.createdAt).toLocaleDateString()}</Text>
                    {selectedUser.lastUpdated && (
                      <Text style={styles.userDetailText}>{t('lastUpdated')}: {new Date(selectedUser.lastUpdated).toLocaleDateString()}</Text>
                    )}
                  </View>
                  <View style={styles.userDetailSection}>
                    <Text style={styles.userDetailSectionTitle}>{t('donationHistory')}</Text>
                    {userDonations.length > 0 ? (
                      userDonations.map((donation, index) => (
                        <View key={index} style={styles.userDonationCard}>
                          <View style={styles.userDonationHeader}>
                            <Text style={styles.userDonationTitle}>
                              {t('donation')} #{donation.id}
                            </Text>
                            <Text style={styles.userDonationDate}>{donation.date}</Text>
                          </View>
                          <View style={styles.userDonationDetails}>
                            <Text style={styles.userDonationDetail}>
                              {t('peopleServed')}: {donation.people}
                            </Text>
                            <Text style={styles.userDonationDetail}>
                              {t('foodType')}: {donation.foodType}
                            </Text>
                            <Text style={styles.userDonationDetail}>
                              {t('weight')}: {donation.weight}
                            </Text>
                            <Text style={styles.userDonationDetail}>
                              {t('location')}: {donation.location}
                            </Text>
                            <Text style={styles.userDonationDetail}>
                              {t('status')}: {donation.status}
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>{t('noDonationsYet')}</Text>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userType: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  userDonations: {
    fontSize: 14,
    color: '#4CAF50',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  viewButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  statsContainer: {
    padding: 15,
    marginBottom: 15,
  },
  statCard: {
    width: 150,
    height: 100,
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
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
    marginTop: 5,
    textAlign: 'center',
  },
  donationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  donationDate: {
    fontSize: 12,
    color: '#666',
  },
  donationDetails: {
    marginTop: 10,
  },
  donationDetail: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  donationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    width: 100,
  },
  donationValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    padding: 20,
  },
  userDetailCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20,
  },
  userDetailHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  userDetailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetailInfo: {
    flex: 1,
  },
  userDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetailEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userDetailType: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  userDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  userDetailStat: {
    alignItems: 'center',
  },
  userDetailStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  userDetailStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  userDetailSection: {
    marginBottom: 20,
  },
  userDetailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  userDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userDonationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userDonationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userDonationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  userDonationDate: {
    fontSize: 12,
    color: '#666',
  },
  userDonationDetails: {
    marginTop: 5,
  },
  userDonationDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});