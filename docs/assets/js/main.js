const config = {
    "xAxes": [{
        "type": "DurationAxis",
        "baseUnit": "second",
        "strictMinMax": true,
        "durationFormatter": {
            "durationFormat": "hh':'mm':'ss"
        },
        "axisRanges": [{
            "value": 0,
            "endValue": 0,
            "axisFill": {
                "fill": "#396478",
                "fillOpacity": 0.1
            },
            "grid": {
                "strokeOpacity": 0
            }
        }],
    }],
    "yAxes": [{
        "type": "ValueAxis",
    }],
    "series": [{
        "id": "s1",
        "type": "LineSeries",
        "dataFields": {
            "valueY": "value",
            "valueX": "sec"
        },
        "tooltipText": "{valueY}",
        "tooltip": {
            "pointerOrientation": "vertical"
        }
    }],
    "cursor": {
        "type": "XYCursor",
        "snapToSeries": ["s1"]
    },
    "scrollbarX": {
        "marginBottom": 20,
    },
    "responsive": {
        "enabled": true
    }
}

// This code loads the IFrame Player API code asynchronously.
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
let player_is_ready = false;
let playlist;
let chartData;

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

const chart = am4core.createFromConfig(config, "chartdiv", am4charts.XYChart);
// チャートをクリックした時の挙動
chart.events.on("hit", () => {
    const targetSec = chart.series.values[0].tooltipDataItem.valueX;
    const state = player.getPlayerState()
    if (state == 5) {
        player.loadVideoById({videoId: player.getVideoData().video_id, startSeconds: targetSec});
    } else {
        player.seekTo(targetSec);
        setRangeEnd(targetSec);
        player.playVideo();
    }
});

// JSONファイルを読み込む関数（同期）
const loadJSON = (path) => {
    return new Promise((resolve) => {
        const req = new XMLHttpRequest();
        req.responseType = "json";
        req.open("GET", path);
        req.send();
        req.onreadystatechange = () => {
            if(req.readyState === 4) {
                resolve(req.response);
            };
        };
    });
};

// 再生する動画を変更
const changeVideoById = (videoId) => {
    player.cueVideoById({videoId: videoId, startSeconds: 0});
};

// チャート上で示されている再生位置を変更
const setRangeEnd = (time) => {
    chart.xAxes.values[0].axisRanges.values[0].endValue = time;
};

// 動画プレイヤーの現在の再生位置をチャートに反映
const showCurrentTime = () => {
    if (player.getPlayerState() != -1) {
        const time = player.getCurrentTime();
        setRangeEnd(time);
    }
};

// 指定したインデックスのデータでチャートを初期化
const refreshChart = (index) => {
    chart.data = chartData[index];
    setRangeEnd(0);
};

// 動画選択用プルダウンメニューを作成
const createVideoSelector = () => {
    const selector = document.getElementById("video-select");
    playlist.forEach((data, i) => {
        const option = document.createElement("option");
        option.setAttribute("value", i);
        option.innerHTML = data.title;
        selector.appendChild(option);
    });
};

// プルダウンで動画を選択した時に呼ばれる関数
const selectVideo = (index) => {
    refreshChart(index);
    changeVideoById(playlist[index].videoId);
};

// YouTube Iframe API が読み込まれたときに呼ばれる関数
window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("ytplayer", {
        height: "450",
        width: "800",
        events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
        },
        playerVars: {
            playsinline: 1,
        }
    });
};

// プレイヤーの準備が完了したときに呼ばれる関数
const onPlayerReady = (event) => {
    player_is_ready = true;
};

// プレイヤーの状態が変化したときに呼ばれる関数
const onPlayerStateChange = (event) => {};

// プレイヤーの準備完了を待つための関数
const waitPlayerReady = () => {
    return new Promise((resolve) => {
        const checkFlag = () => {
            if (player_is_ready) {
                resolve();
            } else {
                window.setTimeout(checkFlag, 500);
            }
        };
        checkFlag();
    });
};

window.onload = () => {
    (async () => {
        playlist = await loadJSON("assets/data/playlist.json");
        chartData = await Promise.all(playlist.map(async (video) => {
            return await loadJSON("assets/data/" + video.dataFile);
        }));
        await waitPlayerReady();
        createVideoSelector();
        selectVideo(0);
        setInterval("showCurrentTime()", 500);
    })();
};
