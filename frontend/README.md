# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Building for prod
To create the static site run...
```bash
npx expo export -p web
```
To make a test build locally
```bash
npx expo prebuild -p ios --clean
npx expo run:ios
```
To make a build for the app store
```bash
npx expo prebuild -p ios --clean
eas build --profile production --platform ios --auto-submit
```


### Troubleshooting
Sometimes the tailwindcss goes missing (no idea why), causing metro to fail.  This often adds it back to the package.json file, getting things running again
```bash
npm install nativewind react-native-reanimated@~3.17.4 react-native-safe-area-context@5.4.0
npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
```
