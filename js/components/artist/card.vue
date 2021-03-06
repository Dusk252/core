<template>
  <article
    :title="artist.name"
    @dragstart="dragStart"
    @contextmenu.prevent="openContextMenu"
    class="item"
    draggable="true"
    tabindex="0"
    v-if="showing"
  >
    <span class="thumbnail-wrapper">
      <artist-thumbnail :entity="artist" :backgroundImageUrl="image" />
    </span>

    <footer>
      <div class="info">
        <a class="name" :href="`#!/artist/${artist.id}`">
          {{ artist.name }}
        </a>
      </div>
      <p class="meta">
        <span class="left">
          {{ artist.albums.length | pluralize('album') }}
          •
          {{ artist.songs.length | pluralize('song') }}
          •
          {{ artist.playCount | pluralize('play') }}
        </span>
        <span class="right">
          <a
            :title="`Shuffle all songs by ${artist.name}`"
            @click.prevent="shuffle"
            class="shuffle-artist"
            href
            role="button"
          >
            <i class="fa fa-random"></i>
          </a>
          <a
            :title="`Download all songs by ${artist.name}`"
            @click.prevent="download"
            class="download-artist"
            href
            role="button"
            v-if="sharedState.allowDownload"
          >
            <i class="fa fa-download"></i>
          </a>
        </span>
      </p>
    </footer>
    <context-menu ref="contextMenu" :songs="artist.songs" :type="'artist'"/>
  </article>
</template>

<script>
import { dragTypes } from '@/config'
import { startDragging, pluralize } from '@/utils'
import { artistStore, sharedStore } from '@/stores'
import { playback, download } from '@/services'
import artistAttributes from '@/mixins/artist-attributes'

export default {
  props: {
    artist: {
      type: Object,
      required: true
    }
  },

  components: {
    ArtistThumbnail: () => import('@/components/ui/album-artist-thumbnail'),
    ContextMenu: () => import('@/components/song/context-menu')
  },

  filters: { pluralize },
  mixins: [artistAttributes],

  data: () => ({
    sharedState: sharedStore.state
  }),

  computed: {
    /**
     * Determine if the artist item should be shown.
     * We're not showing those without any songs, or the special "Various Artists".
     *
     * @return {Boolean}
     */
    showing () {
      return this.artist.songs.length && !artistStore.isVariousArtists(this.artist)
    }
  },

  methods: {
    shuffle () {
      playback.playAllByArtist(this.artist, true /* shuffled */)
    },

    download () {
      download.fromArtist(this.artist)
    },

    dragStart (event) {
      startDragging(event, this.artist, dragTypes.ARTIST)
    },

    openContextMenu (event) {
      this.$nextTick(() => this.$refs.contextMenu.open(event.pageY, event.pageX))
    }
  }
}
</script>

<style lang="scss">
@import "~#/partials/_vars.scss";
@import "~#/partials/_mixins.scss";

@include artist-album-card();
</style>
