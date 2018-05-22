// @flow
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  RefreshControl,
  StatusBar,
  Alert,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SwipeListView } from 'react-native-swipe-list-view';
import PropTypes from 'prop-types';
import Toast from 'react-native-easy-toast';

import ApprovalsRowFront from './ApprovalsRowFront';
import ApprovalsRowBack from './ApprovalsRowBack';
import UserService from '../../services/userService';
import { theme } from '../../styles';

class Approvals extends Component {
  static navigationOptions = {
    tabBarLabel: 'Approvals',
  }

  static propTypes = {
    navigation: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      pendingApprovals: [],
      isRefreshing: false,
    };
    this.toastRef = React.createRef();
    this.fetchPendingRequests = this.fetchPendingRequests.bind(this);
    this.onUserApprove = this.onUserApprove.bind(this);
    this.onUserApproveTapped = this.onUserApproveTapped.bind(this);
  }

  componentDidMount() {
    this.fetchPendingRequests();
  }

  async fetchPendingRequests() {
    try {
      const response = await UserService.getPendingRequests();
      this.setState({ pendingApprovals: response.data });
    } catch (error) {
      Alert.alert('Error', 'An error occured while fetching pending approvals');
    }
  }

  async onUserApprove(rowData, rowMap) {
    rowMap[rowData.index].closeRow();
    try {
      await UserService.approveUser(rowData.item.user_name);
      this.toastRef.current.show('User account approved');
      this.fetchPendingRequests();
    } catch (error) {
      Alert.alert('Error', 'An error occured while fetching pending approvals');
    }
  }

  onUserApproveTapped(rowData, rowMap) {
    Alert.alert(
      'Confirm Approval',
      `User: ${rowData.item.user_name}\nEmail: ${rowData.item.email}`,
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        { text: 'Approve', onPress: () => this.onUserApprove(rowData, rowMap) },
      ],
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={theme.PRIMARY_STATUS_BAR_COLOR} />
        <SwipeListView
          useFlatList={true}
          keyExtractor={(item, index) => `${index}`}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.fetchPendingRequests()}
              tintColor={theme.PRIMARY_COLOR}
            />
          }
          data={this.state.pendingApprovals}
          renderItem={(rowData, rowMap) => (
            <ApprovalsRowFront rowData={rowData} rowMap={rowMap} />
          )}
          renderHiddenItem={(rowData, rowMap) => (
            <ApprovalsRowBack rowData={rowData} rowMap={rowMap} onPress={this.onUserApproveTapped.bind(null, rowData, rowMap)} />
          )}
          disableRightSwipe={true}
          rightOpenValue={-75}
        />
        <Toast ref={this.toastRef} />
      </View>
    );
  }
}

export default Approvals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
