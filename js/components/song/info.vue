<template>
  <article class="song-info" v-if="song">
    <div class="name">
      <h1>
        <span>{{ song.title }}</span>
      </h1>
      <div v-if="song.playCount">{{ song.playCount | pluralize('play') }}</div>
    </div>
    <div v-if="song.album.cover" class="album-image" :style="`background-image: url(${song.album.cover})`"></div>
    <div class="primary-info" :class="{borderBottom: song.artist.id || song.album.id}">
        <div v-if="song.artist.id"><a :href="`#!/artist/${song.artist.id}`">{{ song.artist.name }}</a></div>
        <div v-if="song.album.id"><a :href="`#!/album/${song.album.id}`">{{ song.album.name }}</a></div>
        <div>
          <div class="technical-info small">
            <span v-if="song.dataformat">{{ song.dataformat }} | </span>
            <span v-if="song.khzsample_rate">{{ song.khzsample_rate }} | </span>
            <span v-if="song.kbitrate">{{ song.kbitrate }} {{ song.bitrate_mode }} | </span>
            <span v-if="song.channel_mode">{{ song.channel_mode }} | </span>
            <span v-if="song.length">{{ song.fmtLength }}</span>
          </div>
        </div>
    </div>
    <div class="secondary-info">
        <div v-if="song.year"><h2 class="label">Year: </h2><span>{{ song.year }}</span></div>
        <div v-if="song.composer"><h2 class="label">Composer: </h2><span>{{ song.composer }}</span></div>
        <div v-if="song.genre"><h2 class="label">Genre: </h2><span>{{ song.genre }}</span></div>
    </div>
  </article>
</template>

<script>
import { playback } from '@/services'
import { pluralize } from '@/utils'

export default {
  props: {
    song: Object
  },
  filters: { pluralize }
}
</script>

<style lang="scss">
@import "~#/partials/_vars.scss";
@import "~#/partials/_mixins.scss";
</style>
