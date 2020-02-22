/**
 * Add a "infinite scroll" functionality to any component using this mixin.
 * Such a component should have a `scrolling` method bound to `scroll` event on
 * the wrapper element: @scroll="scrolling"
 */
export default {
  components: {
    ToTopButton: () => import('@/components/ui/to-top-button')
  },

  data: () => ({
    numOfItems: 30,
    perPage: 30
  }),

  methods: {
    scrolling ({ target: { scrollTop, clientHeight, scrollHeight }}) {
      // Here we check if the user has scrolled to the end of the wrapper (or 32px to the end).
      // If that's true, load more items.
      if (scrollTop + clientHeight >= scrollHeight - 32) {
        this.displayMore()
      }
    },

    displayMore () {
      this.numOfItems += this.perPage
    },

    makeScrollable (container, totalItemCount) {
      if (container.clientHeight > 0 && container.scrollHeight <= container.clientHeight && this.numOfItems < totalItemCount) {
        // we can't use $nextTick here because it's instant and scrollHeight wouldn't have been udpated.
        window.setTimeout(() => {
          this.displayMore()
          this.makeScrollable(container, totalItemCount)
        }, 350)
      }
    }
  }
}
