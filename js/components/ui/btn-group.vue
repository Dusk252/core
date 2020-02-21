<template>
  <span class="btn-group" v-bind="$attrs">
    <slot>
      <btn green>Foo</btn>
      <btn highlight>Bar</btn>
      <btn red>Baz</btn>
    </slot>
  </span>
</template>

<script>
export default {
  components: {
    Btn: () => import('@/components/ui/btn')
  }
}
</script>

<style lang="scss" scoped>
.btn-group {
  display: flex;
  position: relative;
  justify-content: flex-end;

  button {
    display: inline-block;
    font-size: .92rem;
    height: 28px;
    padding: 0 1.1rem;
    line-height: 28px;
    text-transform: uppercase;
    margin-right: 1px;
    //border-radius: 14px 0 0 14px;

    &:not(:first-child) {
      border-radius: 0;
    }

    &:first-of-type {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-top-left-radius: 9999px;
      border-bottom-left-radius: 9999px;
    }

    &:last-of-type {
      border-top-right-radius: 9999px;
      border-bottom-right-radius: 9999px;
      margin-right: 0;
    }
  }

  &[uppercased] button {
    text-transform: uppercase;
  }
}
</style>
