<template>
  <div class="download-buttons">
    <span >
      <v-btn @click="download" class="export" elevation="2" text>
        Export PDF
      </v-btn>
      <v-btn @click="deleteItinerary">
        Delete
      </v-btn>
    </span>
  </div>
</template>
<script>
import { jsPDF } from 'jspdf';

export default {
  name: 'DownloadButtons',
  props: {
    name: {
      type: String
    },
    displayDates: {
      type: String
    },
    sortedEvents: {
      type: Array,
      default: () => ([])
    },
    betweenDates: {
      type: Array,
      default: () => ([])
    }
  },
  methods: {
    deleteItinerary() {
      this.$emit('delete-itinerary')
    },
      download () {
        var doc = new jsPDF();

        doc.setFontSize(30);
        doc.text(`${this.name}`, 20, 30);
        doc.setFontSize(16);
        doc.text(`${this.displayDates}`, 20, 40);
        let offset = 40;
        let page = 1;

        this.sortedEvents.filter(ev => ev).forEach((event, index) => {
          if (offset >= page * 250) {
            doc.addPage();
            offset = 10;
          }
          doc.setFontSize(22);
          doc.text(`${this.betweenDates[index].toDateString()}`, 20, 20 + offset);
          event.forEach(activity => {
            doc.setFontSize(16);
            doc.text(new Date(activity.start).toLocaleTimeString(), 60, 30 + offset, {
                align: 'right',
            });
            doc.text(activity.name, 70, 30 + offset);
            doc.setFontSize(10);
            if (activity.description) doc.text(activity.description, 70, 35 + offset);
            offset += 15;
          })
          offset += 20;
        });

        doc.save(`${this.name} itinerary.pdf`);
      },
  }
}
</script>