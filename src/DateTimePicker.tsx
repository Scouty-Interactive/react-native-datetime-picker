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
import moment from "moment"

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
  disabledDates?: string[] // Array of specific dates to disable in "YYYY-MM-DD" format
  disablePreviousDatesFrom?: Date // Disable dates and times before this specific date/time
  dateOnly?: boolean // Hide tabs and show only calendar, automatically excludes time from display format
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
  disabledDates = [],
  disablePreviousDatesFrom,
  dateOnly = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [viewedDate, setViewedDate] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"date" | "time">("date")
  const [selectedHour, setSelectedHour] = useState<number>(12)
  const [selectedMinute, setSelectedMinute] = useState<number>(0)
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM")
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(moment().year())
  const [viewedYear, setViewedYear] = useState<number>(moment().year())
  const [yearPage, setYearPage] = useState<number>(0)

  const [disableFutureDates, setDisableFutureDates] = useState(false)

  const hourScrollRef = useRef<ScrollView>(null)
  const minuteScrollRef = useRef<ScrollView>(null)
  const periodScrollRef = useRef<ScrollView>(null)
  const yearScrollRef = useRef<ScrollView>(null)

  const [years, setYears] = useState<number[]>([])
  const width = Dimensions.get("window").width

  useEffect(() => {
    setYears(Array.from({ length: 101 }, (_, i) => moment().year() - 50 + i))
    const currentYear = moment().year()
    const startYear = currentYear - 50
    const initialPage = Math.floor((currentYear - startYear) / 20)
    setYearPage(initialPage)
  }, [])

  useEffect(() => {
    if (value) {
      const momentValue = moment(value, "YYYY-MM-DD H:mm:ss")
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
      const now = moment()
      setSelectedDate(now.format("YYYY-MM-DD"))
      setViewedDate(now.format("YYYY-MM-DD"))
      const hour = now.hour()
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      setSelectedHour(displayHour)
      setSelectedMinute(Math.floor(now.minute() / 5) * 5)
      setSelectedPeriod(period)
      setSelectedYear(now.year())
      setViewedYear(now.year())
    }
  }, [value])

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
      // If there's a selected date, navigate to that month
      setViewedDate(selectedDate)
      setViewedYear(moment(selectedDate).year())
    } else {
      // If no selected date, navigate to current month
      const now = moment()
      setViewedDate(now.format("YYYY-MM-DD"))
      setViewedYear(now.year())
    }

    setActiveTab(dateOnly ? "date" : "date") // Always reset to calendar tab when opening modal
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

      const formattedValue = moment()
        .year(selectedYear)
        .month(moment(selectedDate).month())
        .date(moment(selectedDate).date())
        .hour(hour24)
        .minute(selectedMinute)
        .second(0)
        .format("YYYY-MM-DD H:mm:00")

      onChange?.(formattedValue)
    }
    setIsModalVisible(false)
  }

  const handleTodayClick = () => {
    const today = moment()
    const todayString = today.format("YYYY-MM-DD")

    setSelectedDate(todayString)
    setViewedDate(todayString)
    setSelectedYear(today.year())
    setViewedYear(today.year())

    // Set time to current time
    const hour = today.hour()
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    setSelectedHour(displayHour)
    setSelectedMinute(Math.floor(today.minute() / 5) * 5)
    setSelectedPeriod(period)
  }

  const isSelectedDateTimeToday = () => {
    if (!selectedDate) return false

    const today = moment()
    const selectedMoment = moment(selectedDate)

    // Check if date is today
    if (!selectedMoment.isSame(today, "day")) return false

    // If dateOnly mode, only check date
    if (dateOnly) return true

    // Check if time is also current time (within 5 minutes)
    const hour24 =
      selectedPeriod === "AM" ? (selectedHour === 12 ? 0 : selectedHour) : selectedHour === 12 ? 12 : selectedHour + 12

    const selectedTime = selectedMoment.clone().hour(hour24).minute(selectedMinute)
    const timeDiff = Math.abs(selectedTime.diff(today, "minutes"))

    return timeDiff <= 5 // Consider "today" if within 5 minutes
  }

  const handleDateSelect = (day: any) => {
    if (!isDateDisabled(day.dateString)) {
      setSelectedDate(day.dateString)
      setViewedDate(day.dateString)
      setSelectedYear(moment(day.dateString).year())
      setViewedYear(moment(day.dateString).year())
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
    if (isTimeDisabled(hour, selectedMinute, selectedPeriod)) {
      return
    }
    setSelectedHour(hour)
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
    if (isTimeDisabled(selectedHour, selectedMinute, period)) {
      return
    }
    setSelectedPeriod(period)
    const periodIndex = periods.findIndex((p) => p === period)
    scrollToSelectedItem(periodScrollRef, periodIndex)
  }

  const handleYearSelect = (year: number) => {
    setViewedYear(year)
    const currentMoment = moment(viewedDate)
    const newDate = currentMoment.clone().year(year)

    if (!newDate.isValid() || newDate.month() !== currentMoment.month() || newDate.date() !== currentMoment.date()) {
      newDate.year(year).month(currentMoment.month()).endOf("month")
    }

    const newDateString = newDate.format("YYYY-MM-DD")
    setViewedDate(newDateString)
    setIsYearPickerVisible(false)
  }

  const handleMonthChange = (month: any) => {
    const newDate = moment(month.dateString)

    setViewedYear(newDate.year())

    const currentDay = moment(viewedDate).date()
    const newMonthDate = newDate.clone().date(Math.min(currentDay, newDate.daysInMonth()))
    setViewedDate(newMonthDate.format("YYYY-MM-DD"))

    // Note: Date selection restrictions are handled in isDateDisabled() and getMarkedDates()
    // This allows navigation to previous months while keeping dates properly disabled
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const periods = ["AM", "PM"]

  const getFormattedDateTime = () => {
    if (!selectedDate) return "No date selected"

    const hour24 =
      selectedPeriod === "AM" ? (selectedHour === 12 ? 0 : selectedHour) : selectedHour === 12 ? 12 : selectedHour + 12

    const momentDateTime = moment()
      .year(selectedYear)
      .month(moment(selectedDate).month())
      .date(moment(selectedDate).date())
      .hour(hour24)
      .minute(selectedMinute)
      .second(0)

    const formatToUse = dateOnly ? "MMMM DD, YYYY" : displayFormat
    return momentDateTime.format(formatToUse)
  }

  const getDisplayValue = () => {
    if (value) {
      const momentValue = moment(value, "YYYY-MM-DD H:mm:ss")
      if (momentValue.isValid()) {
        const formatToUse = dateOnly ? "MMMM DD, YYYY" : displayFormat
        return momentValue.format(formatToUse)
      }
    }
    return selectedDate ? getFormattedDateTime() : placeholder
  }

  const theme = {
    modalBackground: darkMode ? darkModeColor : "#FFFFFF",
    textPrimary: darkMode ? "#FFFFFF" : "#333333",
    textSecondary: darkMode ? "#8E8E93" : "#666666",
    textPlaceholder: darkMode ? "#8E8E93" : "#999999",
    borderColor: darkMode ? "#38383A" : "#E0E0E0",
    tabBackground: darkMode ? "#2C2C2E" : "#F5F5F5",
    tabActiveBackground: darkMode ? "#2C2C2E" : "#F5F5F5",
    selectedItemBackground: `${themeColor}4D`, // 30% opacity
    inputBackground: darkMode ? darkModeColor : "#FFFFFF",
    inputBorder: darkMode ? "#38383A" : "#E0E0E0",
    tabActiveBorder: themeColor,
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
      const today = moment().format("YYYY-MM-DD")
      if (moment(dateString).isBefore(today, "day")) {
        return true
      }
    }

    if (disableFutureDates) {
      const today = moment().format("YYYY-MM-DD")
      if (moment(dateString).isAfter(today, "day")) {
        return true
      }
    }

    if (disablePreviousDatesFrom) {
      const disableFromDate = moment(disablePreviousDatesFrom).format("YYYY-MM-DD")
      if (moment(dateString).isBefore(disableFromDate, "day")) {
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
    const selectedTime = moment(selectedDate).hour(hour24).minute(minute)

    if (disablePastDates) {
      const now = moment()
      const today = now.format("YYYY-MM-DD")

      if (selectedDate === today && selectedTime.isBefore(now)) {
        return true
      }
    }

    if (disablePreviousDatesFrom) {
      const disableFromMoment = moment(disablePreviousDatesFrom)
      const disableFromDate = disableFromMoment.format("YYYY-MM-DD")

      if (selectedDate === disableFromDate && selectedTime.isBefore(disableFromMoment)) {
        return true
      }
    }

    return false
  }

  const getMarkedDates = () => {
    const marked: any = {}

    if (selectedDate) {
      marked[selectedDate] = { selected: true, selectedColor: themeColor }
    }

    // Mark specific disabled dates from the array
    disabledDates.forEach((dateString) => {
      if (!marked[dateString]) {
        marked[dateString] = {}
      }
      marked[dateString].disabled = true
      marked[dateString].disableTouchEvent = true
    })

    // For disablePreviousDatesFrom, only mark dates if they're in a reasonable range
    if (disablePreviousDatesFrom) {
      const disableFromDate = moment(disablePreviousDatesFrom)
      const currentViewedDate = moment(viewedDate)

      // Only mark dates in the currently viewed month and adjacent months
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

    // For disablePastDates, only mark dates in the currently viewed month and adjacent months
    if (disablePastDates) {
      const today = moment()
      const currentViewedDate = moment(viewedDate)

      // Only mark dates in the currently viewed month and adjacent months
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
      const today = moment()
      const currentViewedDate = moment(viewedDate)

      // Only mark dates in the currently viewed month and adjacent months
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
      <TouchableOpacity
        style={[
          styles.input,
          { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
          inputStyle,
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Text
          style={[
            styles.inputText,
            { color: !selectedDate && !value ? theme.textPlaceholder : theme.textPrimary },
            textStyle,
          ]}
        >
          {getDisplayValue()}
        </Text>
      </TouchableOpacity>

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
                      setViewedYear(moment(selectedDate).year())
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
                    const headerDate = moment(viewedDate).year(viewedYear)
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
                      const isDisabled = isTimeDisabled(hour, selectedMinute, selectedPeriod)
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
                      const isDisabled = isTimeDisabled(selectedHour, selectedMinute, period as "AM" | "PM")
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

                <TouchableOpacity style={styles.footerLink} onPress={() => setDisableFutureDates(!disableFutureDates)}>
                  <Text style={[styles.footerLinkText, { color: themeColor }]}>
                    {disableFutureDates ? "Enable Future Dates" : "Disable Future Dates"}
                  </Text>
                </TouchableOpacity>
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
    height: 530, // Increased height from 500 to 530 for more space above footer
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
    height: 360, // Increased from 320 to 360 to utilize extra modal height
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
