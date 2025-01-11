'use client';
import  React, { useEffect } from 'react';

export default function Home() {
  async function initServiceWorker() {
    const swRegistration = await navigator.serviceWorker.register('/serviceworker.js');
    const pushManager = swRegistration.pushManager;

    if (!isPushManagerActive(pushManager)) return;

    const permissionState = await pushManager.permissionState({userVisibleOnly: true});
    handlePermissionState(permissionState, pushManager);
  }

  function handlePermissionState(state, pushManager) {
    const subscribeBtn = document.getElementById('subscribe_btn');
    const activeSub = document.getElementById('active_sub');

    switch (state) {
      case 'prompt':
        subscribeBtn.style.display = 'block';
        break;
      case 'granted':
        pushManager.getSubscription().then(displaySubscriptionInfo);
        break;
      case 'denied':
        subscribeBtn.style.display = 'none';
        activeSub.style.display = 'block';
        activeSub.innerHTML = 'User denied push permission';
    }
  }

  function isPushManagerActive(pushManager) {
    if (!pushManager) {
      if (!window.navigator.standalone) {
        document.getElementById('add-to-home-screen').style.display = 'block';
      } else {
        throw new Error('PushManager is not active');
      }
      document.getElementById('subscribe_btn').style.display = 'none';
      return false;
    }
    return true;
  }

  const VAPID_PUBLIC_KEY = 'BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM';

  async function subscribeToPush() {
    const swRegistration = await navigator.serviceWorker.getRegistration();
    const pushManager = swRegistration.pushManager;

    if (!isPushManagerActive(pushManager)) return;

    try {
      const subscription = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      });
      displaySubscriptionInfo(subscription);
    } catch (error) {
      const activeSub = document.getElementById('active_sub');
      activeSub.style.display = 'block';
      activeSub.innerHTML = 'User denied push permission';
    }
  }

  function displaySubscriptionInfo(subscription) {
    document.getElementById('subscribe_btn').style.display = 'none';
    document.getElementById('active_sub').style.display = 'block';
    document.getElementById('active_sub').innerHTML =
      `<b>Active subscription:</b><br><br>${JSON.stringify(subscription.toJSON())}`;
    document.getElementById('test_send_btn').style.display = 'block';
  }

  function testSend() {
    const options = {
      title: "Push title",
      body: "Additional text with some description",
      icon: "images/push_icon.jpg",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
      data: {
        url: "/?page=success",
        message_id: "your_internal_unique_message_id_for_tracking"
      }
    };

    navigator.serviceWorker.ready.then(async (serviceWorker) => {
      await serviceWorker.showNotification(options.title, options);
    });
  }

  useEffect(() => {
    if (navigator.serviceWorker) {
      initServiceWorker();
      console.log('ServiceWorker is supported');
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('page') === 'success') {
      document.getElementById('content').innerHTML =
        'You successfully opened page from WebPush!';
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>WebPush iOS example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <link rel="icon" type="image/png" href="images/favicon.png"/>
        <link rel="apple-touch-icon" href="images/favicon.png"/>
      </head>
      <body>
        <div className="wrapper">
          <h1>WebPush iOS example</h1>
          <div id="content">
            <div id="add-to-home-screen">
              For WebPush work you may need to add this website to Home Screen
              <img src="images/webpush-add-to-home-screen.jpg" alt="webpush add to home screen"/>
            </div>
            <div id="scan-qr-code">
              Open this page at your iPhone/iPad:
              <img src="images/qrcode.png" alt="qrCode"/>
            </div>
            <button id="subscribe_btn" onClick={subscribeToPush}>
              Subscribe to notifications
            </button>
            <div id="active_sub"></div>
            <button id="test_send_btn" onClick={testSend}>
              Send test push
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}