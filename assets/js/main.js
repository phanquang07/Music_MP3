/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / repeat when ended
 * 8. Active song
 * Scroll active song into view
 * Play song when click
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STARAGE_KEY = 'F8_Player'

const cd = $('#cd')

const songName = $('#song-name')
const cdThumb = $('#cd-thumb')
const audio = $('#audio')

const playBtn = $('#btn-toggle-play')
const player = $('#player')

const progress = $('#progress')

const prevBtn = $('#btn-prev')
const nextBtn = $('#btn-next')
const randomBtn = $('#btn-random')
const repeatBtn = $('#btn-repeat')

const playlist = $('#playlist')

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STARAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value
    localStorage.setItem(PLAYER_STARAGE_KEY, JSON.stringify(this.config))
  },
  songs: [
    {
      name: 'Ddu du Ddu du',
      singer: 'Black Pink',
      path: './assets/music/song1.mp3',
      img: './assets/img/black-pink.jpeg'
    },
    {
      name: 'Đi đi đi',
      singer: 'Victone',
      path: './assets/music/song2.mp3',
      img: './assets/img/victone.jpg'
    },
    {
      name: 'Once opon a time',
      singer: 'Max Ozao',
      path: './assets/music/song3.mp3',
      img: './assets/img/max_ozao.jpg'
    },
    {
      name: 'The Spectre',
      singer: 'Alan Warker',
      path: './assets/music/song4.mp3',
      img: './assets/img/alan_walker.jpg'
    },
    {
      name: 'Cheri cheri lady',
      singer: 'Modern Talking',
      path: './assets/music/song5.mp3',
      img: './assets/img/modern_talking.jpg'
    },
    {
      name: 'La la la',
      singer: 'Naughty Boy',
      path: './assets/music/song6.mp3',
      img: './assets/img/naughtyboy.jpg'
    },
    {
      name: 'Unstopable',
      singer: 'Sia',
      path: './assets/music/song7.mp3',
      img: './assets/img/sia.jpg'
    },
    {
      name: 'Safari',
      singer: 'Serena',
      path: './assets/music/song8.mp3',
      img: './assets/img/serena.jpg'
    },
  ],
  render: function () {
    const renderSongs = this.songs.map((song, index) => {
      return (
        `<div id="song" class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index} > 
          <div
            class="thumb"
            style="
              background-image: url('${song.img}');
            "
          ></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>`
      )
    })
    playlist.innerHTML = renderSongs.join('')
  },
  handelEvents: function () {
    const _this = this
    const cdWidth = cd.offsetWidth

    // Phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      // console.log('scrollTop: ', scrollTop);
      const newCdWidth = cdWidth - scrollTop
      // console.log('newCdWidth: ', newCdWidth);
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
      cd.style.opacity = newCdWidth / cdWidth
    }
    // Quay / dừng CD
    const cdThumbAnimate = cdThumb.animate([{
      transform: 'rotate(360deg)'
    }], {
      duration: 10000, //10s
      interations: Infinity
    })
    cdThumbAnimate.pause()
    // Play / pause song
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }
    audio.onplay = function () {
      _this.isPlaying = true
      player.classList.add('playing')
      cdThumbAnimate.play()
    }
    audio.onpause = function () {
      _this.isPlaying = false
      player.classList.remove('playing')
      cdThumbAnimate.pause()
    }
    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      // console.log(audio.currentTime / audio.duration * 100);
      if (audio.duration) {
        progress.value = audio.currentTime / audio.duration * 100
      }
    }
    // Seek song
    progress.onchange = function (e) {
      audio.currentTime = e.target.value / 100 * audio.duration
    }
    // Prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong()
      } else {
        _this.prevSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }
    // Next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong()
      } else {
        _this.nextSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }
    // Random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }
    // Repeat when song ended
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }
    // Next when song ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.onclick()
      }
    }
    // click playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)')
      const songOption = e.target.closest('.option')
      if (songNode && !songOption) {
        // click to song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
          // Click to option
        } else if (!songOption) {

        }
      }
    }
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex]
      }
    })
  },
  // Load properties song
  loadCurrentSong: function () {
    songName.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
    audio.src = this.currentSong.path
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },
  // Prev song
  prevSong: function () {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },
  // Next song
  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },
  // Random song
  randomSong: function () {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)
    this.currentIndex = newIndex
    console.log('newIndex: ', newIndex);
    this.loadCurrentSong()
  },
  scrollToActiveSong: function () {
    if (this.currentIndex === 0) {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        })
      }, 300)
    } else {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }, 300)
    }
  },
  start: function () {
    // Load Config
    this.loadConfig()
    // Định nghĩa các thuộc tính cho obj
    this.defineProperties()
    // Lắng nghe các event (DOM events)
    this.handelEvents()
    // Tải bài hát đầu tiên trong UI khi start app
    this.loadCurrentSong()
    // Render playlist
    this.render()
    // Hiển thị trạng thái ban đầu của btn random và repeat
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
  }
}
app.start()
