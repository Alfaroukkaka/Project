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
  ImageBackground,
  TextInput,
  Button,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b&scid=6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A29%3A10Z&ske=2025-07-29T19%3A29%3A10Z&sks=b&skv=2024-08-04&sig=XzlWCkpkIXxTAW/KdVDRLSff3wLkc8QMpA3siJNiCHU%3D';

export default function AdminScreen({ navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalPoints: 0,
    activeUsers: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    completedOrders: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  
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
      let totalPoints = 0;
      let activeUsers = 0;
      usersData.forEach(user => {
        totalPoints += user.points || 0;
        if (user.points > 0) activeUsers++;
      });
      
      // Collect all orders from all users
      const allOrders = [];
      let pendingOrders = 0;
      let approvedOrders = 0;
      let completedOrders = 0;
      
      usersData.forEach(user => {
        if (user.activeOrders) {
          user.activeOrders.forEach(order => {
            allOrders.push({
              ...order,
              userName: user.name,
              userEmail: user.email,
              userPhone: user.phone,
            });
            
            // Count orders by status
            if (order.status === 'pending') pendingOrders++;
            else if (order.status === 'approved') approvedOrders++;
            else if (order.status === 'completed') completedOrders++;
          });
        }
      });
      
      setOrders(allOrders);
      
      setStats({
        totalUsers: usersData.length,
        totalOrders: allOrders.length,
        totalPoints,
        activeUsers,
        pendingOrders,
        approvedOrders,
        completedOrders,
      });
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
  
  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDriverName(order.driverName || '');
    setDriverPhone(order.driverPhone || '');
    setEstimatedTime(
      order.type === 'donation' ? order.estimatedPickup || '' : order.estimatedDelivery || ''
    );
    setShowOrderModal(true);
  };
  
  // Approve order
  const approveOrder = async () => {
    try {
      // Update order status
      const updatedOrder = {
        ...selectedOrder,
        status: 'approved',
        driverName,
        driverPhone,
        estimatedPickup: selectedOrder.type === 'donation' ? estimatedTime : '',
        estimatedDelivery: selectedOrder.type === 'request' ? estimatedTime : '',
        acknowledged: false, // Reset acknowledged flag when approving
      };
      
      // Get all users
      const usersJson = await AsyncStorage.getItem('users');
      const usersData = usersJson ? JSON.parse(usersJson) : [];
      
      // Find the user who made the order
      const userIndex = usersData.findIndex(u => u.email === selectedOrder.userEmail);
      
      if (userIndex !== -1) {
        // Update the order in user's active orders
        const orderIndex = usersData[userIndex].activeOrders.findIndex(
          o => o.id === selectedOrder.id
        );
        
        if (orderIndex !== -1) {
          usersData[userIndex].activeOrders[orderIndex] = updatedOrder;
          
          // Add points if it's a donation
          if (selectedOrder.type === 'donation') {
            usersData[userIndex].points += 20;
            
            // Update donation history
            const donationIndex = usersData[userIndex].donationHistory.findIndex(
              d => d.id === selectedOrder.id
            );
            
            if (donationIndex !== -1) {
              usersData[userIndex].donationHistory[donationIndex] = {
                ...usersData[userIndex].donationHistory[donationIndex],
                status: 'approved',
                driverName,
                driverPhone,
                estimatedPickup: estimatedTime,
                pointsEarned: 20,
              };
            }
          }
          
          // Save updated users data
          await AsyncStorage.setItem('users', JSON.stringify(usersData));
          
          // Close modal and refresh data
          setShowOrderModal(false);
          loadAdminData();
          
          Alert.alert('Success', 'Order has been approved successfully');
        }
      }
    } catch (error) {
      console.error('Error approving order:', error);
      Alert.alert('Error', 'Failed to approve order. Please try again.');
    }
  };
  
  // Complete order
  const completeOrder = async () => {
    try {
      // Update order status
      const updatedOrder = {
        ...selectedOrder,
        status: 'completed',
        acknowledged: false, // Reset acknowledged flag when completing
      };
      
      // Get all users
      const usersJson = await AsyncStorage.getItem('users');
      const usersData = usersJson ? JSON.parse(usersJson) : [];
      
      // Find the user who made the order
      const userIndex = usersData.findIndex(u => u.email === selectedOrder.userEmail);
      
      if (userIndex !== -1) {
        // Update the order in user's active orders
        const orderIndex = usersData[userIndex].activeOrders.findIndex(
          o => o.id === selectedOrder.id
        );
        
        if (orderIndex !== -1) {
          usersData[userIndex].activeOrders[orderIndex] = updatedOrder;
          
          // Update donation history if it's a donation
          if (selectedOrder.type === 'donation') {
            const donationIndex = usersData[userIndex].donationHistory.findIndex(
              d => d.id === selectedOrder.id
            );
            
            if (donationIndex !== -1) {
              usersData[userIndex].donationHistory[donationIndex] = {
                ...usersData[userIndex].donationHistory[donationIndex],
                status: 'completed',
              };
            }
          }
          
          // Add completion message
          const completionMessage = {
            id: Date.now(),
            type: 'completion',
            title: 'Order Completed',
            content: `Your ${selectedOrder.type} order has been completed on ${new Date().toLocaleString()}. Thank you for your contribution!`,
            orderId: selectedOrder.id,
            timestamp: new Date().toISOString(),
            read: false
          };
          
          // Initialize messages array if it doesn't exist
          if (!usersData[userIndex].messages) {
            usersData[userIndex].messages = [];
          }
          
          // Add the completion message
          usersData[userIndex].messages.push(completionMessage);
          
          // Save updated users data
          await AsyncStorage.setItem('users', JSON.stringify(usersData));
          
          // Close modal and refresh data
          setShowOrderModal(false);
          loadAdminData();
          
          Alert.alert('Success', 'Order has been marked as completed');
        }
      }
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Error', 'Failed to complete order. Please try again.');
    }
  };
  
  // Reject order
  const rejectOrder = async () => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update order status
              const updatedOrder = {
                ...selectedOrder,
                status: 'rejected',
              };
              
              // Get all users
              const usersJson = await AsyncStorage.getItem('users');
              const usersData = usersJson ? JSON.parse(usersJson) : [];
              
              // Find the user who made the order
              const userIndex = usersData.findIndex(u => u.email === selectedOrder.userEmail);
              
              if (userIndex !== -1) {
                // Update the order in user's active orders
                const orderIndex = usersData[userIndex].activeOrders.findIndex(
                  o => o.id === selectedOrder.id
                );
                
                if (orderIndex !== -1) {
                  usersData[userIndex].activeOrders[orderIndex] = updatedOrder;
                  
                  // Update donation history if it's a donation
                  if (selectedOrder.type === 'donation') {
                    const donationIndex = usersData[userIndex].donationHistory.findIndex(
                      d => d.id === selectedOrder.id
                    );
                    
                    if (donationIndex !== -1) {
                      usersData[userIndex].donationHistory[donationIndex] = {
                        ...usersData[userIndex].donationHistory[donationIndex],
                        status: 'rejected',
                      };
                    }
                  }
                  
                  // Save updated users data
                  await AsyncStorage.setItem('users', JSON.stringify(usersData));
                  
                  // Close modal and refresh data
                  setShowOrderModal(false);
                  loadAdminData();
                  
                  Alert.alert('Success', 'Order has been rejected');
                }
              }
            } catch (error) {
              console.error('Error rejecting order:', error);
              Alert.alert('Error', 'Failed to reject order. Please try again.');
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
${t('totalOrders')}: ${stats.totalOrders}
${t('totalPoints')}: ${stats.totalPoints}
${t('activeUsers')}: ${stats.activeUsers}
Pending Orders: ${stats.pendingOrders}
Approved Orders: ${stats.approvedOrders}
Completed Orders: ${stats.completedOrders}
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
  
  // Render order item
  const renderOrderItem = ({ item }) => {
    let statusColor = '#FF9800'; // Default: pending
    let statusText = 'Pending';
    
    if (item.status === 'approved') {
      statusColor = '#4CAF50';
      statusText = 'Approved';
    } else if (item.status === 'completed') {
      statusColor = '#2196F3';
      statusText = 'Completed';
    } else if (item.status === 'rejected') {
      statusColor = '#F44336';
      statusText = 'Rejected';
    }
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTypeContainer}>
            <Text style={styles.orderType}>
              {item.type === 'donation' ? 'Donation' : 'Request'}
            </Text>
            <Text style={styles.orderId}>#{item.id}</Text>
          </View>
          <View style={styles.orderStatusContainer}>
            <Text style={[styles.orderStatus, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <Text style={styles.orderLabel}>User:</Text>
            <Text style={styles.orderValue}>{item.userName}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderLabel}>Contact:</Text>
            <Text style={styles.orderValue}>{item.userPhone}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderLabel}>People:</Text>
            <Text style={styles.orderValue}>{item.people}</Text>
          </View>
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderLabel}>Location:</Text>
            <Text style={styles.orderValue}>{item.location}</Text>
          </View>
          
          {item.type === 'donation' && (
            <View style={styles.orderDetail}>
              <Text style={styles.orderLabel}>Food Type:</Text>
              <Text style={styles.orderValue}>{item.foodType}</Text>
            </View>
          )}
          
          {item.type === 'request' && (
            <View style={styles.orderDetail}>
              <Text style={styles.orderLabel}>Reason:</Text>
              <Text style={styles.orderValue}>{item.reason}</Text>
            </View>
          )}
          
          <View style={styles.orderDetail}>
            <Text style={styles.orderLabel}>Date:</Text>
            <Text style={styles.orderValue}>{item.date}</Text>
          </View>
        </View>
        
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.orderImage} />
        )}
        
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => viewOrderDetails(item)}
          >
            <Ionicons name="eye" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          
          {item.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => viewOrderDetails(item)}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => {
                  setSelectedOrder(item);
                  rejectOrder();
                }}
              >
                <Ionicons name="close" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          
          {item.status === 'approved' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => {
                setSelectedOrder(item);
                completeOrder();
              }}
            >
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
          <Text style={styles.userOrders}>
            {item.activeOrders ? item.activeOrders.length : 0} {t('orders')}
          </Text>
        </View>
      </View>
    </View>
  );
  
  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <View style={[styles.container, { backgroundColor: darkMode ? 'rgba(18,18,18,0.85)' : 'rgba(245,245,245,0.85)' }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={shareReport} style={styles.headerButton}>
              <Ionicons name="share" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>{t('adminDashboard')}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>{t('logout')}</Text>
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
            <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
              <FontAwesome5 name="clipboard-list" size={24} color="#fff" />
              <Text style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
              <FontAwesome5 name="clock" size={24} color="#fff" />
              <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
              <FontAwesome5 name="check-circle" size={24} color="#fff" />
              <Text style={styles.statNumber}>{stats.approvedOrders}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
              <FontAwesome5 name="check-double" size={24} color="#fff" />
              <Text style={styles.statNumber}>{stats.completedOrders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
              <FontAwesome5 name="star" size={24} color="#fff" />
              <Text style={styles.statNumber}>{stats.totalPoints}</Text>
              <Text style={styles.statLabel}>{t('totalPoints')}</Text>
            </View>
          </ScrollView>
          
          {/* Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Orders</Text>
              <Text style={styles.sectionCount}>({orders.length})</Text>
            </View>
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No orders found</Text>
              }
            />
          </View>
          
          {/* Users Section */}
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
          
          {/* Bottom spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
        
        {/* Order Details Modal */}
        <Modal visible={showOrderModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedOrder?.type === 'donation' ? 'Donation' : 'Request'} Details
                </Text>
                <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              {selectedOrder && (
                <ScrollView style={styles.modalScroll}>
                  {/* Order Information */}
                  <View style={styles.orderDetailSection}>
                    <Text style={styles.orderDetailSectionTitle}>Order Information</Text>
                    <Text style={styles.orderDetailText}>
                      Order ID: #{selectedOrder.id}
                    </Text>
                    <Text style={styles.orderDetailText}>
                      Type: {selectedOrder.type === 'donation' ? 'Donation' : 'Request'}
                    </Text>
                    <Text style={styles.orderDetailText}>
                      Status: {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Text>
                    <Text style={styles.orderDetailText}>
                      Date: {selectedOrder.date}
                    </Text>
                  </View>
                  
                  {/* User Information */}
                  <View style={styles.orderDetailSection}>
                    <Text style={styles.orderDetailSectionTitle}>User Information</Text>
                    <Text style={styles.orderDetailText}>
                      Name: {selectedOrder.userName}
                    </Text>
                    <Text style={styles.orderDetailText}>
                      Email: {selectedOrder.userEmail}
                    </Text>
                    <Text style={styles.orderDetailText}>
                      Phone: {selectedOrder.userPhone}
                    </Text>
                  </View>
                  
                  {/* Order Details */}
                  <View style={styles.orderDetailSection}>
                    <Text style={styles.orderDetailSectionTitle}>
                      {selectedOrder.type === 'donation' ? 'Donation' : 'Request'} Details
                    </Text>
                    <Text style={styles.orderDetailText}>
                      People: {selectedOrder.people}
                    </Text>
                    {selectedOrder.type === 'donation' && (
                      <>
                        <Text style={styles.orderDetailText}>
                          Food Type: {selectedOrder.foodType}
                        </Text>
                        <Text style={styles.orderDetailText}>
                          Is New: {selectedOrder.isNew ? 'Yes' : 'No'}
                        </Text>
                        <Text style={styles.orderDetailText}>
                          Is Consumable: {selectedOrder.isConsumable ? 'Yes' : 'No'}
                        </Text>
                      </>
                    )}
                    {selectedOrder.type === 'request' && (
                      <Text style={styles.orderDetailText}>
                        Reason: {selectedOrder.reason}
                      </Text>
                    )}
                    <Text style={styles.orderDetailText}>
                      Location: {selectedOrder.location}
                    </Text>
                  </View>
                  
                  {/* Image */}
                  {selectedOrder.imageUri && (
                    <View style={styles.orderDetailSection}>
                      <Text style={styles.orderDetailSectionTitle}>Food Image</Text>
                      <Image 
                        source={{ uri: selectedOrder.imageUri }} 
                        style={styles.orderDetailImage} 
                      />
                    </View>
                  )}
                  
                  {/* Driver Assignment (for pending orders) */}
                  {selectedOrder.status === 'pending' && (
                    <View style={styles.orderDetailSection}>
                      <Text style={styles.orderDetailSectionTitle}>Assign Driver</Text>
                      <TextInput
                        style={styles.driverInput}
                        placeholder="Driver Name"
                        value={driverName}
                        onChangeText={setDriverName}
                      />
                      <TextInput
                        style={styles.driverInput}
                        placeholder="Driver Phone"
                        value={driverPhone}
                        onChangeText={setDriverPhone}
                        keyboardType="phone-pad"
                      />
                      <TextInput
                        style={styles.driverInput}
                        placeholder={
                          selectedOrder.type === 'donation' 
                            ? 'Estimated Pickup Time' 
                            : 'Estimated Delivery Time'
                        }
                        value={estimatedTime}
                        onChangeText={setEstimatedTime}
                      />
                    </View>
                  )}
                  
                  {/* Driver Information (for approved orders) */}
                  {(selectedOrder.status === 'approved' || selectedOrder.status === 'completed') && (
                    <View style={styles.orderDetailSection}>
                      <Text style={styles.orderDetailSectionTitle}>Driver Information</Text>
                      <Text style={styles.orderDetailText}>
                        Name: {selectedOrder.driverName || 'Not assigned'}
                      </Text>
                      <Text style={styles.orderDetailText}>
                        Phone: {selectedOrder.driverPhone || 'Not assigned'}
                      </Text>
                      <Text style={styles.orderDetailText}>
                        {selectedOrder.type === 'donation' 
                          ? `Estimated Pickup: ${selectedOrder.estimatedPickup || 'Not scheduled'}`
                          : `Estimated Delivery: ${selectedOrder.estimatedDelivery || 'Not scheduled'}`
                        }
                      </Text>
                    </View>
                  )}
                  
                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    {selectedOrder.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.approveButton]}
                          onPress={approveOrder}
                        >
                          <Text style={styles.modalButtonText}>Approve Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.rejectButton]}
                          onPress={rejectOrder}
                        >
                          <Text style={styles.modalButtonText}>Reject Order</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    
                    {selectedOrder.status === 'approved' && (
                      <TouchableOpacity
                        style={[styles.modalButton, styles.completeButton]}
                        onPress={completeOrder}
                      >
                        <Text style={styles.modalButtonText}>Mark as Completed</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerButton: {
    padding: 5,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  
  // Stats Cards
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
  
  // Order Cards
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  orderId: {
    fontSize: 14,
    color: '#666',
  },
  orderStatusContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    marginTop: 10,
  },
  orderDetail: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  orderLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 100,
  },
  orderValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  
  // User Cards
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
  userOrders: {
    fontSize: 14,
    color: '#4CAF50',
  },
  
  // Modal Styles
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
  orderDetailSection: {
    marginBottom: 20,
  },
  orderDetailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderDetailImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  driverInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10, 
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.45, // Reduced from 0.48 to add more space between buttons
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
