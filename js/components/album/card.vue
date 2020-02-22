<template>
  <article
    :title="`${album.name} by ${album.artist.name}`"
    @dragstart="dragStart"
    @contextmenu.prevent="openContextMenu"
    class="item"
    draggable="true"
    tabindex="0"
    v-if="album.songs.length"
  >
    <span class="thumbnail-wrapper">
      <album-thumbnail :entity="album" :backgroundImageUrl="album.cover" />
    </span>

    <footer>
      <div class="info">
        <a class="name" :href="`#!/album/${album.id}`">{{ album.name }}</a>
        <span class="sep">by</span>
        <a class="artist" v-if="isNormalArtist" :href="`#!/artist/${album.artist.id}`">{{ album.artist.name }}</a>
        <span class="artist nope" v-else>{{ album.artist.name }}</span>
      </div>
      <p class="meta">
        <span class="left">
          {{ album.year ? album.year + ' •' : '' }}
          {{ album.songs.length | pluralize('song') }}
          •
          {{ fmtLength }}
          •
          {{ album.playCount | pluralize('play') }}
        </span>
        <span class="right">
          <a
            :title="`Shuffle all songs in the album ${album.name}`"
            @click.prevent="shuffle"
            class="shuffle-album"
            href
            role="button"
          >
            <i class="fa fa-random"></i>
          </a>
          <a
            :title="`Download all songs in the album ${album.name}`"
            @click.prevent="download"
            class="download-album"
            href
            role="button"
            v-if="sharedState.allowDownload"
          >
            <i class="fa fa-download"></i>
          </a>
        </span>
      </p>
    </footer>
    <context-menu ref="contextMenu" :songs="album.songs" :type="'album'"/>
  </article>
</template>

<script>
import { dragTypes } from '@/config'
import { pluralize, startDragging } from '@/utils'
import { artistStore, sharedStore } from '@/stores'
import { playback, download } from '@/services'
import albumAttributes from '@/mixins/album-attributes'

export default {
  components: {
    AlbumThumbnail: () => import('@/components/ui/album-artist-thumbnail'),
    ContextMenu: () => import('@/components/song/context-menu')
  },

  props: {
    album: {
      type: Object,
      required: true
    }
  },

  filters: { pluralize },
  mixins: [albumAttributes],

  data: () => ({
    sharedState: sharedStore.state
  }),

  computed: {
    isNormalArtist () {
      return !artistStore.isVariousArtists(this.album.artist) &&
        !artistStore.isUnknownArtist(this.album.artist)
    }
  },

  methods: {
    shuffle () {
      playback.playAllInAlbum(this.album, true /* shuffled */)
    },

    download () {
      download.fromAlbum(this.album)
    },

    dragStart (event) {
      startDragging(event, this.album, dragTypes.ALBUM)
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

.sep {
  display: none;
  color: $color2ndText;

  .as-list & {
    display: inline;
  }
}

@include artist-album-card();
</style>
