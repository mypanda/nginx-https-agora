// AgoraRTC.setLogLevel(3)

var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};

AgoraRTC.onAutoplayFailed = () => {
  alert("click to start autoplay!")
}

AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
  if (changedDevice.state === "ACTIVE") {
    localTracks.audioTrack.setDevice(changedDevice.device.deviceId);
  } else if (changedDevice.device.label === localTracks.audioTrack.getTrackLabel()) {
    const oldMicrophones = await AgoraRTC.getMicrophones();
    oldMicrophones[0] && localTracks.audioTrack.setDevice(oldMicrophones[0].deviceId);
  }
}

AgoraRTC.onCameraChanged = async (changedDevice) => {
  if (changedDevice.state === "ACTIVE") {
    localTracks.videoTrack.setDevice(changedDevice.device.deviceId);
  } else if (changedDevice.device.label === localTracks.videoTrack.getTrackLabel()) {
    const oldCameras = await AgoraRTC.getCameras();
    oldCameras[0] && localTracks.videoTrack.setDevice(oldCameras[0].deviceId);
  }
}

$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  options.uid = urlParams.get("uid");
  // if (options.appid && options.channel) {
  //   $("#uid").val(options.uid);
  //   $("#appid").val(options.appid);
  //   $("#token").val(options.token);
  //   $("#channel").val(options.channel);
  //   $("#join-form").submit();
  // }
})

$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    await join();
    if(options.token) {
      $("#success-alert-with-token").css("display", "block");
    } else {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      $("#success-alert").css("display", "block");
    }
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
})

$("#leave").click(function (e) {
  leave();
})

async function join() {

  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  client.on("user-left", handleUserLeft);

  [ options.uid, localTracks.audioTrack ] = await Promise.all([
    client.join(options.appid, options.channel, options.token || null, options.uid || null),
    AgoraRTC.createMicrophoneAudioTrack()
  ]);
  // [ options.uid, localTracks.audioTrack, localTracks.videoTrack ] = await Promise.all([
  //   client.join(options.appid, options.channel, options.token || null, options.uid || null),
  //   AgoraRTC.createMicrophoneAudioTrack(),
  //   AgoraRTC.createCameraVideoTrack()
  // ]);

  // localTracks.videoTrack.play("local-player");
  // $("#local-player-name").text(`localVideo(${options.uid})`);

  // await client.publish(Object.values(localTracks));
  await client.publish(localTracks.audioTrack);
  console.log("publish success");
}

$("#muteUnpublish").click(function (e) {
  client.unpublish(localTracks.audioTrack).then(res=> {
    console.log('unpublish localTracks', res)
  }).catch(e => {
    console.log(e)
  })
})
$("#mutePublish").click(function (e) {
  client.publish(localTracks.audioTrack).then(res=>{
    console.log('publish localTracks', res)
  })
})

$("#mute0").click(function (e) {
  console.log('mute 0 ', localTracks.audioTrack.setVolume(0))
})
$("#mute100").click(function (e) {
  console.log('mute 100 ', localTracks.audioTrack.setVolume(100))
})
$("#mute200").click(function (e) {
  console.log('mute 200 ', localTracks.audioTrack.setVolume(200))
})

$("#subscribe").click(function (e) {
  
})

async function leave() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if(track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  remoteUsers = {};
  $("#remote-playerlist").html("");

  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
  window.user = user
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === 'video') {
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}

function handleUserPublished(user, mediaType) {
  console.log('handleUserPublished', user, mediaType)
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

function handleUserUnpublished(user, mediaType) {
  console.log('handleUserUnpublished', user, mediaType)
  if (mediaType === 'video') {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}
function handleUserLeft(user, reason) {
  console.log('handleUserLeft','user, reason', user, reason)
}
