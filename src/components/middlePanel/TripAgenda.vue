<template>
  <v-sheet height="600">
    <v-calendar
      v-for="(day, index) in betweenDates"
      :key="index"
      :ref="`calendar-${index}`"
      v-model="calendarItems[index]"
      :weekdays="weekday"
      :type="calendar.type"
      :start="day"
      popover
      :events="(tripDays[day] || {}).activities"
      :event-overlap-mode="calendar.mode"
      :event-overlap-threshold="30"
      :event-color="getEventColor"
      @mousedown:event="startDrag"
      @mousedown:time="startTime($event, index)"
      @mousemove:time="mouseMove"
      @mouseup:time="endDrag"
      @mouseleave.native="cancelDrag(index)"
      @click:event="$emit('select-event', { event: $event.event, index })"
      @click:more="$emit('select-activity')"
      @click:date="$emit('select-activity')"
    >
      <template v-slot:day="{ past, date }">
        <v-row class="fill-height">
          {{ past }}
          {{ date }}
        </v-row>
      </template>
      <template v-slot:day-body="{ date, week }">
        <div
          class="v-current-time activity-on-cal"
          :class="{ first: date === week[0].date }"
          :style="{ top: nowY }"
        ></div>
      </template>
      <template v-slot:event="{ event, timed, eventSummary }">
        <div class="v-event-draggable" v-html="eventSummary()"></div>
        <v-img class="activity-cal-image" :src="event.imageUrl"></v-img>
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
      <v-card color="grey lighten-4" min-width="350px" flat>
        <v-toolbar :color="selectedEvent.color" dark>
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
          <v-btn text color="secondary" @click="selectedOpen = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </v-sheet>
</template>
<script>
  const COLORS = [
    "blue"
    // "indigo"
    // "deep-purple",
    // "cyan",
    // "green",
    // "orange",
    // "grey darken-1"
  ];

  export default {
    name: "TripAgenda",
    props: {
      betweenDates: {
        type: Array,
        default: () => []
      },
      tripDays: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        calendarItems: {},
        calendar: {
          type: "day",
          types: ["month", "week", "day", "4day"],
          mode: "stack",
          modes: ["stack", "column"]
        },
        selectedElement: {},
        selectedOpen: false,
        selectedEvent: {}
      };
    },
    methods: {
      nowY() {
        // TODO: FIX THIS
        return this.cal ? this.cal.timeToY(this.cal.times.now) + "px" : "-10px";
      },
      startDrag({ event, timed }) {
        if (event && timed) {
          this.dragEvent = event;
          this.dragTime = null;
          this.extendOriginal = null;
          // this.saveItineraries();
        }
      },
      roundTime(time, down = true) {
        const roundTo = 15; // minutes
        const roundDownTime = roundTo * 60 * 1000;

        return down
          ? time - (time % roundDownTime)
          : time + (roundDownTime - (time % roundDownTime));
      },
      toTime(tms) {
        return new Date(
          tms.year,
          tms.month - 1,
          tms.day,
          tms.hour,
          tms.minute
        ).getTime();
      },
      getEventColor(event) {
        return event.color;
      },
      extendBottom(event) {
        console.log("EXTENDING");
        this.createEvent = event;
        this.createStart = event.start;
        this.extendOriginal = event.end;
        // TODO
        // this.saveItineraries();
      },
      mouseMove(tms) {
        const mouse = this.toTime(tms);
        if (this.dragEvent && this.dragTime !== null) {
          const start = this.dragEvent.start;
          const end = this.dragEvent.end;
          const duration = end - start;
          const newStartTime = mouse - this.dragTime;
          const newStart = this.roundTime(newStartTime);
          const newEnd = newStart + duration;

          this.dragEvent.start = newStart;
          this.dragEvent.end = newEnd;
        } else if (this.createEvent && this.createStart !== null) {
          const mouseRounded = this.roundTime(mouse, false);
          const min = Math.min(mouseRounded, this.createStart);
          const max = Math.max(mouseRounded, this.createStart);

          this.createEvent.start = min;
          this.createEvent.end = max;
        }
      },
      startTime(tms, index) {
        const mouse = this.toTime(tms);

        if (this.dragEvent && this.dragTime === null) {
          const start = this.dragEvent.start;

          this.dragTime = mouse - start;
        } else {
          this.createStart = this.roundTime(mouse);
          this.createEvent = {
            name: `Activity #${this.tripDays[this.betweenDates[index]]
              .activities.length + 1}`,
            color: this.rndElement(COLORS),
            start: this.createStart,
            end: this.createStart,
            timed: true,
            links: []
          };
          this.$emit("create-event", { index, event: this.createEvent });
          // this.tripDays.forEach((day, dayIndex) => {
          //   if (index !== dayIndex) day.pop()
          // })
        }
      },
      rnd(a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a;
      },
      rndElement(arr) {
        return arr[this.rnd(0, arr.length - 1)];
      },
      endDrag() {
        this.dragTime = null;
        this.dragEvent = null;
        this.createEvent = null;
        this.createStart = null;
        this.extendOriginal = null;
        // TODO
        // this.saveItineraries();
      },
      cancelDrag(index) {
        if (this.createEvent) {
          if (this.extendOriginal) {
            this.createEvent.end = this.extendOriginal;
          } else {
            const i = this.tripDays[
              this.betweenDates[index]
            ].activities.indexOf(this.createEvent);
            if (i !== -1) {
              this.tripDays[this.betweenDates[index]].activities.splice(i, 1);
            }
          }
        }

        this.createEvent = null;
        this.createStart = null;
        this.dragTime = null;
        this.dragEvent = null;
      }
    },
    computed: {
      weekday() {
        return [0, 1, 2, 3, 4, 5, 6];
      },
      weekdays() {
        return [
          { text: "Sun - Sat", value: [0, 1, 2, 3, 4, 5, 6] },
          { text: "Mon - Sun", value: [1, 2, 3, 4, 5, 6, 0] },
          { text: "Mon - Fri", value: [1, 2, 3, 4, 5] },
          { text: "Mon, Wed, Fri", value: [1, 3, 5] }
        ];
      }
    }
  };
</script>
