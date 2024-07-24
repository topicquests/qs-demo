<template>
  <div>
    <q-form>
      <q-input
        square
        clearable
        filled
        type="email"
        name="email"
        label="Email"
        tabindex="1"
      >
      <template v-slot:prepend>
        <q-icon name="email" tabindex="-1" />
      </template>
    </q-input>

    <q-input
      square
      clearable
      filled
      type="text"
      label="Name"
      name="name"
      tabindex="2"
    >
      <template v-slot:prepend>
        <q-icon name="person" tabindex="-1" />
      </template>
    </q-input>
    <q-input
      square
      clearable
      filled
      type="text"
      name="handle"
      label="Handle"
      tabindex="3"
    >
    <template v-slot:prepend>
      <q-icon name="person" tabindex="-1" />
    </template>
  </q-input>
</q-form>
  </div>

</template>
