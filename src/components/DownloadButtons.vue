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
            const startTime = new Date(activity.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            const endTime = new Date(activity.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            doc.setFontSize(16);
            doc.text(`${startTime} - ${endTime}`, 80, 30 + offset, {
                align: 'right',
            });
            doc.text(activity.name, 90, 30 + offset);
            doc.setFontSize(10);
            let buffer = 5;
            const lineLength = 70;
            if (activity.description) {
              let description = activity.description
              while (description.length > lineLength) {
                let line = description.slice(0, lineLength);
                if (![line[line.length-1], description.slice(lineLength, lineLength + 1)].includes(' ')) line += '-'
                doc.text(line , 90, 30 + buffer + offset);
                description = description.slice(lineLength)
                buffer += 5;
              }
              doc.text(description, 90, 30 + buffer + offset);
            }
            offset += (15 + buffer);
          })
          offset += 20;
        });

        doc.save(`${this.name} itinerary.pdf`);
      },
  }
}
</script>