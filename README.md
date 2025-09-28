# React Native DateTime Picker

[![npm version](https://badge.fury.io/js/react-native-datetime-picker.svg)](https://badge.fury.io/js/react-native-datetime-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A modern, customizable, and feature-rich date and time picker component for React Native applications. Built with TypeScript and designed for both iOS and Android platforms.

## ✨ Features

- 📅 **Interactive Calendar**: Month/year navigation with smooth transitions
- ⏰ **Time Selection**: Intuitive scrollable hour and minute pickers with smooth animations
- 🚫 **Flexible Restrictions**: Multiple ways to disable past/future dates and specific dates
- 🎨 **Theme Customization**: Full control over colors for light and dark modes
- 📱 **Modal Interface**: Clean modal presentation with gesture-based interactions
- 📏 **Responsive Design**: Adapts seamlessly to different screen sizes and orientations
- 🔧 **TypeScript Support**: Full TypeScript definitions included
- ⚡ **Performance Optimized**: Smooth animations and efficient rendering
- 📱 **Cross-Platform**: Works perfectly on both iOS and Android

## 📦 Installation

```bash
npm install react-native-datetime-picker
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react-native-calendars moment
```

For React Native 0.60 and above, you'll also need to install pods for iOS:

```bash
cd ios && pod install
```

### Platform Setup

#### iOS
No additional setup required for iOS.

#### Android
Make sure your `android/app/build.gradle` has the minimum SDK version:

```gradle
android {
  compileSdkVersion 31
  defaultConfig {
    minSdkVersion 21
    // ... other config
  }
}
```

## 🚀 Quick Start

```tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from 'react-native-datetime-picker';

export default function App() {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');

  return (
    <View style={styles.container}>
      <DateTimePicker
        value={selectedDateTime}
        placeholder="Select date and time"
        onChange={setSelectedDateTime}
        themeColor="#007AFF"
        inputStyle={styles.input}
        textStyle={styles.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
```

## 📋 API Reference

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Selected date/time in format "YYYY-MM-DD H:mm:00" |
| `placeholder` | `string` | `"Select date and time"` | Placeholder text when no value is selected |
| `displayFormat` | `string` | `"MMMM DD, YYYY [@] h:mm A"` | Format for displaying selected date (using Moment.js formats) |
| `onChange` | `(value: string) => void` | `undefined` | Callback when date/time changes |
| `onPress` | `() => void` | `undefined` | Callback when picker is pressed |
| `disabled` | `boolean` | `false` | Disable the picker interaction |
| `dateOnly` | `boolean` | `false` | Show only date picker (hide time selection) |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inputStyle` | `ViewStyle` | `undefined` | Custom styles for the input container |
| `textStyle` | `TextStyle` | `undefined` | Custom styles for the display text |
| `darkMode` | `boolean` | `false` | Enable dark mode styling |
| `themeColor` | `string` | `"#007AFF"` | Primary color for selections and highlights |
| `darkModeColor` | `string` | `"#1C1C1E"` | Background color for dark mode |

### Date Restriction Props

| Prop | Type | Description |
|------|------|-------------|
| `disablePastDates` | `boolean` | Disables all dates and times before current moment |
| `disabledDates` | `string[]` | Array of specific dates to disable (format: "YYYY-MM-DD") |
| `disablePreviousDatesFrom` | `Date` | Disables all dates and times before the specified date |

## 💡 Usage Examples

### Basic Date and Time Picker

```tsx
import React, { useState } from 'react';
import DateTimePicker from 'react-native-datetime-picker';

function BasicExample() {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');

  return (
    <DateTimePicker
      value={selectedDateTime}
      placeholder="Select date and time"
      onChange={setSelectedDateTime}
      displayFormat="DD/MM/YYYY [at] HH:mm"
    />
  );
}
```

### Date Only Picker

```tsx
function DateOnlyExample() {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <DateTimePicker
      value={selectedDate}
      placeholder="Select date"
      onChange={setSelectedDate}
      dateOnly={true}
      displayFormat="MMMM DD, YYYY"
    />
  );
}
```

### Disable Past Dates

```tsx
function NoPastDatesExample() {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');

  return (
    <DateTimePicker
      value={selectedDateTime}
      placeholder="Select future date"
      onChange={setSelectedDateTime}
      disablePastDates={true}
    />
  );
}
```

### Disable Specific Dates

```tsx
function DisableSpecificDatesExample() {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  
  // Disable holidays
  const disabledDates = [
    '2024-12-25', // Christmas
    '2024-01-01', // New Year
    '2024-07-04', // July 4th
    '2024-11-28', // Thanksgiving
  ];

  return (
    <DateTimePicker
      value={selectedDateTime}
      placeholder="Select available date"
      onChange={setSelectedDateTime}
      disabledDates={disabledDates}
    />
  );
}
```

### Custom Theme and Styling

```tsx
function CustomThemeExample() {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');

  const customInputStyle = {
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF5F5',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const customTextStyle = {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
  };

  return (
    <DateTimePicker
      value={selectedDateTime}
      placeholder="Pick your special date"
      onChange={setSelectedDateTime}
      themeColor="#FF6B6B"
      inputStyle={customInputStyle}
      textStyle={customTextStyle}
    />
  );
}
```

### Dark Mode Support

```tsx
function DarkModeExample() {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [isDark, setIsDark] = useState(false);

  return (
    <DateTimePicker
      value={selectedDateTime}
      placeholder="Select date and time"
      onChange={setSelectedDateTime}
      darkMode={isDark}
      themeColor={isDark ? '#BB86FC' : '#007AFF'}
      darkModeColor="#121212"
      inputStyle={{
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderColor: isDark ? '#333333' : '#DDDDDD',
      }}
      textStyle={{
        color: isDark ? '#FFFFFF' : '#000000',
      }}
    />
  );
}
```

### Combined Restrictions

```tsx
function AdvancedRestrictionsExample() {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  
  const blockedDates = ['2024-12-25', '2024-01-01'];
  const cutoffDate = new Date(2024, 5, 15); // June 15, 2024

  return (
    <DateTimePicker
      value={selectedDateTime}
      placeholder="Select available date"
      onChange={setSelectedDateTime}
      disablePastDates={true}
      disabledDates={blockedDates}
      disablePreviousDatesFrom={cutoffDate}
      themeColor="#4ECDC4"
    />
  );
}
```

## 🎨 Theming Guide

The component supports extensive theming options:

### Color Customization

- `themeColor`: Controls the primary accent color (selected dates, buttons, highlights)
- `darkModeColor`: Sets the background color when dark mode is enabled
- Custom input and text styles via `inputStyle` and `textStyle` props

### Display Format Options

The `displayFormat` prop uses Moment.js formatting tokens:

- `DD/MM/YYYY` - 25/12/2024
- `MMMM DD, YYYY` - December 25, 2024  
- `MM-DD-YYYY [at] HH:mm` - 12-25-2024 at 14:30
- `ddd, MMM Do YYYY [@] h:mm A` - Wed, Dec 25th 2024 @ 2:30 PM

## 🔧 Advanced Configuration

### Date Format Handling

The component uses a specific internal format (`YYYY-MM-DD H:mm:00`) for the `value` prop, but you can customize how dates are displayed to users:

```tsx
// Internal format: "2024-12-25 14:30:00"
// Display format: "December 25, 2024 @ 2:30 PM"

<DateTimePicker
  value="2024-12-25 14:30:00"
  displayFormat="MMMM DD, YYYY [@] h:mm A"
  onChange={(value) => {
    console.log('New value:', value); // "2024-12-25 15:45:00"
  }}
/>
```

### Performance Considerations

- The component automatically optimizes scroll performance in time pickers
- Year selection is paginated to handle large date ranges efficiently  
- Calendar rendering is optimized for smooth month transitions

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Moment.js is not installed"
**Solution**: Make sure to install the peer dependency: `npm install moment`

**Issue**: Calendar not showing on Android
**Solution**: Verify that `react-native-calendars` is properly installed and linked

**Issue**: Time picker scrolling is laggy
**Solution**: The component includes built-in optimizations. If issues persist, ensure your React Native version is up to date

**Issue**: Dark mode not working
**Solution**: Make sure to pass both `darkMode={true}` and appropriate `darkModeColor`

## 📱 Platform Differences

### iOS
- Native-like modal presentation
- Smooth momentum scrolling in time pickers
- Respects iOS accessibility settings

### Android  
- Material Design compliant styling
- Optimized for various screen densities
- Handles hardware back button appropriately

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the example: `npm run example ios` or `npm run example android`

### Scripts

- `npm run build` - Build the library
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run example ios` - Run iOS example
- `npm run example android` - Run Android example

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [react-native-calendars](https://github.com/wix/react-native-calendars) for calendar functionality
- Uses [Moment.js](https://momentjs.com/) for date formatting and manipulation
- Inspired by native date/time pickers on iOS and Android

## 📞 Support

- 🐛 [Report issues](https://github.com/YOUR_USERNAME/react-native-datetime-picker/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/react-native-datetime-picker/discussions)
- 📧 Email: support@yourpackage.com

---

Made with ❤️ for the React Native community
