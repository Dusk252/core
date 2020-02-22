<template>
  <div class="edit-song">
    <sound-bar v-if="loading"/>
    <form v-else @submit.prevent="submit">
      <header>
        <img :src="coverUrl" width="96" height="96">
        <hgroup class="meta">
          <h1 :class="{ mixed: !editingOnlyOneSong }">{{ displayedTitle }}</h1>
          <h2 :class="{ mixed: !allSongsAreFromSameArtist && !formData.artistName }">{{ displayedArtistName }}</h2>
          <h2 :class="{ mixed: !allSongsAreInSameAlbum && !formData.albumName }">{{ displayedAlbumName }}</h2>
        </hgroup>
      </header>

      <div>
        <div class="tabs tabs-white">
          <div class="clear" role="tablist">
            <button
              :aria-selected="currentView === 'details'"
              @click.prevent="currentView = 'details'"
              aria-controls="editSongPanelDetails"
              id="editSongTabDetails"
              role="tab"
            >
              Details
            </button>
            <button
              :aria-selected="currentView === 'info'"
              @click.prevent="currentView = 'info'"
              aria-controls="editSongPanelInfo"
              id="editSongTabInfo"
              role="tab"
              v-if="type !== 'artist'"
            >
              More Info
            </button>
            <button
              @click.prevent="currentView = 'lyrics'"
              v-if="editingOnlyOneSong"
              :aria-selected="currentView === 'lyrics'"
              aria-controls="editSongPanelLyrics"
              id="editSongTabLyrics"
              role="tab"
            >
              Lyrics
            </button>
          </div>

          <div class="panes">
            <div
              aria-labelledby="editSongTabDetails"
              id="editSongPanelDetails"
              role="tabpanel"
              tabindex="0"
              v-show="currentView === 'details'"
            >
              <div class="form-row" v-if="editingOnlyOneSong">
                <label>Title</label>
                <div class="form-row-inner">
                  <input title="Title" name="title" type="text" v-model="formData.title.value">
                </div>
              </div>

              <div class="form-row">
                <label>Artist</label>
                <div class="form-row-inner">
                  <input name="artistName" type="text" v-model="formData.artistName.value"
                    :placeholder="getPlaceholder(allSongsAreFromSameArtist, formData.artistName.edit)" @keydown="contentModified">
                  <input type="checkbox" v-model="formData.artistName.edit" v-if="!editingOnlyOneSong" />
                </div>
              </div>

              <div class="form-row" v-if="type !== 'artist'"> 
                <label>Album</label>
                <div class="form-row-inner">
                    <input name="albumName" type="text" v-model="formData.albumName.value"
                      :placeholder="getPlaceholder(allSongsAreInSameAlbum, formData.albumName.edit)" @keydown="contentModified">
                    <input type="checkbox" v-model="formData.albumName.edit" v-if="!editingOnlyOneSong" />
                </div>
              </div>

              <div class="form-row" v-if="type === 'album'">
                <label>Album Cover</label>
                <div class="form-row-inner">
                    <input name="albumCover" type="text" v-model="formData.albumCover.value"
                      placeholder="Leave empty for no changes" @keydown="contentModified">
                </div>
              </div>

              <div class="form-row" v-if="type !== 'artist'">
                <label class="small">
                  <input type="checkbox" @change="changeCompilationState" ref="compilationStateChk" />
                  Album is a compilation of songs by various artists
                </label>
              </div>

              <div :class="{'half' : editingOnlyOneSong}" v-if="type !== 'artist'">
                <div class="form-row">
                  <label>Disc</label>
                  <div class="form-row-inner">
                    <input name="disc" type="text" pattern="\d*" v-model="formData.disc.value"
                    title="Empty or a number" :placeholder="getPlaceholder(allSongsAreInSameDisc, formData.disc.edit)" @keydown="contentModified">
                    <input type="checkbox" v-model="formData.disc.edit" v-if="!editingOnlyOneSong" />
                  </div>
                </div>

                <div class="form-row" v-show="editingOnlyOneSong">
                  <label>Track</label>
                  <div class="form-row-inner">
                    <input name="track" type="text" pattern="\d*" v-model="formData.track.value"
                    title="Empty or a number">
                  </div>
                </div>
              </div>
            </div>

            <div
              aria-labelledby="editSongTabInfo"
              id="editSongPanelInfo"
              role="tabpanel"
              tabindex="0"
              v-show="currentView === 'info'"
              v-if="type !== 'artist'"
            >
              <div class="form-row">
                <label>Year</label>
                <div class="form-row-inner">
                  <input name="year" type="text" pattern="\d*" v-model="formData.year.value"
                  title="Empty or a number" :placeholder="getPlaceholder(allSongsHaveSameYear, formData.year.edit)" @keydown="contentModified">
                  <input type="checkbox" v-model="formData.year.edit" v-if="!editingOnlyOneSong" />
                </div>
              </div>

              <div class="form-row">
                <label>Composer</label>
                <div class="form-row-inner">
                  <input name="composer" type="text" v-model="formData.composer.value" :placeholder="getPlaceholder(allSongsHaveSameComposer, formData.composer.edit)" @keydown="contentModified">
                  <input type="checkbox" v-model="formData.composer.edit" v-if="!editingOnlyOneSong" />
                </div>
              </div>

              <div class="form-row">
                <label>Genre</label>
                <div class="form-row-inner">
                  <input name="genre" type="text" v-model="formData.genre.value" :placeholder="getPlaceholder(allSongsHaveSameGenre, formData.genre.edit)" @keydown="contentModified">
                  <input type="checkbox" v-model="formData.genre.edit" v-if="!editingOnlyOneSong" />
                </div>
              </div>

              <div class="form-row" v-if="editingOnlyOneSong">
                <label>Comments</label>
                <textarea class="comments" title="comments" name="comments" v-model="formData.comments.value"></textarea>
              </div>
            </div>

            <div
              aria-labelledby="editSongTabLyrics"
              id="editSongPanelLyrics"
              role="tabpanel"
              tabindex="0"
              v-if="editingOnlyOneSong"
              v-show="currentView === 'lyrics'"
            >
              <div class="form-row">
                <textarea title="Lyrics" name="lyrics" v-model="formData.lyrics.value"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <btn type="submit">Update</btn>
        <btn @click.prevent="close" class="btn-cancel" white>Cancel</btn>
      </footer>
    </form>
  </div>
