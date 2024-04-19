<template>
  <time :title="refTimeFull">{{ display }}</time>
</template>

<script setup lang="ts">
import { QuestData } from '../types';
import { DateTime } from 'luxon';
import { computed, onMounted } from 'vue';

const QuestDateTimeIntervalProps = defineProps<{
  quest: QuestData;
}>();

let now = DateTime.now();
const start: DateTime = DateTime.fromISO(
  QuestDateTimeIntervalProps.quest.start,
);
const end: DateTime = DateTime.fromISO(QuestDateTimeIntervalProps.quest.end);

const refTime = computed<DateTime>({
  get() {
    if (start > now) return start;
    else return end;
  },
  set() {},
});

const display = computed<string>({
  get() {
    let prefix: string = '';
    if (now < start) prefix = 'starting ';
    else if (now > end) prefix = 'ended ';
    else prefix = 'ending ';
    return prefix + refTime.value.toRelative();
  },
  set() {},
});

const refTimeFull = computed<string>({
  get() {
    return refTime.value.toLocaleString(DateTime.DATETIME_FULL);
  },
  set() {},
});

onMounted(() => {
  setInterval(() => {
    now = DateTime.local();
  }, 1000);
});
</script>
