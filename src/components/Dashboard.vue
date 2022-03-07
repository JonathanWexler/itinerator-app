<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <SaveStatus :last-saved="lastSaved" :loading="saving"/>
        <trips-buttons
          :itineraries="allItineraries"
          @button-select="selectItinerary"/>

        <h2> {{displayDates}} </h2>

      <download-buttons
        v-if="this.selectedDates.length && this.sortedEvents.length"
        :name="name"
        :sorted-events="sortedEvents"
        :between-dates="betweenDates"
        :display-dates="displayDates"
        @delete-itinerary="deleteItinerary"
        />
      </v-col>
      <v-col class="left-col" cols="3" xs="1">
        <section v-if="viewDate">
          <form class="activity-edit" v-if="editActivityToggle">
            <v-text-field v-model="viewDate.event.name" :counter="30" label="Activity Name" required></v-text-field>
            <v-textarea v-model="viewDate.event.description" :counter="200" label="Activity Details"></v-textarea>
            <section class="time-picker">
              <div>
                Start Time: <VueTimepicker format="HH:mm A" v-model="selectedActivity.start"/> <br/>
              </div>
              <div>
                End Time: <VueTimepicker format="HH:mm A" v-model="selectedActivity.end"/>
              </div>
            </section>
            <div v-for="(link, index) in viewDate.event.links" :key="index">
              <v-text-field v-model="link.value" label="Activity Link"></v-text-field>
            </div>
            <button @click="addLink">
              Add Link
            </button>
            <v-checkbox v-model="viewDate.event.highlight" label="Highlight"></v-checkbox>
            <v-btn class="mr-4" @click="saveEvent">
              Save
            </v-btn>
            <v-btn @click="toggleEdit(false)">
              Close
            </v-btn>
            <v-btn @click="deleteEvent">
              Delete
            </v-btn>
          </form>
          <activity-card
            class="activity-edit"
            v-else
            :name="viewDate.event.name"
            :description="viewDate.event.description"
            :start="viewDate.event.start"
            :end="viewDate.event.end"
            :links="viewDate.event.links"
            :highlight="viewDate.event.highlight"
            :image-url="viewDate.event.imageUrl || activityImage"
            @edit="toggleEdit(true)"
            @close="closeEvent"
          />
        </section>
        <section class="activity-cal" v-else>
          <v-card fluid class="tab-bar" v-if="activeButtonKey">
            <v-tabs v-model="tab" background-color="primary accent-4" fixed-tabs center-active dark>
              <v-tabs-slider color="yellow"></v-tabs-slider>
              <v-tab>Calendar</v-tab>
              <v-tab>Activities</v-tab>
            </v-tabs>
          </v-card>
          <v-date-picker v-if="tab === 0" ref="picker" dark show-adjacent-months range no-title v-model="dates" @change="emitDates">
          </v-date-picker>
          <section class='activities-card' v-else>
            <v-card class="list-activity" v-for="(activityEvent, index) in sortedEvents.flat()" :key="index"
              :color="activityEvent.color"
              @click="showEvent({event: activityEvent}, index)">
              <h1>{{activityEvent.name}}</h1>
              <h5>{{activityDateFormat(activityEvent.start)}}</h5>
            </v-card>
          </section>
        </section>


      </v-col>
      <v-col cols="8" offset-md="1" xs="12">
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
            popover
            :events="(events[day] || {}).days"
            :event-overlap-mode="mode"
            :event-overlap-threshold="30"
            :event-color="getEventColor"
            @mousedown:event="startDrag"
            @mousedown:time="startTime($event, index)"
            @mousemove:time="mouseMove"
            @mouseup:time="endDrag"
            @mouseleave.native="cancelDrag(index)"
            @click:event="showEvent($event, index)"
            @click:more="viewDay"
            @click:date="viewDay"
            >
            <template v-slot:day="{ past, date }">
              <v-row
                class="fill-height"
              >
              {{past}}
              {{date}}
              </v-row>
            </template>
            <template v-slot:day-body="{ date, week }">
              <div
                class="v-current-time"
                :class="{ first: date === week[0].date }"
                :style="{ top: nowY }"
              >
              </div>
            </template>
            <template v-slot:event="{ event, timed, eventSummary }">
              <div
                class="v-event-draggable"
                v-html="eventSummary()"
              ></div>
                  <v-img
                    class="activity-cal-image"
                    :src="event.imageUrl"
                  ></v-img>
              <div
                v-if="timed"
                class="v-event-drag-bottom"
                @mousedown.stop="extendBottom(event)"
              ></div>
            </template>
          </v-calendar>
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
// import FlashMessage from '@smartweb/vue-flash-message';
import ActivityCard from './ActivityCard';
import SaveStatus from './SaveStatus';
import TripsButtons from './TripsButtons';
import DownloadButtons from './DownloadButtons';
import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'
import axios from 'axios';

  export default {
    name: 'Dashboard',
    components: {
      TripsButtons,
      DownloadButtons,
      SaveStatus,
      VueTimepicker,
      ActivityCard
    },
    data: () => ({
      activityImage: null,
      editActivityToggle: false,
      changedEventsSinceLastSaved: [],
      changedSinceLastSaved: false,
      selectedActivity: {
        start: {
          HH: '',
          mm: '',
        },
        end: {
          HH: '',
          mm: '',
        },
      },
      saving: false,
      lastSaved: null,
      user : {},
      name: '',
      focus: '',
      dates: [],
      tab: 0,
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
      events: {},
      colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
      names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
      dragEvent: null,
      dragStart: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null,
      itineraries: {},
      viewDate: null,
      activeButtonKey: null
    }),
    async mounted () {
      // TODO: Fetch from DB
      if (localStorage.getItem('itinerator-clear') !== 'true') {
        localStorage.setItem('itinerator', '{}')
        localStorage.setItem('itinerator-clear', 'true')
      }
      this.setItineraries()
      this.$root.$on('login', (data) => {
        this.user = data;
        console.log('logged in data:', data)
      })
    },
    computed: {
      sortedEvents () {
        if (!Object.keys(this.events).length) return []
        return this.betweenDates.map(d => this.events[d].days)
      },
      betweenDatesMap () {
        return this.betweenDates.map(d => d.toISOString().split('T')[0])
      },
      today () {
        const today = (new Date().toISOString()).split('T')[0]
        return today
      },
      cal () {
        this.$nextTick()
        window.refs = this.$refs
        const todayBetween = this.betweenDatesMap.indexOf(this.today)
        return this.$refs[`calendar-${todayBetween}`]
      },
      nowY () {
        // TODO: FIX THIS
        return this.cal ? this.cal.timeToY(this.cal.times.now) + 'px' : '-10px'
      },
      allItineraries () {
        return Object.entries(this.itineraries).map(([key,v]) => {
          return {...v, key}
        })
      },
      displayDates () {
        return this.formatDates(this.selectedDates)
      },
      stringifiedDates () {
        return this.dates.join('_')
      }
    },
    methods: {
      addLink (event) {
        event.preventDefault()
        if (!this.viewDate.event.links) this.viewDate.event.links = []
        this.viewDate.event.links.push({value: ''})
      },
      toggleEdit (value) {
        this.editActivityToggle = !!value;
      },
      activityDateFormat (time) {
        const date = new Date(time)
        const day = date.toString().split(' ').slice(0,3).join(' ')
        return `${day} ${date.toLocaleTimeString()}`;
      },
      updateEventTimes () {
        const {event} = this.viewDate
        const start = new Date(event.start)
        const end = new Date(event.end)
        start.setHours(this.selectedActivity.start.HH)
        start.setMinutes(this.selectedActivity.start.mm)
        end.setHours(this.selectedActivity.end.HH)
        end.setMinutes(this.selectedActivity.end.mm)

        event.start = start.getTime()
        event.end = end.getTime()
      },
      saveEvent () {
        // const { event, index } = this.viewDate
        // this.events[index] = event
        this.updateEventTimes()
        this.saveEvents()
        this.toggleEdit(false)
        // this.closeEvent()
      },
      deleteItinerary () {
        delete this.itineraries[this.stringifiedDates]
        this.selectedDates = []
        this.dates = []
        this.betweenDates = []
        this.name = null
        this.saveEvents()
      },
      closeEvent () {
        this.viewDate = null;
        this.selectedActivity = {
          start: {
            HH: '',
            mm: '',
          },
          end: {
            HH: '',
            mm: '',
          },
        }
      },

      deleteEvent () {
        const { index, event } = this.viewDate
        const activityIndex = this.events[this.betweenDates[index]].days.indexOf(event)
        this.events[this.betweenDates[index]].days.splice(activityIndex, 1)
        this.saveEvent()
      },
      showDate (event, index) {
        const start = new Date(event.start)
        const end = new Date(event.end)
        this.selectedActivity.start.HH = ("0" + start.getHours().toString()).slice(-2)
        this.selectedActivity.start.mm = ("0" + start.getMinutes().toString()).slice(-2)
        this.selectedActivity.end.HH = ("0" + end.getHours().toString()).slice(-2)
        this.selectedActivity.end.mm = ("0" + end.getMinutes().toString()).slice(-2)

        this.viewDate = {
          event,
          index
        }
      },
      showEvent ({ nativeEvent, event }, index) {
        this.showDate(event, index, nativeEvent);
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
      clearActive () {
        this.activeButtonKey = null;
      },
      selectItinerary (key) {
        this.clearActive();
        this.activeButtonKey = key;
        this.selectedDates = key.split('_')
        this.dates = this.selectedDates
        this.betweenDates = this.getBetweenDates(this.dates)
        const { events, name } = this.itineraries[key]
        this.events = events
        this.name = name
      },
      setItineraries() {
        // TODO: Fetch from DB? But not priority
        const localValue = JSON.parse(localStorage.getItem('itinerator') || {})
        this.itineraries = localValue
      },
      async postEvents () {
        this.saving = true;
        const itinerary = this.itineraries[this.activeButtonKey]
        console.log('post save', this.viewDate, itinerary)
        const URI = 'https://itinerator-api.herokuapp.com'
        // const devURI = 'http://localhost:3000'
        const serverRes = await axios.post(
          `/${URI}/users/save`, {
            itineraries: this.itineraries,
            link: (this.viewDate || {})?.event?.links
          },
         {
           headers: {
            'Authorization': this.$cookies.get('itinerator-token')
          }
         })
         this.saving = false;
         this.lastSaved = Date.now();
         this.itineraries = serverRes.data.itineraries;
         this.activityImage = serverRes.data.image;
         console.log('J', this.itineraries[this.activeButtonKey])
         console.log('save Itin', serverRes)
      },
      async saveEvents () {
        if (this.stringifiedDates) {
          this.itineraries[this.stringifiedDates] = {
            ...this.itineraries[this.stringifiedDates],
            name: this.name,
            events: this.events
          }
        }
        // TODO Save to DB
        await this.postEvents();
        localStorage.setItem('itinerator', JSON.stringify(this.itineraries));
        this.setItineraries()
      },
      startDrag ({ event, timed }) {
        if (event && timed) {
          this.dragEvent = event
          this.dragTime = null
          this.extendOriginal = null
          this.saveEvents()
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
            name: `Activity #${this.events[this.betweenDates[index]].days.length + 1}`,
            color: this.rndElement(this.colors),
            start: this.createStart,
            end: this.createStart,
            timed: true,
            links: []
          }
          this.events[this.betweenDates[index]].days.push(this.createEvent)
          // this.events.forEach((day, dayIndex) => {
          //   if (index !== dayIndex) day.pop()
          // })
          console.log('EVENTS', this.events)
        }
      },
      extendBottom (event) {
        this.createEvent = event
        this.createStart = event.start
        this.extendOriginal = event.end
        this.saveEvents()
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
        this.saveEvents()
      },
      cancelDrag (index) {
        if (this.createEvent) {
          if (this.extendOriginal) {
            this.createEvent.end = this.extendOriginal
          } else {
            const i =  this.events[this.betweenDates[index]].days.indexOf(this.createEvent)
            if (i !== -1) {
              this.events[this.betweenDates[index]].days.splice(i, 1)
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
        this.saveEvents()
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
        this.events = this.betweenDates.reduce((accum, date) => {
          accum[date] = { days: [] }
          return accum
        }, {});
        console.log('MAKING EVENTS', this.events)
        this.$emit('date-select', dates)
      },
      getEventColor (event) {
        return event.color
      },
    },
  }
</script>
<style scoped lang="scss">
.cal-section {
  max-height: 400px;
}
.itinerary {
  display: inline-flex;
  // padding: 10px;
  // // background: greenyellow;
  // max-width: 300px;
  margin: 10px;
  justify-content: space-between;
  cursor: pointer;
}
.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    content: '';
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}
.tab-bar {
  width: 100%;
}

.activity-edit {
  width: 350px;
  position: fixed;
  top: 150px;
  max-height: 550px;
  overflow-y: auto;
  padding-bottom: 5px;
  padding-right: 15px;
  margin-right: 15px;
}

.activity-cal {
  width: 350px;
  position: fixed;
  top: 150px;
  padding: 5px;
}
.activities-card {
  max-height: 500px;
  overflow-y:scroll;
}

.list-activity {
  margin-bottom: 5px;
  padding: 5px 0;
  &:hover{
    opacity: .8;
  }
}

.time-picker {
  display: flex;
}

.v-event-drag-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 4px;
  cursor: ns-resize;

  &::after {
    display: none;
    position: absolute;
    left: 50%;
    height: 4px;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
    width: 16px;
    margin-left: -8px;
    opacity: 0.8;
    content: '';
  }

  &:hover::after {
    display: block;
  }
}

.activity-cal-image {
  max-width: 150px;
  position: absolute;
  top: 0;
}
</style>
