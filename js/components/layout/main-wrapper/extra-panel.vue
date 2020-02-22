<template>
  <section id="extra" :class="{ showing: state.showExtraPanel }">
    <div class="tabs">
      <div class="clear" role="tablist">
        <button
          :aria-selected="currentTab === $options.tabs.LYRICS"
          @click.prevent="currentTab = $options.tabs.LYRICS"
          aria-controls="extraPanelLyrics"
          id="extraTabLyrics"
          role="tab"
        >
          Lyrics
        </button>
        <button
          :aria-selected="currentTab === $options.tabs.SONGINFO"
          @click.prevent="currentTab = $options.tabs.SONGINFO"
          aria-controls="extraPanelSongInfo"
          id="extraTabSongInfo"
          role="tab"
        >
          Info
        </button>
        <!-- <button
          :aria-selected="currentTab === $options.tabs.ARTIST"
          @click.prevent="currentTab = $options.tabs.ARTIST"
          aria-controls="extraPanelArtist"
          id="extraTabArtist"
          role="tab"
        >
          Artist
        </button>
        <button
          :aria-selected="currentTab === $options.tabs.ALBUM"
          @click.prevent="currentTab = $options.tabs.ALBUM"
          aria-controls="extraPanelAlbum"
          id="extraTabAlbum"
          role="tab"
        >
          Album
        </button> -->
        <button
          :aria-selected="currentTab === $options.tabs.YOUTUBE"
          @click.prevent="currentTab = $options.tabs.YOUTUBE"
          aria-controls="extraPanelYouTube"
          id="extraTabYouTube"
          role="tab"
          title="YouTube"
          v-if="sharedState.useYouTube"
        >
          <i class="fa fa-youtube-play"></i>
        </button>
        <button class="edit-button" v-if="isAdmin && this.song" @click="openEditForm">
          Edit
        </button>
      </div>

      <div class="panes">
        <div
          aria-labelledby="extraTabLyrics"
          id="extraPanelLyrics"
          role="tabpanel"
          tabindex="0"
          v-show="currentTab === $options.tabs.LYRICS"
        >
          <lyrics-pane :song="song" />
        </div>
        <div
          aria-labelledby="extraTabSongInfo"
          id="extraPanelSongInfo"
          role="tabpanel"
          tabindex="0"
          v-show="currentTab === $options.tabs.SONGINFO"
        >
          <song-info :song="song" />
        </div>
        
        <!-- <div
          aria-labelledby="extraTabArtist"
          id="extraPanelArtist"
          role="tabpanel"
          tabindex="0"
          v-show="currentTab === $options.tabs.ARTIST"
        >
          <artist-info v-if="song.artist.id" :artist="song.artist" mode="sidebar"/>
        </div>

        <div
          aria-labelledby="extraTabAlbum"
          id="extraPanelAlbum"
          role="tabpanel"
          tabindex="0"
          v-show="currentTab === $options.tabs.ALBUM"
        >
          <album-info v-if="song.album.id" :album="song.album" mode="sidebar"/>
        </div> -->

        <div
          aria-labelledby="extraTabYoutube"
          id="extraPanelYoutube"
          role="tabpanel"
          tabindex="0"
          v-show="currentTab === $options.tabs.YOUTUBE"
        >
          <you-tube-video-list v-if="sharedState.useYouTube" :song="song" :youtube="song.youtube"/>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import isMobile from 'ismobilejs'

import { event, $ } from '@/utils'
import { sharedStore, songStore, userStore, preferenceStore as preferences } from '@/stores'
import { songInfo } from '@/services'

const EXTRA_PANEL_TABS = {
  LYRICS: 'LYRICS',
  SONGINFO: 'SONGINFO',
  ARTIST: 'ARTIST',
  ALBUM: 'ALBUM',
  YOUTUBE: 'YOUTUBE'
}

EXTRA_PANEL_TABS.DEFAULT = EXTRA_PANEL_TABS.LYRICS