</template>

<script>
import { union } from 'lodash'

import { br2nl, event } from '@/utils'
import { songInfo } from '@/services/info'
import { artistStore, albumStore, songStore } from '@/stores'
import { getDefaultCover } from '@/utils'
import { isObject } from 'util';

const COMPILATION_STATES = {
  NONE: 0, // No songs belong to a compilation album
  ALL: 1, // All songs belong to compilation album(s)
  SOME: 2 // Some of the songs belong to compilation album(s)
}

export default {
  components: {
    Btn: () => import('@/components/ui/btn'),
    SoundBar: () => import('@/components/ui/sound-bar')
  },

  props: {
    songs: {
      required: true,
      type: [Array, Object]
    },
    type: {
      type: String,
      required: true
    }
  },

  data: () => ({
    mutatedSongs: [],
    currentView: '',
    loading: true,

    /**
     * In order not to mess up the original songs, we manually assign and manipulate
     * their attributes.
     *
     * @type {Object}
     */
    formData: {
      title: {edit: false, value:''},
      albumName: {edit: false, value:''},
      artistName: {edit: false, value:''},
      lyrics: {edit: false, value:''},
      track: {edit: false, value:''},
      disc: {edit: false, value:''},
      year: {edit: false, value:''},
      composer: {edit: false, value:''},
      genre: {edit: false, value:''},
      comments: {edit: false, value:''},
      albumCover: {edit: false, value:''},
      compilationState: null
    }
  }),

  computed: {
    editingOnlyOneSong () {
      return this.type === 'song' && this.mutatedSongs.length === 1
    },

    allSongsAreFromSameArtist () {
      return this.mutatedSongs.every(song => song.artist.id === this.mutatedSongs[0].artist.id)
    },

    allSongsAreInSameAlbum () {
      return this.mutatedSongs.every(song => song.album.id === this.mutatedSongs[0].album.id)
    },

    allSongsHaveSameYear () {
      return this.mutatedSongs.every(song => song.year === this.mutatedSongs[0].year)
    },

    allSongsHaveSameGenre () {
      return this.mutatedSongs.every(song => song.genre === this.mutatedSongs[0].genre)
    },

    allSongsHaveSameComposer () {
      return this.mutatedSongs.every(song => song.composer === this.mutatedSongs[0].composer)
    },

    allSongsAreInSameDisc () {
      return this.mutatedSongs.every(song => song.disc === this.mutatedSongs[0].disc)
    },

    coverUrl () {
      return this.allSongsAreInSameAlbum ? this.mutatedSongs[0].album.cover : getDefaultCover()
    },

    compilationState () {
      const albums = this.mutatedSongs.reduce((acc, song) => union(acc, [song.album]), [])
      const compiledAlbums = albums.filter(album => album.is_compilation)

      if (!compiledAlbums.length) {
        this.formData.compilationState = COMPILATION_STATES.NONE
      } else if (compiledAlbums.length === albums.length) {
        this.formData.compilationState = COMPILATION_STATES.ALL
      } else {
        this.formData.compilationState = COMPILATION_STATES.SOME
      }

      return this.formData.compilationState
    },

    displayedTitle () {
      return this.editingOnlyOneSong ? this.formData.title.value : `${this.mutatedSongs.length} songs selected`
    },

    displayedArtistName () {
      return this.allSongsAreFromSameArtist || this.formData.artistName.value
        ? this.formData.artistName.value
        : 'Mixed Artists'
    },

    displayedAlbumName () {
      return this.allSongsAreInSameAlbum || this.formData.albumName.value
        ? this.formData.albumName.value
        : 'Mixed Albums'
    }
  },

  methods: {
    async open () {
      this.mutatedSongs = [].concat(this.songs)
      this.currentView = 'details'

      if (this.editingOnlyOneSong) {
        this.formData.title.value = this.mutatedSongs[0].title
        this.formData.albumName.value = this.mutatedSongs[0].album.name
        this.formData.artistName.value = this.mutatedSongs[0].artist.name

        for (let key in this.formData) {
          if (this.formData.hasOwnProperty(key) && isObject(this.formData[key]) && this.formData[key].hasOwnProperty('edit'))
            this.formData[key]['edit'] = true
        }

        // If we're editing only one song and the song's info (including lyrics)
        // hasn't been loaded, load it now.
        if (!this.mutatedSongs[0].infoRetrieved) {
          this.loading = true

          await songInfo.fetch(this.mutatedSongs[0])
          this.loading = false
          this.formData.lyrics.value = br2nl(this.mutatedSongs[0].lyrics)
          this.formData.disc.value = this.mutatedSongs[0].disc || ''
          this.formData.track.value = this.mutatedSongs[0].track || ''
          this.formData.year.value = this.mutatedSongs[0].year || ''
          this.formData.genre.value = this.mutatedSongs[0].genre
          this.formData.composer.value = this.mutatedSongs[0].composer
          this.formData.comments.value = this.mutatedSongs[0].comments
          this.initCompilationStateCheckbox()
        } else {
          this.loading = false
          this.formData.lyrics.value = br2nl(this.mutatedSongs[0].lyrics)
          this.formData.disc.value = this.mutatedSongs[0].disc || ''
          this.formData.track.value = this.mutatedSongs[0].track || ''
          this.formData.year.value = this.mutatedSongs[0].year || ''
          this.formData.genre.value = this.mutatedSongs[0].genre
          this.formData.composer.value = this.mutatedSongs[0].composer
          this.formData.comments.value = this.mutatedSongs[0].comments
          this.initCompilationStateCheckbox()
        }
      } else {
        this.formData.albumName.value = this.allSongsAreInSameAlbum ? this.mutatedSongs[0].album.name : ''
        this.formData.artistName.value = this.allSongsAreFromSameArtist ? this.mutatedSongs[0].artist.name : ''
        this.formData.disc.value = this.allSongsAreInSameDisc ? this.mutatedSongs[0].disc || '' : ''
        this.formData.year.value = this.allSongsHaveSameYear ? this.mutatedSongs[0].year || '' : ''
        this.formData.genre.value = this.allSongsHaveSameGenre ? this.mutatedSongs[0].genre : ''
        this.formData.composer.value = this.allSongsHaveSameComposer ? this.mutatedSongs[0].composer : ''
        this.loading = false
        this.initCompilationStateCheckbox()
      }
    },

    initCompilationStateCheckbox () {
      // This must be wrapped in a $nextTick callback, because the form is dynamically
      // attached into DOM in conjunction with `this.loading` data binding.
      this.$nextTick(() => {
        const chk = this.$refs.compilationStateChk

        switch (this.compilationState) {
          case COMPILATION_STATES.ALL:
            chk.checked = true
            chk.indeterminate = false
            break
          case COMPILATION_STATES.NONE:
            chk.checked = false
            chk.indeterminate = false
            break
          default:
            chk.checked = false
            chk.indeterminate = true
            break
        }
      })
    },

    /**
     * Manually set the compilation state.
     * We can't use v-model here due to the tri-state nature of the property.
     * Also, following iTunes style, we don't support circular switching of the states -
     * once the user clicks the checkbox, there's no going back to indeterminate state.
     */
    changeCompilationState (e) {
      this.formData.compilationState = e.target.checked ? COMPILATION_STATES.ALL : COMPILATION_STATES.NONE
    },

    contentModified ($event) {
      let name = $event.target.getAttribute('name')
      if (this.formData.hasOwnProperty(name))
          this.formData[name]['edit'] = true
    },

    getPlaceholder (p1, p2) {
      if (!p1 && !p2)
        return 'Mixed'
      else
        return ''
    },

    close () {
      this.$emit('close')
    },

    async submit () {
      this.loading = true

      try {
        await songStore.update(this.mutatedSongs, this.formData)
        event.emit(event.$names.KOEL_READY)
        this.close()
      } finally {
        this.loading = false
      }
    }
  },

  async created () {
    await this.open()
  }
}
</script>

<style lang="scss" scoped>
form {
  > header {
    img {
      flex: 0 0 96px;
    }

    .meta {
      flex: 1;
      padding-left: 8px;

      .mixed {
        opacity: .5;
      }
    }
  }

  textarea.comments {
    min-height: 100px;
  }

  textarea.lyrics {
    min-height: 250px;
  }
}
</style>
