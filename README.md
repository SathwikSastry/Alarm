# AwakenX - The Alarm That Refuses To Lose

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue" alt="Platforms">
  <img src="https://img.shields.io/badge/Framework-React%20Native%20%2F%20Expo-61DAFB" alt="Framework">
  <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28" alt="Backend">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

A smart alarm app that forces you to actually wake up using intelligent challenges, tasks, and environment detection. Built with React Native (Expo) and Firebase.

## 🎯 Features

### Core Alarm Features
- ⏰ Customizable alarms with repeat schedules
- 🏷️ Custom labels for each alarm
- 🔔 Custom ringtones with volume ramp-up
- 📳 Multiple vibration patterns (mild, strong, pulse)
- 💤 Snooze functionality (configurable)
- 🔒 Backup alarms for critical wake-ups

### Challenge System
The app features a robust challenge system that requires users to complete tasks before dismissing an alarm:

| Challenge | Description | Difficulty Levels |
|-----------|-------------|-------------------|
| 🧮 **Math Problems** | Solve arithmetic problems | Easy → Insane |
| 📱 **Shake Phone** | Shake device 20-200 times | Easy → Insane |
| 🧠 **Memory Game** | Match 2-8 pairs of cards | Easy → Insane |
| ⌨️ **Typing Challenge** | Type a phrase correctly | Easy → Insane |
| 📷 **QR Code Scan** | Scan registered QR code | - |
| 🚶 **Step Counter** | Walk 15-100 steps | Easy → Insane |
| 🎨 **Color Sequence** | Simon Says game | Easy → Insane |
| 📖 **Reading Aloud** | Read text with speech recognition | - |
| 🎲 **Random** | Random challenge selection | - |

### Sleep Tracking
- 📊 Sleep duration tracking
- 📈 Weekly sleep analytics
- 🌙 Smart wake-up window
- 💡 Personalized sleep tips

### User Experience
- 🌓 Dark/Light mode
- 📳 Haptic feedback
- 🎨 Modern, minimalist UI
- ⚡ Instant response with zero lag

## 🏗️ Architecture

```
AwakenX/
├── src/
│   ├── challenges/       # Challenge components
│   │   ├── MathChallenge.tsx
│   │   ├── ShakeChallenge.tsx
│   │   ├── MemoryChallenge.tsx
│   │   └── TypingChallenge.tsx
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── AlarmCard.tsx
│   │   ├── TimePicker.tsx
│   │   ├── DaySelector.tsx
│   │   └── ChallengeSelector.tsx
│   ├── constants/        # App constants & theme
│   ├── contexts/         # React Context (state management)
│   ├── hooks/            # Custom React hooks
│   ├── models/           # TypeScript interfaces
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── CreateAlarmScreen.tsx
│   │   ├── ChallengeScreen.tsx
│   │   ├── SleepTrackingScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/         # API & storage services
│   │   ├── StorageService.ts
│   │   └── NotificationService.ts
│   └── utils/            # Utility functions
├── firebase/
│   ├── functions/        # Cloud Functions
│   ├── firestore.rules   # Security rules
│   └── storage.rules     # Storage rules
├── __tests__/            # Unit tests
└── App.tsx               # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project (for backend features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SathwikSastry/Alarm.git
cd Alarm/AwakenX
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase (optional)**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Cloud Messaging
   - Download your config files and add them to the project

4. **Start the development server**
```bash
npm start
```

5. **Run on device/emulator**
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Type checking
npm run typecheck
```

## 📱 Screens

### Home Screen
- View all alarms
- Toggle alarms on/off
- Quick stats (active alarms, next alarm)
- Add new alarm (FAB)

### Create/Edit Alarm
- Time picker
- Day selection
- Challenge configuration
- Settings (vibration, snooze, volume)

### Challenge Screen
- Full-screen challenge
- Progress indicators
- Cannot be dismissed without completion
- Back button disabled

### Sleep Tracking
- Weekly sleep chart
- Sleep quality score
- Sleep duration stats
- Tips and recommendations

### Profile
- User statistics
- App settings
- Premium subscription
- Data management

## 🔥 Firebase Backend

### Cloud Functions
- `registerUser` - Create user document
- `getAlarms` - Fetch user's alarms
- `createAlarm` - Create new alarm
- `updateAlarm` - Update existing alarm
- `deleteAlarm` - Delete alarm
- `sendPushNotification` - Send push notification
- `getRecommendations` - ML-based wake-up suggestions

### Firestore Collections
- `users` - User profiles and settings
- `alarms` - Alarm configurations
- `analytics` - Usage analytics
- `sleepData` - Sleep tracking data
- `qrCodes` - Registered QR codes

### Security Rules
- Users can only access their own data
- Alarm data validation
- Analytics write-only for users
- Admin-only subscription management

## 💰 Premium Features

| Feature | Free | Premium |
|---------|------|---------|
| Basic alarms | ✅ | ✅ |
| Math & Shake challenges | ✅ | ✅ |
| Memory & Typing challenges | ✅ | ✅ |
| Steps & Color Sequence | ❌ | ✅ |
| Reading challenge | ❌ | ✅ |
| Smart wake-up AI | ❌ | ✅ |
| Sleep analytics | Basic | Advanced |
| Alarm tones | Limited | Unlimited |
| Themes | Default | Premium |
| Ads | Yes | No |

**Pricing:**
- Monthly: ₹149/month
- Yearly: ₹999/year (Save 44%)

## 🔒 Security

- AES-256 local encryption
- Firebase App Check
- Firestore security rules
- No storage of biometric data
- Secure push notifications

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo)
- **Language:** TypeScript
- **Navigation:** React Navigation v7
- **State:** React Context
- **Storage:** AsyncStorage
- **Backend:** Firebase (Firestore, Functions, FCM)
- **UI:** Custom components with Material You design
- **Animations:** React Native Animated API
- **Testing:** Jest

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@awakenx.app or open an issue on GitHub.

---

<p align="center">
  Made with ❤️ for early risers who need a little extra motivation
</p>