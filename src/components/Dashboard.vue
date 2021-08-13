<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <span
          class="itinerary"
          v-for="(itin, index) in allItineraries"
          :key="index"
          @click="selectItinerary(itin[0])">
          {{ itin[1].name || formatDates(itin[0].split('_'))}}
          </span>
        <h2 @click="download"> {{displayDates}} </h2>
      </v-col>
      <v-col cols="3">
        <v-date-picker
          ref="picker"
          dark
          show-adjacent-months
          range
          no-title
          v-model="dates"
          @change="emitDates">
          </v-date-picker>
      </v-col>
      <v-col cols="8" offset-md="1">
        <v-row justify="center">
          <v-text-field label="Trip Name" v-model="name" @change="nameChange"></v-text-field>
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
            :events="events[index]"
            :event-overlap-mode="mode"
            :event-overlap-threshold="30"
            :event-color="getEventColor"
            @mousedown:event="startDrag"
            @mousedown:time="startTime($event, index)"
            @mousemove:time="mouseMove"
            @mouseup:time="endDrag"
            @mouseleave.native="cancelDrag(index)"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            />
            <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-btn icon>
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <span v-html="selectedEvent.details"></span>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { jsPDF } from 'jspdf';

  export default {
    name: 'Dashboard',
    data: () => ({
      name: '',
      focus: '',
      dates: [],
      selectedOpen: false,
      selectedEvent: {},
      selectedElement: {},
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
      extendOriginal: null,
      itineraries: {}
    }),
    mounted () {
      // localStorage.setItem('itinerator', '{}')
      this.setItineraries()
    },
    computed: {
      allItineraries () {
        return Object.entries(this.itineraries)
      },
      displayDates () {
        return this.formatDates(this.selectedDates)
      },
      stringifiedDates () {
        return this.dates.join('_')
      }
    },
    methods: {
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          requestAnimationFrame(() => requestAnimationFrame(() => open()))
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      download () {
        var doc = new jsPDF();

        doc.setFontSize(30);
        doc.text(`${this.name}`, 20, 30);
        doc.setFontSize(16);
        doc.text(`${this.displayDates}`, 20, 40);
        let offset = 40;
        let page = 1;
        const description = "This is the description. This is fun. This is the description. This is fun."

        this.events.forEach((event, index) => {
          if (offset >= page * 250) {
            doc.addPage();
            offset = 10;
          }
          console.log('event', event, this.betweenDates[index])
          doc.setFontSize(22);
          doc.text(`${this.betweenDates[index].toDateString()}`, 20, 20 + offset);
          event.forEach(activity => {
            doc.setFontSize(16);
            doc.text(new Date(activity.start).toLocaleTimeString(), 60, 30 + offset, {
                align: 'right',
            });
            doc.text(activity.name, 70, 30 + offset);
            doc.setFontSize(10);
            doc.text(description, 70, 35 + offset);
            offset += 15;
          })
          offset += 20;
        });

        doc.save(`${this.name} itinerary.pdf`);
      },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      formatDates ([first, second]) {
        const [date1, date2] = [new Date(first), new Date(second)]
        if (!first && !second) return 'Select Dates'
        else if (!second || first == second) return date1.toDateString()
        return `${date1.toDateString()} to ${date2.toDateString()}`
      },
      selectItinerary (key) {
        this.selectedDates = key.split('_')
        this.dates = this.selectedDates
        this.betweenDates = this.getBetweenDates(this.dates)
        const { events, name } = this.itineraries[key]
        this.events = events
        this.name = name
      },
      setItineraries() {
        const localValue = JSON.parse(localStorage.getItem('itinerator') || {})
        this.itineraries = localValue
      },
      saveEvent () {
        this.itineraries[this.stringifiedDates] = {
          name: this.name,
          events: this.events
        }
        localStorage.setItem('itinerator', JSON.stringify(this.itineraries))
        this.setItineraries()
      },
      startDrag ({ event, timed }) {
        if (event && timed) {
          this.dragEvent = event
          this.dragTime = null
          this.extendOriginal = null
          this.saveEvent()
        }
      },
      startTime (tms, index) {
        const mouse = this.toTime(tms)

        if (this.dragEvent && this.dragTime === null) {
          const start = this.dragEvent.start

          this.dragTime = mouse - start
        } else {
          this.createStart = this.roundTime(mouse)
          this.createEvent = {
            name: `Activity #${this.events[index].length + 1}`,
            color: this.rndElement(this.colors),
            start: this.createStart,
            end: this.createStart,
            timed: true,
          }

          this.events[index].push(this.createEvent)
        }
      },
      extendBottom (event) {
        this.createEvent = event
        this.createStart = event.start
        this.extendOriginal = event.end
        this.saveEvent()
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
        this.saveEvent()
      },
      cancelDrag (index) {
        if (this.createEvent) {
          if (this.extendOriginal) {
            this.createEvent.end = this.extendOriginal
          } else {
            const i = this.events[index].indexOf(this.createEvent)
            if (i !== -1) {
              this.events[index].splice(i, 1)
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
      nameChange () {
        this.saveEvent()
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
        this.events = Array(this.betweenDates.length).fill([])
        this.$emit('date-select', dates)
      },
      // getEvents ({ start, end }) {
      //   const one = 1
      //   if (one == '1') return []
      //   const events = []

      //   const min = new Date(`${start.date}T10:00:00`)
      //   const max = new Date(`${end.date}T13:59:59`)
      //   const days = (max.getTime() - min.getTime()) / 86400000
      //   const eventCount = this.rnd(days, days + 20)

      //   for (let i = 0; i < eventCount; i++) {
      //     const allDay = this.rnd(0, 3) === 0
      //     const firstTimestamp = this.rnd(min.getTime(), max.getTime())
      //     const first = new Date(firstTimestamp - (firstTimestamp % 900000))
      //     const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000
      //     const second = new Date(first.getTime() + secondTimestamp)

      //     events.push({
      //       name: this.names[this.rnd(0, this.names.length - 1)],
      //       start: first,
      //       end: second,
      //       color: this.colors[this.rnd(0, this.colors.length - 1)],
      //       timed: !allDay,
      //     })
      //   }

      //   this.events = events
      // },
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
.itinerary {
  display: inline-flex;
  padding: 10px;
  background: greenyellow;
  max-width: 300px;
  margin: 10px;
  justify-content: space-between;
  cursor: pointer;
}
</style>
