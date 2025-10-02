"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
  Dimensions,
  ScrollView,
} from "react-native"
import { Calendar } from "react-native-calendars"
import moment from "moment-timezone"

interface DateTimePickerProps {
  value?: string // Always in format "YYYY-MM-DD H:i:00"
  placeholder?: string
  displayFormat?: string
  onChange?: (value: string) => void
  onPress?: () => void
  inputStyle?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
  darkMode?: boolean
  themeColor?: string // Default blue color for selected items, borders, buttons
  darkModeColor?: string // Default dark mode background color
  disablePastDates?: boolean // Disable all dates and times in the past (from current date/time)
  disableFutureDates?: boolean // Disable all dates and times in the future (from current date/time)
  disabledDates?: string[] // Array of specific dates to disable in "YYYY-MM-DD" format
  disablePreviousDatesFrom?: Date // Disable dates and times before this specific date/time
  dateOnly?: boolean // Hide tabs and show only calendar, automatically excludes time from display format
  disableBefore?: string // Disable all dates and times before this specific date-time (format: "YYYY-MM-DD HH:mm")
  disableAfter?: string // Disable all dates and times after this specific date-time (format: "YYYY-MM-DD HH:mm")
  error?: boolean // Show red border when true
  errorMessage?: string // Error message to display below input
  timezone?: string // Timezone for date/time operations (e.g., "America/New_York", "Europe/London")
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  placeholder = "Select date and time",
  displayFormat = "MMMM DD, YYYY [@] h:mm A",
  onChange,
  onPress,
  inputStyle,
  textStyle,
  disabled = false,
  darkMode = false,
  themeColor = "#007AFF", // Default blue
  darkModeColor = "#1C1C1E", // Default dark mode black
  disablePastDates = false,
  disableFutureDates = false,
  disabledDates = [],
  disablePreviousDatesFrom,
  dateOnly = false,
  disableBefore,
  disableAfter,
  error = false,
  errorMessage,
  timezone,
}) => {
  const getMoment = (date?: string | Date, format?: string) => {
    if (timezone) {
      return date ? moment.tz(date, format, timezone) : moment.tz(timezone)
    }
    return date ? moment(date, format) : moment()
  }

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [viewedDate, setViewedDate] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"date" | "time">("date")
  const [selectedHour, setSelectedHour] = useState<number>(12)
  const [selectedMinute, setSelectedMinute] = useState<number>(0)
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM")
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(getMoment().year())
  const [viewedYear, setViewedYear] = useState<number>(getMoment().year())
  const [yearPage, setYearPage] = useState<number>(0)

  const hourScrollRef = useRef<ScrollView>(null)
  const minuteScrollRef = useRef<ScrollView>(null)
  const periodScrollRef = useRef<ScrollView>(null)
  const yearScrollRef = useRef<ScrollView>(null)

  const [years, setYears] = useState<number[]>([])
  const width = Dimensions.get("window").width

  useEffect(() => {
    const currentYear = getMoment().year()
    setYears(Array.from({ length: 101 }, (_, i) => currentYear - 50 + i))
    const startYear = currentYear - 50
    const initialPage = Math.floor((currentYear - startYear) / 20)
    setYearPage(initialPage)
  }, [timezone])

  useEffect(() => {
    if (value) {
      const momentValue = getMoment(value, "YYYY-MM-DD H:mm:ss")
      if (momentValue.isValid()) {
        setSelectedDate(momentValue.format("YYYY-MM-DD"))
        setViewedDate(momentValue.format("YYYY-MM-DD"))
        const hour = momentValue.hour()
        const period = hour >= 12 ? "PM" : "AM"
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        setSelectedHour(displayHour)
        setSelectedMinute(momentValue.minute())
        setSelectedPeriod(period)
        setSelectedYear(momentValue.year())
        setViewedYear(momentValue.year())
      }
    } else {
      setSelectedDate("")
      setViewedDate("")
      setSelectedHour(12)
      setSelectedMinute(0)
      setSelectedPeriod("AM")
      setSelectedYear(getMoment().year())
      setViewedYear(getMoment().year())
    }
  }, [value, timezone])

  useEffect(() => {
    if (isModalVisible && activeTab === "time") {
      setTimeout(() => {
        const hourIndex = hours.findIndex((h) => h === selectedHour)
        const minuteIndex = minutes.findIndex((m) => m === selectedMinute)
        const periodIndex = periods.findIndex((p) => p === selectedPeriod)

        scrollToSelectedItem(hourScrollRef, hourIndex)
        scrollToSelectedItem(minuteScrollRef, minuteIndex)
        scrollToSelectedItem(periodScrollRef, periodIndex)
      }, 200)
    }
  }, [isModalVisible, activeTab, selectedHour, selectedMinute, selectedPeriod])

  const handlePress = () => {
    if (selectedDate) {
      setViewedDate(selectedDate)
      setViewedYear(getMoment(selectedDate).year())
    } else {
      const now = getMoment()
      setViewedDate(now.format("YYYY-MM-DD"))
      setViewedYear(now.year())
    }

    setActiveTab(dateOnly ? "date" : "date")
    setIsModalVisible(true)
    onPress?.()
  }

  const cancelModal = () => {
    setIsModalVisible(false)
  }

  const doneModal = () => {
    if (selectedDate) {
      const hour24 =
        selectedPeriod === "AM"
          ? selectedHour === 12
            ? 0
            : selectedHour
          : selectedHour === 12
            ? 12
            : selectedHour + 12

      const formattedValue = getMoment()
        .year(selectedYear)
        .month(getMoment(selectedDate).month())
        .date(getMoment(selectedDate).date())
        .hour(hour24)
        .minute(selectedMinute)
        .second(0)
        .format("YYYY-MM-DD H:mm:00")

      onChange?.(formattedValue)
    }
    setIsModalVisible(false)
  }

  const handleTodayClick = () => {
    const today = getMoment()
    const todayString = today.format("YYYY-MM-DD")

    setSelectedDate(todayString)
    setViewedDate(todayString)
    setSelectedYear(today.year())
    setViewedYear(today.year())

    const hour = today.hour()
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    setSelectedHour(displayHour)
    setSelectedMinute(Math.floor(today.minute() / 5) * 5)
    setSelectedPeriod(period)
  }

  const isSelectedDateTimeToday = () => {
    if (!selectedDate) return false

    const today = getMoment()
    const selectedMoment = getMoment(selectedDate)

    if (!selectedMoment.isSame(today, "day")) return false

    if (dateOnly) return true

    const hour24 =
      selectedPeriod === "AM" ? (selectedHour === 12 ? 0 : selectedHour) : selectedHour === 12 ? 12 : selectedHour + 12

    const selectedTime = selectedMoment.clone().hour(hour24).minute(selectedMinute)
    const timeDiff = Math.abs(selectedTime.diff(today, "minutes"))

    return timeDiff <= 5
  }

  const handleDateSelect = (day: any) => {
    if (!isDateDisabled(day.dateString)) {
      setSelectedDate(day.dateString)
      setViewedDate(day.dateString)
      setSelectedYear(getMoment(day.dateString).year())
      setViewedYear(getMoment(day.dateString).year())
    }
  }

  const scrollToSelectedItem = (scrollRef: React.RefObject<ScrollView>, index: number, itemHeight = 48) => {
    if (scrollRef.current && index >= 0) {
      const containerHeight = 320
      const scrollPosition = Math.max(0, index * itemHeight - containerHeight / 2 + itemHeight / 2)

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: scrollPosition, animated: true })
      }, 50)
    }
  }

  const handleHourSelect = (hour: number) => {
    // Check if the hour itself is disabled (all minutes are disabled)
    if (isHourDisabled(hour, selectedPeriod)) {
      return
    }

    setSelectedHour(hour)

    // If the currently selected minute is disabled for this hour, find the first valid minute
    if (isTimeDisabled(hour, selectedMinute, selectedPeriod)) {
      const firstValidMinute = minutes.find((minute) => !isTimeDisabled(hour, minute, selectedPeriod))
      if (firstValidMinute !== undefined) {
        setSelectedMinute(firstValidMinute)
      }
    }

    const hourIndex = hours.findIndex((h) => h === hour)
    scrollToSelectedItem(hourScrollRef, hourIndex)
  }

  const handleMinuteSelect = (minute: number) => {
    if (isTimeDisabled(selectedHour, minute, selectedPeriod)) {
      return
    }
    setSelectedMinute(minute)
    const minuteIndex = minutes.findIndex((m) => m === minute)
    scrollToSelectedItem(minuteScrollRef, minuteIndex)
  }

  const handlePeriodSelect = (period: "AM" | "PM") => {
    if (isPeriodDisabled(period)) {
      return
    }

    setSelectedPeriod(period)

    if (isTimeDisabled(selectedHour, selectedMinute, period)) {
      // Find the first valid hour
      let foundValid = false
      for (const hour of hours) {
        if (!isHourDisabled(hour, period)) {
          setSelectedHour(hour)
          // Find the first valid minute for this hour
          const firstValidMinute = minutes.find((minute) => !isTimeDisabled(hour, minute, period))
          if (firstValidMinute !== undefined) {
            setSelectedMinute(firstValidMinute)
            foundValid = true
            break
          }
        }
      }
    }

    const periodIndex = periods.findIndex((p) => p === period)
    scrollToSelectedItem(periodScrollRef, periodIndex)
  }

  const handleYearSelect = (year: number) => {
    setViewedYear(year)
    const currentMoment = getMoment(viewedDate)
    const newDate = currentMoment.clone().year(year)

    if (!newDate.isValid() || newDate.month() !== currentMoment.month() || newDate.date() !== currentMoment.date()) {
      newDate.year(year).month(currentMoment.month()).endOf("month")
    }

    const newDateString = newDate.format("YYYY-MM-DD")
    setViewedDate(newDateString)
    setIsYearPickerVisible(false)
  }

  const handleMonthChange = (month: any) => {
    const newDate = getMoment(month.dateString)

    setViewedYear(newDate.year())

    const currentDay = getMoment(viewedDate).date()
    const newMonthDate = newDate.clone().date(Math.min(currentDay, newDate.daysInMonth()))
    setViewedDate(newMonthDate.format("YYYY-MM-DD"))
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const periods = ["AM", "PM"]

  const getFormattedDateTime = () => {
    if (!selectedDate) return placeholder

    const hour24 =
      selectedPeriod === "AM" ? (selectedHour === 12 ? 0 : selectedHour) : selectedHour === 12 ? 12 : selectedHour + 12

    const momentDateTime = getMoment()
      .year(selectedYear)
      .month(getMoment(selectedDate).month())
      .date(getMoment(selectedDate).date())
      .hour(hour24)
      .minute(selectedMinute)
      .second(0)

    const formatToUse = dateOnly ? "MMMM DD, YYYY" : displayFormat
    return momentDateTime.format(formatToUse)
  }

  const getDisplayValue = () => {
    if (value) {
      const momentValue = getMoment(value, "YYYY-MM-DD H:mm:ss")
      if (momentValue.isValid()) {
        const formatToUse = dateOnly ? "MMMM DD, YYYY" : displayFormat
        return momentValue.format(formatToUse)
      }
    }
    return placeholder
  }

  const theme = {
    modalBackground: darkMode ? darkModeColor : "#FFFFFF",
    textPrimary: darkMode ? "#FFFFFF" : "#333333",
    textSecondary: darkMode ? "#8E8E93" : "#666666",
    textPlaceholder: darkMode ? "#8E8E93" : "#999999",
    borderColor: darkMode ? "#38383A" : "#E0E0E0",
    tabBackground: darkMode ? "#2C2C2E" : "#F5F5F5",
    tabActiveBackground: darkMode ? "#2C2C2E" : "#F5F5F5",
    selectedItemBackground: `${themeColor}4D`,
    inputBackground: darkMode ? darkModeColor : "#FFFFFF",
    inputBorder: darkMode ? "#38383A" : "#E0E0E0",
    tabActiveBorder: themeColor,
    errorColor: "#FF3B30",
  }

  const calendarTheme = {
    backgroundColor: "transparent",
    calendarBackground: "transparent",
    selectedDayBackgroundColor: themeColor,
    selectedDayTextColor: "#ffffff",
    todayTextColor: themeColor,
    dayTextColor: theme.textPrimary,
    textDisabledColor: darkMode ? "#48484A" : "#d9e1e8",
    dotColor: "#00adf5",
    selectedDotColor: "#ffffff",
    arrowColor: themeColor,
    monthTextColor: theme.textPrimary,
    indicatorColor: themeColor,
    textDayFontWeight: "300",
    textMonthFontWeight: "bold",
    textDayHeaderFontWeight: "300",
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 13,
  }

  const isDateDisabled = (dateString: string) => {
    if (disabledDates.includes(dateString)) {
      return true
    }

    if (disablePastDates) {
      const today = getMoment().format("YYYY-MM-DD")
      if (getMoment(dateString).isBefore(today, "day")) {
        return true
      }
    }

    if (disableFutureDates) {
      const today = getMoment().format("YYYY-MM-DD")
      if (getMoment(dateString).isAfter(today, "day")) {
        return true
      }
    }

    if (disablePreviousDatesFrom) {
      const disableFromDate = getMoment(disablePreviousDatesFrom).format("YYYY-MM-DD")
      if (getMoment(dateString).isBefore(disableFromDate, "day")) {
        return true
      }
    }

    if (disableBefore) {
      const disableBeforeDate = getMoment(disableBefore, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD")
      if (getMoment(dateString).isBefore(disableBeforeDate, "day")) {
        return true
      }
    }

    if (disableAfter) {
      const disableAfterDate = getMoment(disableAfter, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD")
      if (getMoment(dateString).isAfter(disableAfterDate, "day")) {
        return true
      }
    }

    return false
  }

  const isTimeDisabled = (hour: number, minute: number, period: "AM" | "PM") => {
    if (!selectedDate) {
      return false
    }

    const hour24 = period === "AM" ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12
    const selectedTime = getMoment(selectedDate).hour(hour24).minute(minute)

    if (disablePastDates) {
      const now = getMoment()
      const today = now.format("YYYY-MM-DD")

      if (selectedDate === today && selectedTime.isBefore(now)) {
        return true
      }
    }

    if (disablePreviousDatesFrom) {
      const disableFromMoment = getMoment(disablePreviousDatesFrom)
      const disableFromDate = disableFromMoment.format("YYYY-MM-DD")

      if (selectedDate === disableFromDate && selectedTime.isBefore(disableFromMoment)) {
        return true
      }
    }

    if (disableBefore) {
      const disableBeforeMoment = getMoment(disableBefore, "YYYY-MM-DD HH:mm")
      const disableBeforeDate = disableBeforeMoment.format("YYYY-MM-DD")

      if (selectedDate === disableBeforeDate && selectedTime.isBefore(disableBeforeMoment)) {
        return true
      }
    }

    if (disableAfter) {
      const disableAfterMoment = getMoment(disableAfter, "YYYY-MM-DD HH:mm")
      const disableAfterDate = disableAfterMoment.format("YYYY-MM-DD")

      if (selectedDate === disableAfterDate && selectedTime.isAfter(disableAfterMoment)) {
        return true
      }
    }

    return false
  }

  const isHourDisabled = (hour: number, period: "AM" | "PM") => {
    // Check if ALL minutes in this hour are disabled
    // If at least one minute is valid, the hour should not be disabled
    for (const minute of minutes) {
      if (!isTimeDisabled(hour, minute, period)) {
        return false // Found a valid minute, so hour is not disabled
      }
    }
    return true // All minutes are disabled, so hour is disabled
  }

  const isPeriodDisabled = (period: "AM" | "PM") => {
    // Check if ALL hour+minute combinations in this period are disabled
    // If at least one combination is valid, the period should not be disabled
    for (const hour of hours) {
      for (const minute of minutes) {
        if (!isTimeDisabled(hour, minute, period)) {
          return false // Found a valid time, so period is not disabled
        }
      }
    }
    return true // All times are disabled, so period is disabled
  }

  const getMarkedDates = () => {
    const marked: any = {}

    if (selectedDate) {
      marked[selectedDate] = { selected: true, selectedColor: themeColor }
    }

    disabledDates.forEach((dateString) => {
      if (!marked[dateString]) {
        marked[dateString] = {}
      }
      marked[dateString].disabled = true
      marked[dateString].disableTouchEvent = true
    })

    if (disablePreviousDatesFrom) {
      const disableFromDate = getMoment(disablePreviousDatesFrom)
      const currentViewedDate = getMoment(viewedDate)

      const startOfMonth = currentViewedDate.clone().startOf("month").subtract(1, "month")
      const endOfMonth = currentViewedDate.clone().endOf("month").add(1, "month")

      const currentDate = startOfMonth.clone()
      while (currentDate.isBefore(endOfMonth, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD")

        if (currentDate.isBefore(disableFromDate, "day")) {
          if (!marked[dateString]) {
            marked[dateString] = {}
          }
          marked[dateString].disabled = true
          marked[dateString].disableTouchEvent = true
        }

        currentDate.add(1, "day")
      }
    }

    if (disablePastDates) {
      const today = getMoment()
      const currentViewedDate = getMoment(viewedDate)

      const startOfMonth = currentViewedDate.clone().startOf("month").subtract(1, "month")
      const endOfMonth = currentViewedDate.clone().endOf("month").add(1, "month")

      const currentDate = startOfMonth.clone()
      while (currentDate.isBefore(endOfMonth, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD")

        if (currentDate.isBefore(today, "day")) {
          if (!marked[dateString]) {
            marked[dateString] = {}
          }
          marked[dateString].disabled = true
          marked[dateString].disableTouchEvent = true
        }

        currentDate.add(1, "day")
      }
    }

    if (disableFutureDates) {
      const today = getMoment()
      const currentViewedDate = getMoment(viewedDate)

      const startOfMonth = currentViewedDate.clone().startOf("month").subtract(1, "month")
      const endOfMonth = currentViewedDate.clone().endOf("month").add(1, "month")

      const currentDate = startOfMonth.clone()
      while (currentDate.isBefore(endOfMonth, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD")

        if (currentDate.isAfter(today, "day")) {
          if (!marked[dateString]) {
            marked[dateString] = {}
          }
          marked[dateString].disabled = true
          marked[dateString].disableTouchEvent = true
        }

        currentDate.add(1, "day")
      }
    }

    if (disableBefore) {
      const disableBeforeDate = getMoment(disableBefore, "YYYY-MM-DD HH:mm")
      const currentViewedDate = getMoment(viewedDate)

      const startOfMonth = currentViewedDate.clone().startOf("month").subtract(1, "month")
      const endOfMonth = currentViewedDate.clone().endOf("month").add(1, "month")

      const currentDate = startOfMonth.clone()
      while (currentDate.isBefore(endOfMonth, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD")

        if (currentDate.isBefore(disableBeforeDate, "day")) {
          if (!marked[dateString]) {
            marked[dateString] = {}
          }
          marked[dateString].disabled = true
          marked[dateString].disableTouchEvent = true
        }

        currentDate.add(1, "day")
      }
    }

    if (disableAfter) {
      const disableAfterDate = getMoment(disableAfter, "YYYY-MM-DD HH:mm")
      const currentViewedDate = getMoment(viewedDate)

      const startOfMonth = currentViewedDate.clone().startOf("month").subtract(1, "month")
      const endOfMonth = currentViewedDate.clone().endOf("month").add(1, "month")

      const currentDate = startOfMonth.clone()
      while (currentDate.isBefore(endOfMonth, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD")

        if (currentDate.isAfter(disableAfterDate, "day")) {
          if (!marked[dateString]) {
            marked[dateString] = {}
          }
          marked[dateString].disabled = true
          marked[dateString].disableTouchEvent = true
        }

        currentDate.add(1, "day")
      }
    }

    return marked
  }

  const getYearsForCurrentPage = () => {
    const startIndex = yearPage * 20
    return years.slice(startIndex, startIndex + 20)
  }

  const handleYearPagePrevious = () => {
    if (yearPage > 0) {
      setYearPage(yearPage - 1)
    }
  }

  const handleYearPageNext = () => {
    const maxPage = Math.ceil(years.length / 20) - 1
    if (yearPage < maxPage) {
      setYearPage(yearPage + 1)
    }
  }

  const canGoToPreviousYearPage = () => yearPage > 0
  const canGoToNextYearPage = () => yearPage < Math.ceil(years.length / 20) - 1

  return (
    <>
      <View>
        <TouchableOpacity
          style={[
            styles.input,
            { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
            inputStyle,
            disabled && styles.disabled,
            error && { borderColor: theme.errorColor, borderWidth: 2 },
          ]}
          onPress={handlePress}
          disabled={disabled}
        >
          <Text style={[styles.inputText, { color: !value ? theme.textPlaceholder : theme.textPrimary }, textStyle]}>
            {getDisplayValue()}
          </Text>
        </TouchableOpacity>

        {errorMessage && <Text style={[styles.errorText, { color: theme.errorColor }]}>{errorMessage}</Text>}
      </View>

      {isModalVisible && (
        <TouchableOpacity style={styles.modalOverlay} onPress={cancelModal} activeOpacity={1}>
          <TouchableOpacity
            style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { color: theme.textPrimary }]}>{getFormattedDateTime()}</Text>
            </View>

            {!dateOnly && (
              <View style={[styles.tabContainer]}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "date" && { borderBottomWidth: 3, borderBottomColor: theme.tabActiveBorder },
                  ]}
                  onPress={() => {
                    setActiveTab("date")
                    if (selectedDate) {
                      setViewedDate(selectedDate)
                      setViewedYear(getMoment(selectedDate).year())
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === "date" ? themeColor : theme.textSecondary },
                      activeTab === "date" && styles.activeTabText,
                    ]}
                  >
                    Date
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "time" && { borderBottomWidth: 3, borderBottomColor: theme.tabActiveBorder },
                  ]}
                  onPress={() => setActiveTab("time")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === "time" ? themeColor : theme.textSecondary },
                      activeTab === "time" && styles.activeTabText,
                    ]}
                  >
                    Time
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {dateOnly || activeTab === "date" ? (
              <View style={{ position: "relative", flex: 1 }}>
                <Calendar
                  key={`${viewedYear}-${selectedDate}`}
                  current={viewedDate}
                  onDayPress={handleDateSelect}
                  onMonthChange={handleMonthChange}
                  markedDates={getMarkedDates()}
                  theme={calendarTheme}
                  renderHeader={(date) => {
                    const headerDate = getMoment(viewedDate).year(viewedYear)
                    return (
                      <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={() => setIsYearPickerVisible(true)}>
                          <Text style={[styles.calendarHeaderText, { color: theme.textPrimary }]}>
                            {headerDate.format("MMMM YYYY")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )
                  }}
                />
              </View>
            ) : (
              <View style={[styles.timePickerContainer, { borderColor: theme.borderColor }]}>
                <View style={getTimeColumnStyle(false, theme.borderColor)}>
                  <ScrollView
                    ref={hourScrollRef}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    indicatorStyle={darkMode ? "white" : "black"}
                    scrollIndicatorInsets={{ right: 1 }}
                    style={{ scrollbarWidth: "thick" } as any}
                  >
                    {hours.map((hour) => {
                      const isDisabled = isHourDisabled(hour, selectedPeriod)
                      return (
                        <TouchableOpacity
                          key={hour}
                          style={[
                            styles.timeItem,
                            selectedHour === hour && { backgroundColor: theme.selectedItemBackground },
                            isDisabled && { opacity: 0.3 },
                          ]}
                          onPress={() => handleHourSelect(hour)}
                          disabled={isDisabled}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              { color: selectedHour === hour ? themeColor : theme.textPrimary },
                              isDisabled && { color: theme.textSecondary },
                            ]}
                          >
                            {hour}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>

                <View style={getTimeColumnStyle(false, theme.borderColor)}>
                  <ScrollView
                    ref={minuteScrollRef}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    indicatorStyle={darkMode ? "white" : "black"}
                    scrollIndicatorInsets={{ right: 1 }}
                    style={{ scrollbarWidth: "thick" } as any}
                  >
                    {minutes.map((minute) => {
                      const isDisabled = isTimeDisabled(selectedHour, minute, selectedPeriod)
                      return (
                        <TouchableOpacity
                          key={minute}
                          style={[
                            styles.timeItem,
                            selectedMinute === minute && { backgroundColor: theme.selectedItemBackground },
                            isDisabled && { opacity: 0.3 },
                          ]}
                          onPress={() => handleMinuteSelect(minute)}
                          disabled={isDisabled}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              { color: selectedMinute === minute ? themeColor : theme.textPrimary },
                              isDisabled && { color: theme.textSecondary },
                            ]}
                          >
                            {minute.toString().padStart(2, "0")}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>

                <View style={getTimeColumnStyle(true, theme.borderColor)}>
                  <ScrollView
                    ref={periodScrollRef}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    indicatorStyle={darkMode ? "white" : "black"}
                    scrollIndicatorInsets={{ right: 1 }}
                    style={{ scrollbarWidth: "thick" } as any}
                  >
                    {periods.map((period) => {
                      const isDisabled = isPeriodDisabled(period as "AM" | "PM")
                      return (
                        <TouchableOpacity
                          key={period}
                          style={[
                            styles.timeItem,
                            selectedPeriod === period && { backgroundColor: theme.selectedItemBackground },
                            isDisabled && { opacity: 0.3 },
                          ]}
                          onPress={() => handlePeriodSelect(period as "AM" | "PM")}
                          disabled={isDisabled}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              { color: selectedPeriod === period ? themeColor : theme.textPrimary },
                              isDisabled && { color: theme.textSecondary },
                            ]}
                          >
                            {period}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {isYearPickerVisible && (
              <View style={[styles.yearPickerOverlay, { backgroundColor: theme.modalBackground }]}>
                <View style={[styles.yearPickerCloseContainer, { backgroundColor: theme.modalBackground }]}>
                  <TouchableOpacity style={styles.yearPickerCloseButton} onPress={() => setIsYearPickerVisible(false)}>
                    <Text style={[styles.yearPickerCloseText, { color: theme.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.yearNavigationHeader}>
                  <TouchableOpacity
                    style={[styles.yearNavButton, !canGoToPreviousYearPage() && styles.yearNavButtonDisabled]}
                    onPress={handleYearPagePrevious}
                    disabled={!canGoToPreviousYearPage()}
                  >
                    <Text
                      style={[
                        styles.yearNavButtonText,
                        { color: canGoToPreviousYearPage() ? themeColor : theme.textSecondary },
                      ]}
                    >
                      ‹
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.yearRangeText, { color: theme.textPrimary }]}>
                    {getYearsForCurrentPage()[0]} - {getYearsForCurrentPage()[getYearsForCurrentPage().length - 1]}
                  </Text>

                  <TouchableOpacity
                    style={[styles.yearNavButton, !canGoToNextYearPage() && styles.yearNavButtonDisabled]}
                    onPress={handleYearPageNext}
                    disabled={!canGoToNextYearPage()}
                  >
                    <Text
                      style={[
                        styles.yearNavButtonText,
                        { color: canGoToNextYearPage() ? themeColor : theme.textSecondary },
                      ]}
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.yearPickerContent}>
                  <View style={styles.yearGrid}>
                    {getYearsForCurrentPage().map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearItem,
                          viewedYear === year && {
                            backgroundColor: theme.selectedItemBackground,
                            borderColor: themeColor,
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() => handleYearSelect(year)}
                      >
                        <Text
                          style={[styles.yearText, { color: viewedYear === year ? themeColor : theme.textPrimary }]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <View style={styles.footerContainer}>
              <View style={styles.footerLinks}>
                {(dateOnly || activeTab === "date") && (
                  <TouchableOpacity
                    style={[styles.footerLink, isSelectedDateTimeToday() && styles.footerLinkDisabled]}
                    onPress={handleTodayClick}
                    disabled={isSelectedDateTimeToday()}
                  >
                    <Text
                      style={[
                        styles.footerLinkText,
                        { color: isSelectedDateTimeToday() ? theme.textSecondary : themeColor },
                        isSelectedDateTimeToday() && { opacity: 0.5 },
                      ]}
                    >
                      Today
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelModal}>
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneButton} onPress={doneModal}>
                  <Text style={[styles.doneButtonText, { color: themeColor }]}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 48,
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: "#F5F5F5",
    opacity: 0.6,
  },
  inputText: {
    fontSize: 16,
    color: "#333333",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  placeholderText: {
    color: "#999999",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    paddingHorizontal: 0,
    width: Dimensions.get("window").width * 0.9,
    height: 530,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 8,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    height: 40,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  timePickerContainer: {
    flexDirection: "row",
    height: 360,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  timeColumn: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: "#E0E0E0",
  },
  timeItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  selectedTimeItem: {
    backgroundColor: "#007AFF",
  },
  timeText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  selectedTimeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
    marginBottom: 12,
  },
  footerLink: {
    paddingVertical: 4,
  },
  footerLinkDisabled: {
    opacity: 0.5,
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "600",
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  yearPickerOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1000,
    borderRadius: 8,
  },
  yearPickerCloseContainer: {
    position: "absolute",
    top: -4,
    right: 8,
    zIndex: 1001,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 4,
  },
  yearPickerCloseButton: {
    padding: 4,
  },
  yearPickerCloseText: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "600",
  },
  yearNavigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  yearNavButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  yearNavButtonDisabled: {
    opacity: 0.3,
  },
  yearNavButtonText: {
    fontSize: 24,
    fontWeight: "600",
  },
  yearRangeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  yearPickerContent: {
    flex: 1,
    padding: 16,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  yearItem: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  calendarHeader: {
    alignItems: "center",
    paddingVertical: 8,
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  yearText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

const getTimeColumnStyle = (isLast: boolean, borderColor: string) => [
  styles.timeColumn,
  { borderRightColor: borderColor },
  isLast && { borderRightWidth: 0 },
]

export { DateTimePicker }
export default DateTimePicker
