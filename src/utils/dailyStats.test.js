import { describe, it, expect } from 'vitest'
import {
  incrementDailyStat,
  addMinutesToDaily,
  getTodayKey
} from './dailyStats'

describe('Daily Stats Utilities', () => {
  describe('getTodayKey', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const today = getTodayKey()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      const expectedToday = new Date().toISOString().slice(0, 10)
      expect(today).toBe(expectedToday)
    })
  })

  describe('incrementDailyStat', () => {
    it('should create new daily entry if none exists', () => {
      const daily = {}
      const result = incrementDailyStat(daily, 'scans')

      const today = getTodayKey()
      expect(result[today]).toBeDefined()
      expect(result[today].scans).toBe(1)
      expect(result[today].marks).toBe(0)
      expect(result[today].minutes).toBe(0)
    })

    it('should increment existing daily stat', () => {
      const today = getTodayKey()
      const daily = {
        [today]: { scans: 2, marks: 3, minutes: 10 }
      }

      const result = incrementDailyStat(daily, 'scans')
      expect(result[today].scans).toBe(3)
      expect(result[today].marks).toBe(3)
      expect(result[today].minutes).toBe(10)
    })

    it('should increment marks stat', () => {
      const today = getTodayKey()
      const daily = {
        [today]: { scans: 5, marks: 2, minutes: 0 }
      }

      const result = incrementDailyStat(daily, 'marks')
      expect(result[today].marks).toBe(3)
      expect(result[today].scans).toBe(5)
    })

    it('should preserve other dates in daily object', () => {
      const today = getTodayKey()
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

      const daily = {
        [yesterday]: { scans: 10, marks: 5, minutes: 30 },
        [today]: { scans: 1, marks: 0, minutes: 0 }
      }

      const result = incrementDailyStat(daily, 'scans')
      expect(result[yesterday].scans).toBe(10)
      expect(result[today].scans).toBe(2)
    })
  })

  describe('addMinutesToDaily', () => {
    it('should add minutes to today', () => {
      const today = getTodayKey()
      const daily = {
        [today]: { scans: 1, marks: 0, minutes: 10 }
      }

      const result = addMinutesToDaily(daily, 15)
      expect(result[today].minutes).toBe(25)
    })

    it('should create new daily entry if none exists', () => {
      const daily = {}
      const result = addMinutesToDaily(daily, 30)

      const today = getTodayKey()
      expect(result[today].minutes).toBe(30)
      expect(result[today].scans).toBe(0)
      expect(result[today].marks).toBe(0)
    })

    it('should handle fractional minutes by rounding', () => {
      const today = getTodayKey()
      const daily = {
        [today]: { scans: 0, marks: 0, minutes: 0 }
      }

      const result = addMinutesToDaily(daily, 12.7)
      expect(result[today].minutes).toBe(12.7)
    })
  })
})
