# YogAI Mobile (React Native)

YogAI mobil uygulamasi Firebase Auth ile kimlik dogrulama yapar ve Go backend API'sine Bearer token ile baglanir.

## Gereksinimler

- Node.js (LTS)
- npm
- JDK 17+
- Android Studio + Android SDK
- Xcode (sadece macOS)
- CocoaPods (sadece macOS, iOS build icin)

## Kurulum

1. Bagimliliklari yukleyin:

```bash
npm install
```

2. Firebase native dosyalarini yerlestirin:

- Android: Firebase Console -> Project Settings -> Android app -> google-services.json indir
- Dosya konumu: android/app/google-services.json

- iOS: Firebase Console -> Project Settings -> iOS app -> GoogleService-Info.plist indir
- Dosya konumu: ios/YogAI/GoogleService-Info.plist

3. iOS icin pod kurun (sadece macOS):

```bash
cd ios
pod install
cd ..
```

## Environment

API URL tanimi src/shared/config/env.ts icindedir.

- Android emulator: http://10.0.2.2:8080
- iOS simulator: http://localhost:8080
- Gercek cihaz: bilgisayarinizin local IP adresi

## Calistirma

Metro:

```bash
npm start
```

Android:

```bash
npx react-native run-android
```

iOS (macOS):

```bash
npx react-native run-ios
```

## Android Takilma Cozumu (Offline / %87)

Emulator offline oldugunda veya build %87 civarinda uzun sure beklediginde su akisi kullanin:

1. ADB sifirla:

```bash
npm run android:adb:reset
```

2. Emulatoru headless baslat:

```bash
npm run android:emu:headless
```

3. Emulator icin hizli ve stabil kurulum (x86_64):

```bash
npm run android:gradle:emu
```

Tek komutta toparla + kur + ac:

```bash
npm run android:recover:emu
```

4. Ortam kontrolu:

```bash
npm run android:doctor
```

Not: Bazi Windows surumlerinde `react-native doctor` komutu `wmic` olmadigi icin hata verebilir.
Bu durumda WMIC gerektirmeyen kontrol icin sunu kullanin:

```bash
npm run android:healthcheck
```

Workspace kokunden ayni komutlar:

```bash
npm run mobile:android:recover
npm run mobile:android:launch
npm run mobile:healthcheck
```

## Notlar

- Backend Authorization header formati: Bearer <firebase_id_token>
- Firebase config dosyalari .gitignore icinde oldugu icin repoya eklenmez.