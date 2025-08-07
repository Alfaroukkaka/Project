// screens/DriverDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LanguageContext } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b%3Dscid%3D6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid%3Da3412ad4-1a13-47ce-91a5-c07730964f35&sktid%3Da48cca56-e6da-484e-a814-9c849652bcb3&skt%3D2025-07-28T18%3A06%3A40Z&ske%3D2025-07-29T18%3A06%3A40Z&sks%3Db&skv%3D2024-08-04&sig%3DmmdQBfXRs7Lj0oawM9bB0iG/Apj/eLBFsmCKhmAq7nw%3D';

export default function DriverDashboard({ route, navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const { driverData } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [driverLocation, setDriverLocation] = useState('');
  const [imageError, setImageError] = useState(false);
  const [pointsToAward, setPointsToAward] = useState('');

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Load orders from AsyncStorage
  const loadOrders = async () => {
    try {
      setLoading(true);
      const dashboardDataJson = await AsyncStorage.getItem('dashboardData');
      const dashboardData = dashboardDataJson ? JSON.parse(dashboardDataJson) : { donations: [], users: [] };
      
      // Get users to access their active orders
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Collect all active orders from users
      let allOrders = [];
      users.forEach(user => {
        if (user.activeOrders && user.activeOrders.length > 0) {
          user.activeOrders.forEach(order => {
            // Only include orders that are approved or in progress
            if (order.status === 'approved' || order.status === 'in_progress') {
              allOrders.push({
                ...order,
                userName: user.name,
                userEmail: user.email,
                userPhone: user.phone,
                userType: user.type,
                currentPoints: user.points || 0,
              });
            }
          });
        }
      });
      
      // Sort by most recent
      allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      // Validate points if completing order
      let points = 0;
      if (newStatus === 'completed') {
        points = parseInt(pointsToAward) || 0;
        if (points < 0) {
          Alert.alert('Invalid Points', 'Points must be a positive number');
          return;
        }
      }
      
      // Get users to update their orders
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Find the user with this order
      const userIndex = users.findIndex(u => u.email === selectedOrder.userEmail);
      if (userIndex !== -1) {
        // Update the order status
        const updatedOrders = users[userIndex].activeOrders.map(order => {
          if (order.id === selectedOrder.id) {
            const updatedOrder = {
              ...order,
              status: newStatus,
              driverName: driverData.name,
              driverPhone: driverData.phone,
              deliveryNotes: deliveryNotes,
              driverLocation: driverLocation,
              pointsEarned: points,
              updatedAt: new Date().toISOString(),
            };
            
            // If status is completed, set acknowledged to false so user can mark as done
            if (newStatus === 'completed') {
              updatedOrder.acknowledged = false;
              updatedOrder.completedAt = new Date().toISOString();
              
              // Update user's points
              users[userIndex].points = (users[userIndex].points || 0) + points;
            }
            
            return updatedOrder;
          }
          return order;
        });
        
        users[userIndex].activeOrders = updatedOrders;
        
        // Save updated users
        await AsyncStorage.setItem('users', JSON.stringify(users));
        
        // Add message to user about status update
        const messageTitle = newStatus === 'completed' 
          ? `Order Completed - ${points} Points Awarded!` 
          : `Order ${newStatus}`;
          
        const messageContent = newStatus === 'completed'
          ? `Your ${selectedOrder.type} has been completed. You've been awarded ${points} points by driver ${driverData.name}.`
          : `Your ${selectedOrder.type} has been marked as ${newStatus} by driver ${driverData.name}.`;
          
        const message = {
          id: Date.now(),
          type: 'status_update',
          title: messageTitle,
          content: messageContent,
          orderId: selectedOrder.id,
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        // Add message to user's messages
        if (!users[userIndex].messages) {
          users[userIndex].messages = [];
        }
        users[userIndex].messages.push(message);
        await AsyncStorage.setItem('users', JSON.stringify(users));
        
        // Close modals and refresh orders
        setStatusUpdateModal(false);
        setShowOrderDetails(false);
        setDeliveryNotes('');
        setDriverLocation('');
        setPointsToAward('');
        setImageError(false);
        await loadOrders();
        
        Alert.alert('Success', `Order status updated to ${newStatus}${points > 0 ? ` and ${points} points awarded` : ''}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  // Render order item
  const renderOrderItem = ({ item }) => {
    const statusColor = 
      item.status === 'approved' ? '#FF9800' : 
      item.status === 'in_progress' ? '#2196F3' : '#4CAF50';
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => {
          setSelectedOrder(item);
          setShowOrderDetails(true);
          setImageError(false);
        }}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderType}>
            {item.type === 'donation' ? 'Food Donation' : 'Food Request'}
          </Text>
          <Text style={[styles.orderStatus, { color: statusColor }]}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="user" size={14} color="#666" />
            <Text style={styles.infoText}>{item.userName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <FontAwesome5 name="users" size={14} color="#666" />
            <Text style={styles.infoText}>Serves {item.people} people</Text>
          </View>
          
          <View style={styles.infoRow}>
            <FontAwesome5 name="clock" size={14} color="#666" />
            <Text style={styles.infoText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <FontAwesome5 name="star" size={14} color="#FFD700" />
            <Text style={styles.infoText}>Current Points: {item.currentPoints}</Text>
          </View>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Driver Dashboard</Text>
            <Text style={styles.driverName}>{driverData?.name}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Confirm Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => navigation.replace('Welcome'),
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {orders.filter(o => o.status === 'in_progress').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {orders.filter(o => o.status === 'approved').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
        
        {/* Orders List */}
        <Text style={styles.sectionTitle}>Orders for Delivery</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="inbox" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No orders available for delivery</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
      
      {/* Order Details Modal */}
      <Modal visible={showOrderDetails} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Order Information</Text>
                  <Text style={styles.detailText}>Order ID: #{selectedOrder.id}</Text>
                  <Text style={styles.detailText}>Type: {selectedOrder.type === 'donation' ? 'Food Donation' : 'Food Request'}</Text>
                  <Text style={styles.detailText}>Status: {selectedOrder.status.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.detailText}>Date: {new Date(selectedOrder.date).toLocaleString()}</Text>
                  <Text style={styles.detailText}>Current Points: {selectedOrder.currentPoints}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>User Information</Text>
                  <Text style={styles.detailText}>Name: {selectedOrder.userName}</Text>
                  <Text style={styles.detailText}>Email: {selectedOrder.userEmail}</Text>
                  <Text style={styles.detailText}>Phone: {selectedOrder.userPhone}</Text>
                  <Text style={styles.detailText}>Type: {selectedOrder.userType}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Order Details</Text>
                  <Text style={styles.detailText}>People: {selectedOrder.people}</Text>
                  <Text style={styles.detailText}>Location: {selectedOrder.location}</Text>
                  {selectedOrder.foodType && (
                    <Text style={styles.detailText}>Food Type: {selectedOrder.foodType}</Text>
                  )}
                  {selectedOrder.description && (
                    <Text style={styles.detailText}>Description: {selectedOrder.description}</Text>
                  )}
                </View>
                
                {selectedOrder.imageUri && selectedOrder.imageUri !== '' && !imageError && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Food Image</Text>
                    <Image 
                      source={{ uri: selectedOrder.imageUri }} 
                      style={styles.foodImage}
                      onError={() => setImageError(true)}
                    />
                  </View>
                )}
                
                {imageError && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Food Image</Text>
                    <View style={styles.imageErrorContainer}>
                      <FontAwesome5 name="exclamation-circle" size={24} color="#F44336" />
                      <Text style={styles.imageErrorText}>Failed to load image</Text>
                    </View>
                  </View>
                )}
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                    onPress={() => {
                      setNewStatus('in_progress');
                      setStatusUpdateModal(true);
                    }}
                    disabled={selectedOrder.status === 'in_progress'}
                  >
                    <Text style={styles.actionButtonText}>Mark In Progress</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => {
                      setNewStatus('completed');
                      setStatusUpdateModal(true);
                    }}
                    disabled={selectedOrder.status === 'completed'}
                  >
                    <Text style={styles.actionButtonText}>Mark Completed</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Status Update Modal */}
      <Modal visible={statusUpdateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => {
                setStatusUpdateModal(false);
                setPointsToAward('');
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.updateText}>
                Mark this order as <Text style={styles.statusText}>{newStatus.replace('_', ' ')}</Text>?
              </Text>
              
              {newStatus === 'completed' && (
                <>
                  <Text style={styles.inputLabel}>Points to Award</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter points to award..."
                    value={pointsToAward}
                    onChangeText={setPointsToAward}
                    keyboardType="numeric"
                  />
                </>
              )}
              
              <Text style={styles.inputLabel}>Delivery Notes (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add notes about the delivery..."
                value={deliveryNotes}
                onChangeText={setDeliveryNotes}
                multiline
              />
              
              <Text style={styles.inputLabel}>Your Current Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your current location..."
                value={driverLocation}
                onChangeText={setDriverLocation}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                  onPress={() => {
                    setStatusUpdateModal(false);
                    setPointsToAward('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
                  onPress={updateOrderStatus}
                >
                  <Text style={styles.modalButtonText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  driverName: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 12,
    color: '#999',
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
    elevation: 5,
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
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  imageErrorContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  imageErrorText: {
    color: '#F44336',
    marginTop: 10,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 0.48,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  updateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.48,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
