import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Gig Booker",
  slug: "gig-booker",
  owner: "gig-booker",
  orientation: "default",
  icon: "./assets/images/icon.png",
  scheme: "com.gig-booker",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ["android.permission.RECORD_AUDIO"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-notifications",
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-secure-store",
      {
        configureAndroidBackup: true,
        faceIDPermission:
          "Allow Gig Booker to access your Face ID biometric data.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Gig Booker access to your photos to let you share them with your friends.",
        cameraPermission:
          "Allow Gig Booker access to your camera to take photos and videos.",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow Gig Booker to access your camera",
        microphonePermission: "Allow Gig Booker to access your microphone",
        recordAudioAndroid: true,
        barcodeScannerEnabled: false,
      },
    ],
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME,
      },
    ],
    [
      "expo-contacts",
      {
        contactsPermission: "Allow Gig Booker to access your contacts.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    EXPO_PUBLIC_ELEVEN_LABS_API_KEY:
      process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY,
    ELEVEN_LABS_BOOKING_AGENT_ID: process.env.ELEVEN_LABS_BOOKING_AGENT_ID,
    EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    EXPO_PUBLIC_GOOGLE_CLIENT_SECRET_WEB:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET_WEB,
    router: {},
    eas: {
      projectId: "17a5ff3f-17fc-4353-9192-f3962981f721",
    },
  },
});