export default {
  components: {
    SongInfo: () => import('@/components/song/info'),
    LyricsPane: () => import('@/components/ui/lyrics-pane'),
    ArtistInfo: () => import('@/components/artist/info'),
    AlbumInfo: () => import('@/components/album/info'),
    YouTubeVideoList: () => import('@/components/ui/youtube-video-list')
  },

  data: () => ({
    song: null,
    state: preferences.state,
    sharedState: sharedStore.state,
    currentTab: EXTRA_PANEL_TABS.DEFAULT
  }),

  tabs: EXTRA_PANEL_TABS,

  watch: {
    /**
     * Watch the "showExtraPanel" property to add/remove the corresponding class
     * to/from the html tag.
     * Some element's CSS can then be controlled based on this class.
     */
    'state.showExtraPanel': showingExtraPanel => {
      if (showingExtraPanel && !isMobile.any) {
        $.addClass(document.documentElement, 'with-extra-panel')
      } else {
        $.removeClass(document.documentElement, 'with-extra-panel')
      }
    }
  },

  computed: {
    isAdmin: () => userStore.current.is_admin
  },

  mounted: () => {
    // On ready, add 'with-extra-panel' class.
    if (!isMobile.any) {
      $.addClass(document.documentElement, 'with-extra-panel')
    }

    if (isMobile.phone) {
      // On a mobile device, we always hide the panel initially regardless of
      // the saved preference.
      preferences.showExtraPanel = false
    }
  },

  methods: {
    resetState () {
      this.currentTab = EXTRA_PANEL_TABS.DEFAULT
      this.song = songStore.stub
    },

    async fetchSongInfo (song) {
      try {
        this.song = await songInfo.fetch(song)
      } catch (err) {
        this.song = song
      }
    },

    openEditForm () {
      this.song && event.emit(event.$names.MODAL_SHOW_EDIT_SONG_FORM, this.song, 'song')
    }
  },

  created () {
    event.on({
      [event.$names.SONG_PLAYED]: song => this.fetchSongInfo(song)
    })
  }
}
</script>

<style lang="scss">
@import "~#/partials/_vars.scss";

#extra {
  flex: 0 0 $extraPanelWidth;
  padding: 24px 16px;
  background: $colorExtraBgr;
  display: none;
  color: $color2ndText;
  overflow: auto;
  -ms-overflow-style: -ms-autohiding-scrollbar;

  html.touchevents & {
    // Enable scroll with momentum on touch devices
    //overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  &.showing {
    display: block;
  }

 .name {
    margin-bottom: 15px;
  }

  h1 {
    font-weight: $fontWeight_UltraThin;
    font-size: 2rem;
    line-height: 2.8rem;
  }

  .label {
    display: inline;
    //font-weight: bold;
  }

  .album-image {
      padding-top: 100%;
      margin-bottom: 15px;
      background-size: cover;
      background-position: center;
      background-color: #282828;
  }

  .technical-info {
    font-size: 0.9rem;
  }

  .primary-info.borderBottom {
      margin-bottom: 10px;
      padding-bottom: 5px;
  }

  .primary-info.borderBottom {
    border-bottom: solid 1px;
  }

  .primary-info > div {
    margin-bottom: 5px;
  }

  .tabs > div:first-child {
    display: flex;
  }

  .edit-button {
    margin-left: auto;
    align-self: center;
    background: rgba(255, 255, 255, 0.2);
    text-transform: uppercase;
    padding: 0.2rem 0.8rem;
    color: #dcdcdc;
    display: flex;
    align-items: center;
  }

  .edit-button:hover {
    text-decoration: underline;
    background-color: rgba(255, 255, 255, 0.4);
  }

  @media only screen and (max-width : 1024px) {
    position: fixed;
    height: calc(100vh - (#{$headerHeight} + #{$footerHeight}));
    width: $extraPanelWidth;
    z-index: 5;
    top: $headerHeight;
    right: -100%;
    transition: right .3s ease-in;

    .panes {
      padding-bottom: 0;
    }

    &.showing {
      right: 0;
    }
  }

  @media only screen and (max-width : 768px) {
    height: calc(100vh - (#{$headerHeight} + #{$footerHeightMobile}));
  }

  @media only screen and (max-width : 667px) {
    width: 100%;
  }
}
</style>
