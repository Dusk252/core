import { http } from '@/services'
export const lyricsService = {

    getLyrics (title, artist, provider, currentIndex) {
        return new Promise((resolve, reject) => {
            http.post('lyrics', {
              title: title,
              artist: artist,
              provider: provider,
              resultIndex: currentIndex
            }, ({ data: { lyrics, results, message }}) => {
                resolve([lyrics, results, message]);
            }, error => reject(error))
        });
    }
}