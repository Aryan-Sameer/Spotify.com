let currentSong = new Audio()
let songs
let currFolder

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/Spotify.com/songs/${folder}`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let as = div.getElementsByTagName('a')

    songs = []
    for (let i = 0; i < as.length; i++) {
        let element = as[i]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]) //sending href value (string) to the songs[] array
        }
    }

    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0] //songUL is the html element
    songUL.innerHTML = ""
    for (const songname of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li class="songItem flex-r justify-space">
            <div class="template flex-r">
                <img src="SVGs/music.svg" alt="poster">
                <div class="details flex-c">
                    <p>${songname.replaceAll("%20", " ")}</p>
                    <p>artist</p>
                </div>
            </div>
            <div class="playnow flex-r align-center">
                <p>Play now</p>
                <img src="SVGs/playbtn.svg" alt="play">
            </div>
        </li>`
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.getElementsByTagName('div')[0].children[1].children[0].innerHTML.trim())
        })
    })
    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "SVGs/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = `<p class="self-center inverted m-0 primary-font"> ${decodeURI(track)} </p>`
    document.querySelector(".songtime").innerHTML = `<p class="self-center inverted m-0 primary-font"> 00:00 / 00:00 </p>`
}


async function displayAlbums() {
    let a = await fetch(`/Spotify.com/songs/`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let anchor = div.getElementsByTagName('a')
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)
            let a = await fetch(`/Spotify.com/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML +=
                `<div data-folder="${folder}" class="card">
                        <img class="poster" src="/songs/${folder}/cover.jpg" alt="">
                        <img class="playButton" src="SVGs/playbtn.svg" alt="playButton">
                        <h3 class="m-0">${response.title}</h3>
                        <p class="m-0">${response.description}</p>
                    </div>`
        }
    }

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })

}
displayAlbums()

async function main() {
    await getSongs("https://aryan-sameer.github.io/Spotify.com/songs/") // array of strings
    playMusic(songs[0], true)

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "SVGs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "SVGs/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `<p class="self-center inverted m-0 primary-font">${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}</p>`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    function convertSecondsToMinutes(seconds) {
        // Calculate total minutes
        let totalMinutes = Math.floor(seconds / 60);

        // Calculate remaining seconds rounded to two decimal places
        let remainingSeconds = (seconds % 60).toFixed(2);

        // Extract the integer part and decimal part of remainingSeconds
        let [integerPart, decimalPart] = remainingSeconds.split('.');

        // Format minutes and seconds with leading zeros
        let formattedMinutes = String(totalMinutes).padStart(2, '0');
        let formattedSeconds = integerPart.padStart(2, '0');

        // Return formatted result
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        if (percent > 0) {
            document.querySelector(".circle").style.left = percent + "%"
        }
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("prev is clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index > 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("next is clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index < songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", e => {
        console.log("volume changed to ", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0){
            console.log(e.target)
            document.querySelector(".volume>img").src = "SVGs/volume.svg"
        }
    })

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            (e.target.src = "SVGs/mute.svg")
            currentSong.volume = 0
            document.querySelector(".volume>input").value = 0
        }
        else {
            (e.target.src = "SVGs/volume.svg")
            currentSong.volume = 0.1
            document.querySelector(".volume>input").value = "10"
        }
    })

}
main()
