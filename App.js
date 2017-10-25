/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
  Alert
} from 'react-native';

import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';

// this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
FCM.on(FCMEvent.Notification, async (notif) => {
    // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
    if(notif.local_notification){
      //this is a local notification
    }
    if(notif.opened_from_tray){
      //iOS: app is open/resumed because user clicked banner
      //Android: app is open/resumed because user clicked banner or tapped app icon
    }
    // await someAsyncCall();

    if(Platform.OS ==='ios'){
      //optional
      //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
      //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
      //notif._notificationType is available for iOS platfrom
      switch(notif._notificationType){
        case NotificationType.Remote:
          notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
          break;
        case NotificationType.NotificationResponse:
          notif.finish();
          break;
        case NotificationType.WillPresent:
          notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
          break;
      }
    }
});
FCM.on(FCMEvent.RefreshToken, (token) => {
    console.log(token)
    // fcm token may not be available on first load, catch it here
});


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {
componentWillMount() {

}

tikla() {
  this.showLocalNotification();
}

zamanla() {
  console.log('zamanalaa');
  FCM.scheduleLocalNotification({
    id: 'testnotif',
    fire_date: new Date().getTime()+3000,
    vibrate: 500,
    title: 'Hello',
    body: 'Test Scheduled Notification',
    sub_text: 'sub text',
    priority: "high",
    large_icon: "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg",
    show_in_foreground: true,
    //picture: 'https://firebase.google.com/_static/af7ae4b3fc/images/firebase/lockup.png'
  });
}

gonder() {
  FCM.send('ecPn8K_qpuo:APA91bGAHreQ6mafR_WGSKktDCEtheampb_0I6uQNpszrScb1JAf8agJm6NU9it4lF_txq80tXHk4OXp5Qrz-qK-20Kbve_siMTnqHYR6dftx8bl1fKivz-fpU_qIShzUvdJp2X4d5iy', {
         my_custom_data_1: 'my_custom_field_value_1',
         my_custom_data_2: 'my_custom_field_value_2'
       });

  FCM.getFCMToken().then(token => {
      console.log(token);

      this.sendNotificationWithData();
      // store fcm token in your server
      //Bu token kullanıcıya bağlıdır gelişmiş işlemlerde kaydedilmeli ve bu numara üzerinden işlemler yapılmalıdır
  });
}

sendNotificationWithData() {
  let body = {
    "to": "f-cJNXrUPpk:APA91bEad-jtb7Zta3JKdthKu9agABkSj3Ld5pWC5ZhigX1QKB3sX8pSCkJOMQib2Pf0luVb9lBYLygPv0Bz1Z43boV3NI5h-WDwBXUPieIKKTIA0W7aeP4ZARlm0UCS3nflqlxQLlrK",
    "notification":{
      "title": "Eren Test",
      "body": "This is a notification with NOTIFICATION and DATA (NOTIF).",
      "sound": "default"
    },
    "data":{
      "hello": "there"
    },
    "priority": "high"
  }

  this._send(JSON.stringify(body), "notification-data");
}

async _send(body, type) {
  let headers = new Headers({
    "Content-Type": "application/json",
    "Authorization": "key=AIzaSyC8jmVTnhhE6QuRdIiQ8_ro8b7hE0L-ZCM"
  });

  try {
    let response = await fetch('https://fcm.googleapis.com/fcm/send', { method: "POST", headers, body });
    console.log(response);
    try{
      response = await response.json();
      if(!response.success){
        Alert.alert('Failed to send notification, check error log')
      }
    } catch (err){
      Alert.alert('Failed to send notification, check error log')
    }
  } catch (err) {
    Alert.alert(err && err.message)
  }
};

  componentDidMount() {
        // iOS: show permission prompt for the first call. later just check permission in user settings
        // Android: check permission in user settings
        FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'));

        FCM.getFCMToken().then(token => {
            console.log(token)
            // store fcm token in your server
            //Bu token kullanıcıya bağlıdır gelişmiş işlemlerde kaydedilmeli ve bu numara üzerinden işlemler yapılmalıdır
        });

        //console.log(FirebaseInstanceId.getInstance().getToken());

        this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
            // optional, do some component related stuff
        });

        // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
        // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
        // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
        FCM.getInitialNotification().then(notif=>{
           console.log(notif)
        });
    }

    componentWillUnmount() {
        // stop listening for events
        this.notificationListener.remove();
    }

  showLocalNotification() {
    FCM.presentLocalNotification({
      vibrate: 500,
      title: 'Hello',
      body: 'Test Notification',
      big_text: 'i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large, i am large',
      priority: "high",
      sound: "bell.mp3",
      large_icon: "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg",
      show_in_foreground: true,
      number: 10
    });
  }


  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Notificaition!
        </Text>
      <TouchableOpacity onPress={() => this.tikla()} style={styles.button}>
        <Text style={styles.buttonText}>Local</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.zamanla()} style={styles.button}>
        <Text style={styles.buttonText}>Zamanlanmış Görev (3 saniye)</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.gonder()} style={styles.button}>
        <Text style={styles.buttonText}>Gönder</Text>
      </TouchableOpacity>
      </View>
    );
  }


}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
