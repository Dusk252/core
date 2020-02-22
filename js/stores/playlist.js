import { difference, union } from 'lodash'
import NProgress from 'nprogress'

import stub from '@/stubs/playlist'
import { http } from '@/services'
import { alerts, pluralize } from '@/utils'
import { songStore } from '.'

export const playlistStore = {
  stub,

  state: {
    playlists: []
  },

  init (playlists) {
    this.all = playlists
  },

  get all () {
    return this.state.playlists
  },

  set all (value) {
    this.state.playlists = value
  },

  fetchSongs: playlist => {
    NProgress.start()

    return new Promise((resolve, reject) => {
      http.get(`playlist/${playlist.id}/songs`, ({ data }) => {
        playlist.songs = data.map(d => Object.assign(songStore.byId(d.id), {sort_order: d.sort_order}))
        resolve(playlist)
      }, error => reject(error))
    })
  },

  byId (id) {
    return this.all.find(song => song.id === id)
  },

  /**
   * Populate the playlist content by "objectifying" all songs in the playlist.
   * (Initially, a playlist only contain the song IDs).
   *
   * @param  {Object} playlist
   */
  populateContent: playlist => (playlist.songs = songStore.byIds(playlist.songs)),

  getSongs: playlist => playlist.songs,

    /**
   * Move some songs to after a target.
   *
   * @param  {Array.<Object>} songs  Songs to move
   * @param  {Object}     target The target song object
   */
  move (playlist, songs, target) {
    const targetIndex = playlist.songs.indexOf(target)

    songs.forEach(song => {
      playlist.songs.splice(playlist.songs.indexOf(song), 1)
      playlist.songs.splice(targetIndex, 0, song)
    })
  },

  /**
   * Add a playlist/playlists into the store.
   *
   * @param {Array.<Object>|Object} playlists
   */
  add (playlists) {
    this.all = union(this.all, [].concat(playlists))
  },

  /**
   * Remove a playlist/playlists from the store.
   *
   * @param  {Array.<Object>|Object} playlists
   */
  remove (playlists) {
    this.all = difference(this.all, [].concat(playlists))
  },

  store (name, songs = [], rules = null) {
    if (songs.length) {
      // Extract the IDs from the song objects.
      songs = songs.map(song => song.id)
    }

    NProgress.start()

    return new Promise((resolve, reject) => {
      http.post('playlist', { name, songs, rules }, ({ data: playlist }) => {
        playlist.songs = songs
        this.populateContent(playlist)
        this.add(playlist)
        alerts.success(`Created playlist &quot;${playlist.name}&quot;.`)
        resolve(playlist)
      }, error => reject(error))
    })
  },

  delete (playlist) {
    NProgress.start()

    return new Promise((resolve, reject) => {
      http.delete(`playlist/${playlist.id}`, {}, ({ data }) => {
        this.remove(playlist)
        resolve(data)
      }, error => reject(error))
    })
  },

  addSongs (playlist, songs) {
    return new Promise((resolve, reject) => {
      const count = playlist.songs.length
      playlist.songs = union(playlist.songs, songs)
      this.remapSortOrder(playlist);

      if (count === playlist.songs.length) {
        resolve(playlist)
        return
      }

      NProgress.start()

      http.put(`playlist/${playlist.id}/sync`, { songs: playlist.songs.map(song => song.id) }, () => {
        alerts.success(`Added ${pluralize(songs.length, 'song')} into &quot;${playlist.name}&quot;.`)
        resolve(playlist)
      }, error => reject(error))
    })
  },

  updateSongs (playlist) {
    if (playlist.is_smart) {
      return
    }
    this.remapSortOrder(playlist);

    NProgress.start()
    return new Promise((resolve, reject) => {
      http.put(`playlist/${playlist.id}/sync`, { songs: playlist.songs.map(song => song.id) }, () => {
        alerts.success(`Updated song order in &quot;${playlist.name}&quot;.`)
        resolve(playlist)
      }, error => reject(error))
    })
  },

  removeSongs (playlist, songs) {
    if (playlist.is_smart) {
      return
    }

    NProgress.start()

    playlist.songs = difference(playlist.songs, songs)
    this.remapSortOrder(playlist);

    return new Promise((resolve, reject) => {
      http.put(`playlist/${playlist.id}/sync`, { songs: playlist.songs.map(song => song.id) }, () => {
        alerts.success(`Removed ${pluralize(songs.length, 'song')} from &quot;${playlist.name}&quot;.`)
        resolve(playlist)
      }, error => reject(error))
    })
  },

  update: playlist => {
    NProgress.start()

    return new Promise((resolve, reject) => {
      http.put(
        `playlist/${playlist.id}`,
        { name: playlist.name, rules: playlist.rules },
        () => {
          alerts.success(`Updated playlist &quot;${playlist.name}&quot;.`)
          resolve(playlist)
        },
        error => reject(error)
      )
    })
  },

  remapSortOrder: playlist => {
    playlist.songs.map((val, index) => {val.sort_order = index; return val});
  }
}
