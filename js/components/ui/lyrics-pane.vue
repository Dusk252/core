<template>
  <article id="lyrics" v-if="song">
    <div class="content">
      <div v-show="song && song.lyrics">
        <div ref="lyricsContainer" v-html="song.lyrics"></div>
      </div>
      <div class="none" v-if="song.id && !song.lyrics">
        <p>No lyrics found in the local database.</p>
        <div class="search-providers">
          <p>Search providers:</p>
          <span class="provider" v-for="(provider, index) in providers" :key="`provider-${index}`" @click.prevent="getLyrics(index, 0)">
            <a>
              {{provider}}
            </a><span>{{(index == providers.length - 1) ? "" : " | "}}</span>
          </span>
            <button class="edit-button" v-on:click="isHidden = !isHidden">{{isHidden ? "Show " : "Hide "}} parameters</button>
            <div v-show="!isHidden">
              <div>
                <label>Title: </label>
                <input name="title" type="text" v-model="title">
              </div>
              <div>
                <label>Artist: </label>
                <input name="artist" type="text" v-model="artist">
              </div>
            </div>
        </div>
        <!--<p>google search: <a :href="'https://www.google.com/search?q=' + song.title + '+' + song.artist.name + '+lyrics'" target="_blank">EN</a>
        | <a :href="'https://www.google.com/search?q=' + song.title + '+' + song.artist.name + '+歌詞'" target="_blank">JP</a>-->
        <div class="search-results" v-if="!switchingProviders && searchResults.length">
          <div>Searched {{providers[currentProvider]}}.</div>
          <div v-html="searchResults[2]"></div>
          <div v-if="searchResults[1]">
            <a :class="{ 'disabled' : loading || currentIndex == 0 }" @click.prevent="getLyrics(currentProvider, -1)">{{ "← Previous Result" }}</a>
            <span>　|　</span>
            <a :class="{ 'disabled' : loading || currentIndex + 1 == searchResults[1]}" @click.prevent="getLyrics(currentProvider, 1)">{{ "Next Result →" }}</a>
            <button @click.prevent="saveLyrics()" class="edit-button" :disabled="loading">Save Current Result</button>
            <div class="lyrics-result" v-if="!loading" v-html="searchResults[0]"></div>
          </div>
        </div>
        <div class="loader" v-if="loading">
          <loader/>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { lyricsService } from '@/services'
import { songStore } from '@/stores'

export default {
  props: {
    song: {
      type: Object,
      required: true
    }
  },

  components: {
    Loader: () => import('@/components/ui/sound-bar.vue')
  },

  data: () => ({
    loading: false,
    switchingProviders: false,
    searchResults: [],
    providers: ['JLyric','UtaTen','MusixMatch'],
    currentIndex: 0,
    currentProvider: null,
    isHidden: true,
    title: '',
    artist: '',
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
      compilationState: 2
    }
  }),

  methods: {
    async getLyrics (provider, n) {
        if(this.currentProvider != provider) {
          this.switchingProviders = true;
          this.currentProvider = provider;        
        }
        this.currentIndex = this.currentIndex + n;
        this.loading = true

        try {
          this.searchResults = await lyricsService.getLyrics(this.title, this.artist, this.providers[provider], this.currentIndex)
        } finally {
          this.loading = false
          this.switchingProviders = false
        }
      },
    async saveLyrics() {
      if (this.searchResults.length) {
        this.formData.lyrics.value = this.searchResults[0]
        this.formData.lyrics.edit = this.searchResults[0].length > 0;
        try {
          await songStore.update([this.song], this.formData)
        }
        finally {}
      }
    }
  },

  watch: {
    song() {
      this.searchResults = [],
      this.currentIndex = 0,
      this.currentProvider = null

      this.title = this.song.title;
      this.artist = this.song.artist.name;
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  line-height: 1.6;
  position: relative;

  .text-zoomer {
    opacity: 0;
    position: absolute;
    top: 0;
    right: 0;
  }

  &:hover .text-zoomer {
    opacity: .5;

    &:hover {
      opacity: 1;
    }
  }

  .loader {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .disabled {
    text-decoration: none !important;
    opacity: 0.5;
    pointer-events: none;
  }

  .search-providers, .search-results {
    margin-top: 10px;
  }

  .lyrics-result {
    margin-top: 15px;
  }

  .edit-button {
    margin: 10px 0 !important;
  }

  .edit-button:disabled {
    color: rgba(255,255,255,0.5);
    text-decoration: none !important;
    background-color: hsla(0,0%,100%,.1);
    pointer-events: none;
  }

  input[type="text"] {
    font-size: 0.9rem;
    padding: .2rem .3rem;
    background: rgba(255,255,255,0.1);
    color: #dcdcdc;
    display: inline-block;
    margin-bottom: 5px;
    width: calc(100% - 34px);
  }

  label {
    font-size: 0.9rem;
    display: inline-block;
    width: 30px;
    margin-bottom: 5px;
  }
}
</style>