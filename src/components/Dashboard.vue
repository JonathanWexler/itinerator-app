<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <SaveStatus
          :last-saved="lastSaved"
          :loading="saving"
          :offline="!online"
          :can-save="!!changedTrips.size"
          @save="postItineraries"
        />
        <trips-buttons
          :itineraries="allItineraries"
          :selected="activeButtonKey"
          @button-select="selectItinerary"
        />
        <download-buttons
          v-if="this.selectedDates.length && this.sortedActivities.length"
          :name="currentTrip.name"
          :sorted-activities="sortedActivities"
          :between-dates="betweenDates"
          :display-dates="displayDates"
          @delete-itinerary="deleteItinerary"
        />
      </v-col>
      <v-col class="left-col" cols="12" md="3">
        <section class="panel-container" v-if="currentTrip.selected">
          <section class="activity-cal" v-if="!currentActivity.key">
            <tab-bar v-if="activeButtonKey" @tab-click="updateTab" />
            <trip-calendar
              v-if="tab === 0"
              @disable-modify-date="disableModifyDate"
              @emit-dates="emitDates"
              @save-modified-dates="saveModifiedDates"
              :selected-dates="selectedDates"
              :active-button-key="activeButtonKey"
              :has-dates="hasDates"
              :disabled-modify-date-checkbox="disabledModifyDateCheckbox"
            />
            <activity-panel
              v-else
              @show-event="showEvent"
              :activities="sortedActivities.flat()"
            />
          </section>
          <section class="activity-edit" v-else>
            <form v-if="editActivityToggle">
              <v-text-field
                v-model="currentActivity.name"
                :counter="30"
                label="Activity Name"
                required
              ></v-text-field>
              <v-textarea
                v-model="currentActivity.description"
                :counter="200"
                label="Activity Details"
              ></v-textarea>
              <section class="time-picker">
                <div>
                  Start Time:
                  <VueTimepicker
                    format="HH:mm A"
                    v-model="selectedActivity.start"
                  />
                  <br />
                </div>
                <div>
                  End Time:
                  <VueTimepicker
                    format="HH:mm A"
                    v-model="selectedActivity.end"
                  />
                </div>
              </section>
              <div class="time-edit-message">
                {{ timeEditMessage }}
              </div>
              <div v-for="(link, index) in currentActivity.links" :key="index">
                <v-text-field
                  v-model="link.value"
                  label="Activity Link"
                ></v-text-field>
              </div>
              <button @click="addLink">
                Add Link
              </button>
              <v-checkbox
                v-model="currentActivity.highlight"
                label="Highlight"
              ></v-checkbox>
              <v-btn
                class="mr-4"
                :disabled="timeEditMessage"
                @click="saveItinerary"
              >
                Save
              </v-btn>
              <!-- <v-btn @click="toggleEdit(false)">
              Close
            </v-btn> -->
              <v-btn @click="deleteEvent">
                Delete
              </v-btn>
            </form>
            <activity-card
              class="activity-edit"
              v-else
              :name="currentActivity.name"
              :description="currentActivity.description"
              :start="currentActivity.start"
              :end="currentActivity.end"
              :links="currentActivity.links"
              :highlight="currentActivity.highlight"
              :image-url="currentActivity.imageUrl"
              @edit="toggleEdit(true)"
              @close="closeEvent"
            />
          </section>
        </section>
      </v-col>
      <v-col class="main-panel" cols="12" offset-md="1" md="8">
        <v-row justify="center" v-if="currentTrip.selected">
          <v-col>
            <h2>{{ displayDates }}</h2>
            <v-text-field
              label="Trip Name"
              v-model="currentTrip.name"
              @change="nameChange"
            ></v-text-field>
          </v-col>
        </v-row>
        <trip-agenda
          :between-dates="betweenDates"
          :trip-days="currentTrip.tripDays"
          :selected="currentActivity"
          @select-activity="viewDay"
          @select-event="showEvent"
          @save-event="saveItineraries"
          @create-event="createTripEvent"
          @update-event="updateTripEvent"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  // import FlashMessage from '@smartweb/vue-flash-message';
  import ActivityCard from "./ActivityCard";
  import TabBar from "./leftPanel/TabBar";
  import TripCalendar from "./leftPanel/TripCalendar";
  import TripAgenda from "./middlePanel/TripAgenda";
  import ActivityPanel from "./leftPanel/ActivityPanel";
  import SaveStatus from "./SaveStatus";
  import TripsButtons from "./TripsButtons";
  import DownloadButtons from "./DownloadButtons";
  import VueTimepicker from "vue2-timepicker/src/vue-timepicker.vue";
  import axios from "axios";

  // const names = [
  //   "Meeting",
  //   "Holiday",
  //   "PTO",
  //   "Travel",
  //   "Event",
  //   "Birthday",
  //   "Conference",
  //   "Party"
  // ];
  export default {
    name: "Dashboard",
    components: {
      ActivityPanel,
      TripsButtons,
      TripAgenda,
      TabBar,
      TripCalendar,
      DownloadButtons,
      SaveStatus,
      VueTimepicker,
      ActivityCard
    },
    props: {
      auth: String
    },
    watch: {
      auth(newAuth) {
        this.authorization = newAuth;
      }
    },

    data: () => ({
      // Current Trip is the one on the active screen
      // Contains, name, key, dates, basically one itinerary
      currentTrip: {
        name: null,
        selected: false,
        dates: null,
        betweenDates: null,
        tripDays: {}
      },
      // These are the trips modified since last check
      changedTrips: new Set(),
      // Date since last change
      lastChanged: null,
      // If connected to network
      online: true,
      disabledModifyDateCheckbox: false,
      // Login auth from google
      authorization: null,
      editActivityToggle: false,
      selectedActivity: {
        day: null,
        start: {
          HH: "",
          mm: ""
        },
        end: {
          HH: "",
          mm: ""
        }
      },
      saving: false,
      lastSaved: null,
      user: {},
      tab: 0,
      itineraries: {},
      activeButtonKey: null
    }),
    async mounted() {
      this.setSaveInterval();
      // TODO: Fetch from DB
      this.online = this.networkConnected();
      if (localStorage.getItem("itinerator-clear") !== "v2") {
        localStorage.setItem("itinerator", "{}");
        localStorage.setItem("itinerator-clear", "v2");
        this.$cookies.remove("itinerator-token");
      }
      this.authorization = this.$cookies.get("itinerator-token");
      this.setItineraries();
      this.$root.$on("login", data => {
        this.user = data;
      });
      // if (this.online) await this.getTripDays()
    },
    computed: {
      currentActivity() {
        if (
          !this.currentTrip.key ||
          !this.selectedActivity.day ||
          !this.currentTrip.tripDays[this.selectedActivity.day]
        )
          return {};
        return (
          this.currentTrip.tripDays[this.selectedActivity.day].activities.find(
            activity => {
              return activity.key === this.selectedActivity.key;
            }
          ) || {}
        );
      },
      betweenDates() {
        if (!this.selectedDates.length) return [];
        return this.getBetweenDates(this.selectedDates);
      },
      hasDates() {
        return this.selectedDates.length > 0 && !!this.displayDates;
      },
      timeEditMessage() {
        let message = null;
        if (
          this.selectedActivity.start.HH > this.selectedActivity.end.HH ||
          (this.selectedActivity.start.HH === this.selectedActivity.end.HH &&
            this.selectedActivity.start.mm > this.selectedActivity.end.mm)
        ) {
          message = "Please update your time interval.";
        }
        return message;
      },
      activitiesMap() {
        if (!Object.keys(this.currentTrip.tripDays).length) return [];
        const map = {};
        for (let { key, activities } of this.currentTrip.tripDays) {
          for (let activity of activities) {
            map[activity.key] = { ...activity, parent: key };
          }
        }
        return map;
      },
      sortedActivities() {
        if (!Object.keys(this.currentTrip.tripDays).length) return [];
        return this.betweenDates.map(date => {
          return this.currentTrip.tripDays[date].activities.sort((a, b) => {
            return a.start - b.start;
          });
        });
      },
      betweenDatesMap() {
        return this.betweenDates.map(d => d.toISOString().split("T")[0]);
      },
      today() {
        const today = new Date().toISOString().split("T")[0];
        return today;
      },
      cal() {
        this.$nextTick();
        window.refs = this.$refs;
        const todayBetween = this.betweenDatesMap.indexOf(this.today);
        return this.$refs[`calendar-${todayBetween}`];
      },
      allItineraries() {
        return Object.entries(this.itineraries).map(([key, v]) => {
          return { ...v, key };
        });
      },
      displayDates() {
        return this.formatDates(this.selectedDates);
      },
      stringifiedDates() {
        return this.selectedDates.join("_");
      },
      selectedDates() {
        if (!this.currentTrip.dates || !this.currentTrip.dates.length)
          return [];
        const dates = this.currentTrip.dates;
        if (dates.length === 1) dates.push[dates[0]];
        return dates;
      }
    },
    methods: {
      updateTripEvent({ index, event }) {
        if (event.key) return;
        this.currentTrip.tripDays[this.betweenDates[index]].activities.forEach(
          activity => {
            if (activity.name === event.name) {
              activity.start = event.start;
              activity.end = event.end;
            }
          }
        );
        this.saveItineraries();
      },
      createTripEvent({ index, event }) {
        this.currentTrip.tripDays[this.betweenDates[index]].activities.push({
          ...event,
          key: `${Date.now()}`
        });
        this.saveItineraries();
      },
      // Set the interval to save to DB every 1 minute
      setSaveInterval() {
        setInterval(() => {
          if (this.changedTrips.length) {
            // await this.postItineraries();
          }
        }, 60000);
      },
      // Change flag to disable calendar
      disableModifyDate(value) {
        this.disabledModifyDateCheckbox = value;
      },
      // Update which tab is selected
      updateTab(tab) {
        this.tab = tab;
      },
      // Update modified calendar trip dates
      async saveModifiedDates(newDates) {
        this.disabledModifyDateCheckbox = !this.disabledModifyDateCheckbox;
        const newActiveButtonKey = newDates.join("_");
        const tempActiveButtonKey = this.currentTrip.stringifiedDates;

        if (tempActiveButtonKey !== newActiveButtonKey) {
          const newTripDays = this.betweenDates.reduce((accum, day) => {
            accum[day] = this.currentTrip.tripDays[day];
            return accum;
          }, {});
          this.$set(this.currentTrip, "tripDays", newTripDays);
        }
        this.saveItineraries();
      },
      addLink(event) {
        event.preventDefault();
        if (!this.currentActivity.links) this.currentActivity.links = [];
        this.currentActivity.links.push({ value: "" });
      },
      toggleEdit(value) {
        this.editActivityToggle = !!value;
      },
      updateEventTimes() {
        const start = new Date(this.currentActivity.start);
        const end = new Date(this.currentActivity.end);
        start.setHours(this.selectedActivity.start.HH);
        start.setMinutes(this.selectedActivity.start.mm);
        end.setHours(this.selectedActivity.end.HH);
        end.setMinutes(this.selectedActivity.end.mm);

        this.currentActivity.start = start.getTime();
        this.currentActivity.end = end.getTime();
      },
      saveItinerary() {
        this.updateEventTimes();
        this.saveItineraries();
        this.toggleEdit(false);
      },
      async deleteItinerary(targetKey) {
        const key = targetKey || this.activeButtonKey;
        delete this.itineraries[key];
        this.clearActive();
        this.disabledModifyDateCheckbox = false;
        await this.saveItineraries();
      },
      closeEvent() {
        this.selectedActivity = {
          key: null,
          day: null,
          start: {
            HH: "",
            mm: ""
          },
          end: {
            HH: "",
            mm: ""
          }
        };
      },

      deleteEvent() {
        const activityIndex = this.currentTrip.tripDays[
          this.selectedActivity.day
        ].activities.indexOf(this.currentActivity);
        this.currentTrip.tripDays[this.selectedActivity.day].activities.splice(
          activityIndex,
          1
        );
        this.closeEvent();
      },
      showDate(event, index, parentKey) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        this.selectedActivity.key = event.key;
        this.selectedActivity.day = parentKey;
        this.selectedActivity.start.HH = (
          "0" + start.getHours().toString()
        ).slice(-2);
        this.selectedActivity.start.mm = (
          "0" + start.getMinutes().toString()
        ).slice(-2);
        this.selectedActivity.end.HH = ("0" + end.getHours().toString()).slice(
          -2
        );
        this.selectedActivity.end.mm = (
          "0" + end.getMinutes().toString()
        ).slice(-2);
      },
      showEvent({ event, index, day }) {
        this.showDate(event, index, day);
      },
      viewDay({ date }) {
        console.log("date", date);
        this.calendar.type = "day";
      },
      formatDates([first, second]) {
        const [date1, date2] = [
          new Date(first + " GMT-0500"),
          new Date(second + " GMT-0500")
        ];
        if (!first && !second) return "Select Dates";
        else if (!second || first == second) return date1.toDateString();
        return `${date1.toDateString()} to ${date2.toDateString()}`;
      },
      clearActive() {
        this.activeButtonKey = null;
        Object.keys(this.currentTrip).forEach(key => {
          this.$set(this.currentTrip, key, null);
        });
      },
      selectItinerary(key) {
        this.clearActive();
        this.currentTrip.selected = true;
        if (!key || key === "new") {
          return;
        }
        this.activeButtonKey = key;
        const itinerary = this.itineraries[this.activeButtonKey];
        Object.keys(itinerary).forEach(k => {
          this.$set(this.currentTrip, k, itinerary[k]);
        });
        this.$set(
          this.currentTrip,
          "dates",
          this.currentTrip.stringifiedDates.split("_")
        );

        if (this.hasDates) this.disabledModifyDateCheckbox = true;
      },
      changeDaysToActivities(itineraries) {
        if (!itineraries || Object.keys(itineraries).length === 0) return {};
        Object.keys(itineraries).forEach(itinkey => {
          const itinerary = itineraries[itinkey];
          Object.keys(itinerary.tripDays).forEach(eventKey => {
            const event = itinerary.tripDays[eventKey];
            if (event.days) {
              event.activities = event.days;
              event.days = null;
            }
          });
        });
        return itineraries;
      },
      setItineraries() {
        // TODO: Fetch from DB? But not priority
        let local = localStorage.getItem("itinerator") || "{}";
        const localValue = JSON.parse(local);
        this.itineraries = this.changeDaysToActivities(localValue);
      },
      async getItineraries() {
        // const URI = "https://itinerator-api.herokuapp.com";
        // const URI = 'http://localhost:3000'
        // const serverRes = await axios.get(`${URI}/users/fetch`, {
        //   headers: {
        //     Authorization: this.authorization
        //   }
        // });
      },
      networkConnected() {
        return navigator.onLine;
      },
      clearAuthorization() {
        this.$cookies.remove("itinerator-token");
        this.authorization = null;
      },
      async postItineraries() {
        console.log(
          "Posting Itineraries",
          this.networkConnected(),
          this.authorization
        );
        this.online = this.networkConnected();
        if (!this.online || !this.authorization) {
          console.log("Not online, no authorization");
        }
        this.saving = true;
        const savingItineraries = {};
        for (let key of this.changedTrips) {
          savingItineraries[key] = this.itineraries[key];
        }
        console.log("itineraries check", savingItineraries);
        let URI = "https://itinerator-api.herokuapp.com";
        if (process.env.NODE_ENV === "development") {
          URI = "http://localhost:3000";
        }
        const serverRes = await axios.post(
          `${URI}/users/save`,
          {
            itineraries: savingItineraries,
            link: (this.currentActivity || {})?.links
          },
          {
            headers: {
              Authorization: this.authorization,
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
        if (serverRes.status === 401) {
          this.clearAuthorization();
          return;
        }
        this.changedTrips = new Set();
        this.saving = false;
        this.lastSaved = Date.now();
        Object.keys(serverRes.data.itineraries).forEach(key => {
          const itinerary = serverRes.data.itineraries[key];
          this.itineraries[key] = itinerary;
          Object.keys(itinerary).forEach(k => {
            this.$set(this.currentTrip, k, itinerary[k]);
          });
        });
        this.$set(this.currentActivity, "imageUrl", serverRes.data.image);
        this.saveItineraries();
      },
      async saveItineraries() {
        if (this.stringifiedDates) {
          if (!this.currentTrip.key) {
            const key = `${Date.now()}`;
            this.currentTrip.key = key;
          }
          this.changedTrips.add(this.currentTrip.key);
          this.itineraries[this.currentTrip.key] = {
            ...this.itineraries[this.currentTrip.key],
            key: this.currentTrip.key,
            stringifiedDates: this.stringifiedDates,
            name: this.currentTrip.name,
            tripDays: this.currentTrip.tripDays
          };
        }
        localStorage.setItem("itinerator", JSON.stringify(this.itineraries));
        this.selectItinerary(this.currentTrip.key);
        this.setItineraries();
      },
      slashDate(date) {
        return date.split("-").join("/");
      },
      getBetweenDates([startDate, endDate]) {
        startDate = new Date(this.slashDate(startDate));
        endDate = new Date(this.slashDate(endDate));
        const dates = [];
        let currentDate = startDate;
        const addDays = function(days) {
          const date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
        while (currentDate <= endDate) {
          dates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }
        return dates;
      },
      nameChange() {
        // TODO: don't save on name change?
        // OR check if this is a new key and save?
        this.saveItineraries();
      },
      emitDates(dates) {
        this.currentTrip.dates = dates;
        const newTripdays = this.betweenDates.reduce((accum, date) => {
          accum[date] = { activities: [] };
          return accum;
        }, {});
        this.currentTrip.tripDays = {
          ...newTripdays,
          ...this.currentTrip.tripDays
        };
      },
      base64DecodeUrl(str) {
        str = (str + "===").slice(0, str.length + (str.length % 4));
        return str.replace(/-/g, "+").replace(/_/g, "/");
      },
      base64EncodeUrl(str) {
        /* eslint-disable no-useless-escape */
        return str
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/\=+$/, "");
      }
    }
  };
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
      content: "";
      position: absolute;
      background-color: #ea4335;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: -5px;
      margin-left: -6.5px;
    }
  }

  .activity-edit {
    overflow-y: auto;
    padding-bottom: 5px;
    margin-bottom: 25px;
    margin-right: 15px;
    padding-bottom: 20px;
  }

  .activity-cal {
    width: 300px;
    position: fixed;
    top: 150px;
    padding: 5px;
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
      content: "";
    }

    &:hover::after {
      display: block;
    }
  }

  .time-edit-message {
    color: rgba(150, 5, 5, 0.747);
  }
  .activity-on-cal {
    border: 1px solid yellow;
  }
  .panel-container {
    top: 245px;
    bottom: 0;
    position: fixed;
    overflow-y: scroll;
    overflow-x: hidden;
    max-width: 25%;
  }
  .main-panel {
    background: white;
    z-index: 3;
  }
</style>
