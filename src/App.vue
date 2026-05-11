<script setup lang="ts">
import DatePicker from './components/DatePicker.vue';

</script>

<template>
  <main>
    <h1>Headless datepicker</h1>
    <DatePicker />
  </main>
</template>

<style scoped>
main {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
