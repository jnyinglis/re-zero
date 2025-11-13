/**
 * Utility functions for tracking daily statistics
 * Used by Reflection mode to display scans, marks, and minutes logged
 */

/**
 * Get today's date key in YYYY-MM-DD format
 * @returns {string} Today's date key
 */
export function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Initialize a daily entry with default values
 * @returns {object} Daily entry with scans, marks, and minutes set to 0
 */
function initializeDailyEntry() {
  return {
    scans: 0,
    marks: 0,
    minutes: 0
  }
}

/**
 * Increment a daily stat counter (scans or marks)
 * @param {object} daily - The daily stats object
 * @param {string} statKey - The stat to increment ('scans' or 'marks')
 * @returns {object} Updated daily object
 */
export function incrementDailyStat(daily, statKey) {
  const today = getTodayKey()
  const currentStats = daily[today] || initializeDailyEntry()

  return {
    ...daily,
    [today]: {
      ...currentStats,
      [statKey]: (currentStats[statKey] || 0) + 1
    }
  }
}

/**
 * Add minutes to today's logged time
 * @param {object} daily - The daily stats object
 * @param {number} minutes - Minutes to add
 * @returns {object} Updated daily object
 */
export function addMinutesToDaily(daily, minutes) {
  const today = getTodayKey()
  const currentStats = daily[today] || initializeDailyEntry()

  return {
    ...daily,
    [today]: {
      ...currentStats,
      minutes: (currentStats.minutes || 0) + minutes
    }
  }
}
