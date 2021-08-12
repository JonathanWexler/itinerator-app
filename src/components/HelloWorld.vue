<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <h1>Itinerator</h1>
        <h2> {{displayDates}} </h2>
      </v-col>
      <v-col cols="3">
        <v-date-picker
          ref="picker"
          dark
          show-adjacent-months
          range
          v-model="dates"
          @change="emitDates">
          </v-date-picker>
      </v-col>
      <v-col cols="8" offset-md="1">
        <v-row justify="center">
        </v-row>
        <v-sheet height="600">
          <v-calendar
            v-for="(day, index) in betweenDates"
            :key="index"
            :ref="`calendar-${index}`"
            v-model="values[index]"
            :weekdays="weekday"
            :type="type"
            :start="day"
            :events="events"
            :event-overlap-mode="mode"
            :event-overlap-threshold="30"
            :event-color="getEventColor"
            @mousedown:event="startDrag"
            @mousedown:time="startTime"
            @mousemove:time="mouseMove"
            @mouseup:time="endDrag"
            @mouseleave.native="cancelDrag"
            @change="getEvents"/>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'HelloWorld',
    data: () => ({
      dates: [],
      betweenDates: [],
      selectedDates: [],
      picker: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      type: 'day',
      types: ['month', 'week', 'day', '4day'],
      mode: 'stack',
      modes: ['stack', 'column'],
      weekday: [0, 1, 2, 3, 4, 5, 6],
      weekdays: [
        { text: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
        { text: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
        { text: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
        { text: 'Mon, Wed, Fri', value: [1, 3, 5] },
      ],
      values: {},
      events: [],
      colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
      names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
      dragEvent: null,
      dragStart: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null
    }),
    computed: {
      displayDates () {
        const [first, second] = this.selectedDates
        const [date1, date2] = [new Date(first), new Date(second)]
        console.log('displaying', first, second)
        if (!first && !second) return 'Select Dates'
        else if (!second || first == second) return date1
        return `${date1.toDateString()} to ${date2.toDateString()}`
      }
    },
    methods: {
            startDrag ({ event, timed }) {
        if (event && timed) {
          this.dragEvent = event
          this.dragTime = null
          this.extendOriginal = null
        }
      },
      startTime (tms) {
        const mouse = this.toTime(tms)

        if (this.dragEvent && this.dragTime === null) {
          const start = this.dragEvent.start

          this.dragTime = mouse - start
        } else {
          this.createStart = this.roundTime(mouse)
          this.createEvent = {
            name: `Activity #${this.events.length + 1}`,
            color: this.rndElement(this.colors),
            start: this.createStart,
            end: this.createStart,
            timed: true,
          }

          this.events.push(this.createEvent)
        }
      },
      extendBottom (event) {
        this.createEvent = event
        this.createStart = event.start
        this.extendOriginal = event.end
      },
      mouseMove (tms) {
        const mouse = this.toTime(tms)

        if (this.dragEvent && this.dragTime !== null) {
          const start = this.dragEvent.start
          const end = this.dragEvent.end
          const duration = end - start
          const newStartTime = mouse - this.dragTime
          const newStart = this.roundTime(newStartTime)
          const newEnd = newStart + duration

          this.dragEvent.start = newStart
          this.dragEvent.end = newEnd
        } else if (this.createEvent && this.createStart !== null) {
          const mouseRounded = this.roundTime(mouse, false)
          const min = Math.min(mouseRounded, this.createStart)
          const max = Math.max(mouseRounded, this.createStart)

          this.createEvent.start = min
          this.createEvent.end = max
        }
      },
      endDrag () {
        this.dragTime = null
        this.dragEvent = null
        this.createEvent = null
        this.createStart = null
        this.extendOriginal = null
      },
      cancelDrag () {
        if (this.createEvent) {
          if (this.extendOriginal) {
            this.createEvent.end = this.extendOriginal
          } else {
            const i = this.events.indexOf(this.createEvent)
            if (i !== -1) {
              this.events.splice(i, 1)
            }
          }
        }

        this.createEvent = null
        this.createStart = null
        this.dragTime = null
        this.dragEvent = null
      },
      rnd (a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a
      },
      rndElement (arr) {
        return arr[this.rnd(0, arr.length - 1)]
      },
      roundTime (time, down = true) {
        const roundTo = 15 // minutes
        const roundDownTime = roundTo * 60 * 1000

        return down
          ? time - time % roundDownTime
          : time + (roundDownTime - (time % roundDownTime))
      },
      toTime (tms) {
        return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
      },
      slashDate(date) {
        return date.split('-').join('/')
      },
      getBetweenDates ([startDate, endDate]) {
        startDate = new Date(this.slashDate(startDate))
        endDate = new Date(this.slashDate(endDate))
        const dates = []
        let currentDate = startDate
        const addDays = function (days) {
          const date = new Date(this.valueOf())
          date.setDate(date.getDate() + days)
          return date
        }
        while (currentDate <= endDate) {
          dates.push(currentDate)
          currentDate = addDays.call(currentDate, 1)
        }
        return dates
      },
      emitDates (dates) {      
        this.selectedDates = dates
        this.betweenDates = this.getBetweenDates(dates)
        console.log('DATE SELECTED', dates)
        this.$emit('date-select', dates)
      },
      getEvents ({ start, end }) {
        const one = 1
        if (one == '1') return []
        const events = []

        const min = new Date(`${start.date}T10:00:00`)
        const max = new Date(`${end.date}T13:59:59`)
        const days = (max.getTime() - min.getTime()) / 86400000
        const eventCount = this.rnd(days, days + 20)

        for (let i = 0; i < eventCount; i++) {
          const allDay = this.rnd(0, 3) === 0
          const firstTimestamp = this.rnd(min.getTime(), max.getTime())
          const first = new Date(firstTimestamp - (firstTimestamp % 900000))
          const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000
          const second = new Date(first.getTime() + secondTimestamp)

          events.push({
            name: this.names[this.rnd(0, this.names.length - 1)],
            start: first,
            end: second,
            color: this.colors[this.rnd(0, this.colors.length - 1)],
            timed: !allDay,
          })
        }

        this.events = events
      },
      getEventColor (event) {
        return event.color
      },
    },
  }
</script>
<style scoped>
.cal-section {
  max-height: 400px;
}
</style>
