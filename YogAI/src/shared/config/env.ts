// Android emulator host loopback.
// iOS simulator can use http://localhost:8080.
// Real device should use your machine LAN IP (e.g. http://192.168.x.x:8080).
export const API_URL = __DEV__ ? 'http://10.0.2.2:8080' : 'https://api.yogai.com';
