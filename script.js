/* =========================================================
   SUPABASE CONFIG
   Replace the two values below with your Supabase Project URL
   and Publishable Key.
========================================================= */

const SUPABASE_URL = "fvxbxtucmjqkaitryizv";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_64lo-eRU69A6sQjzCd1i2g_yO82XCOs";

let supabaseClient = null;

if (
  window.supabase &&
  SUPABASE_URL.trim() &&
  SUPABASE_PUBLISHABLE_KEY.trim()
) {
  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL.trim(),
      SUPABASE_PUBLISHABLE_KEY.trim()
    );
  } catch (error) {
    console.error("Supabase initialization failed. Local leaderboard will be used.", error);
    supabaseClient = null;
  }
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const pads = $$(".pad");
const startButton = $("#startButton");
const heroStart = $("#heroStart");
const nameModal = $("#nameModal");
const playerName = $("#playerName");
const nameStart = $("#nameStart");
const nameClose = $("#nameClose");
const nameError = $("#nameError");
const leaderboardModal = $("#leaderboardModal");
const leaderboardButton = $("#leaderboardButton");
const leaderboardClose = $("#leaderboardClose");
const leaderboardList = $("#leaderboardList");
const muteButton = $("#muteButton");
const soundState = $("#soundState");
const volumeSlider = $("#volumeSlider");
const volumeValue = $("#volumeValue");

let sequence = [];
let level = 1;
let score = 0;
let inputIndex = 0;
let playing = false;
let showing = false;
let muted = false;
let volume = Number(localStorage.getItem("YADUNAND_MIND_VOLUME") || 80) / 100;
let audio = null;
const drumSamples = {};
["kick","snare","hihat","tom"].forEach(name => {
  const a = new Audio("assets/" + name + ".wav");
  a.preload = "auto";
  drumSamples[name] = a;
});
function playDrumSample(name){
  if(muted) return;
  const source = drumSamples[name];
  if(!source) return;
  const hit = source.cloneNode();
  hit.volume = volume;
  hit.currentTime = 0;
  hit.play().catch(()=>{});
}

let player = localStorage.getItem("YADUNAND_MIND_PLAYER") || "";

const colors = ["#b7ff4a","#64e7ff","#e8f45a","#ff6171"];
const leaderboardKey = "YADUNAND_MIND_SCORES";
let globalScores = [];

function openModal(el){ el.classList.add("open"); el.setAttribute("aria-hidden","false"); }
function closeModal(el){ el.classList.remove("open"); el.setAttribute("aria-hidden","true"); }

function updateUI(){
  $("#level").textContent = String(level).padStart(2,"0");
  $("#score").textContent = String(score).padStart(2,"0");
  $("#oledScore").textContent = "SCORE: " + String(score).padStart(2,"0");
  $("#playerDisplay").textContent = player || "GUEST";
  const localBest = getScores()[0]?.score || 0;
  const globalBest = globalScores[0]?.score || 0;
  const best = Math.max(localBest, globalBest);
  $("#bestScore").textContent = String(best).padStart(2,"0");
  $("#bestSide").textContent = String(best).padStart(2,"0");
}

function status(text){ $("#status").textContent = text; }
function oled(title, sub){
  $("#oledTitle").textContent = title;
  $("#oledSub").textContent = sub;
}
function dots(active=-1){
  $$("#oledDots i").forEach((d,i)=>d.classList.toggle("active",i===active));
}

function getAudio(){
  if(muted) return null;
  try{
    if(!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if(audio.state==="suspended") {
      audio.resume().catch(()=>{});
    }
    return audio;
  }catch(e){ return null; }
}

function playTone(freq, duration=140, type="sine", volume=.055, when=0){
  const ctx = getAudio();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
  gain.gain.setValueAtTime(.0001, ctx.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + when + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + when + duration/1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + duration/1000 + .03);
}

/* Polished arcade-style game audio.
   The drum idea is only used as subtle impact — the main sound is musical. */
function noiseBurst(duration=.08, volume=.035, highpass=2500, when=0){
  const ctx=getAudio(); if(!ctx) return;
  const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*duration),ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){
    data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2.4);
  }
  const src=ctx.createBufferSource();
  const filter=ctx.createBiquadFilter();
  const gain=ctx.createGain();
  src.buffer=buffer;
  filter.type="highpass";
  filter.frequency.value=highpass;
  gain.gain.setValueAtTime(volume,ctx.currentTime+when);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+when+duration);
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(ctx.currentTime+when);
}

function impact(when=0, strength=.07){
  const ctx=getAudio(); if(!ctx) return;
  const osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type="sine";
  osc.frequency.setValueAtTime(105,ctx.currentTime+when);
  osc.frequency.exponentialRampToValueAtTime(58,ctx.currentTime+when+.11);
  gain.gain.setValueAtTime(.0001,ctx.currentTime+when);
  gain.gain.exponentialRampToValueAtTime(strength,ctx.currentTime+when+.006);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+when+.14);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime+when);
  osc.stop(ctx.currentTime+when+.16);
}

function padSound(index){
  if(muted) return;
  if(index===0) playDrumSample("kick");
  else if(index===1) playDrumSample("snare");
  else if(index===2) playDrumSample("hihat");
  else playDrumSample("tom");
}

function miniDrum(when=0, strength=.055){
  const ctx=getAudio(); if(!ctx) return;
  const now=ctx.currentTime+when;

  // Small electronic kick — subtle, just enough to add impact.
  const kick=ctx.createOscillator();
  const kickGain=ctx.createGain();
  kick.type="sine";
  kick.frequency.setValueAtTime(125,now);
  kick.frequency.exponentialRampToValueAtTime(52,now+.11);
  kickGain.gain.setValueAtTime(.0001,now);
  kickGain.gain.exponentialRampToValueAtTime(strength,now+.006);
  kickGain.gain.exponentialRampToValueAtTime(.0001,now+.14);
  kick.connect(kickGain); kickGain.connect(ctx.destination);
  kick.start(now); kick.stop(now+.16);

  // Tiny click on the tail for a drum-machine feel.
  noiseBurst(.035,.012,3200,when+.055);
}

function uiSound(kind){
  if(muted) return;

  if(kind==="click"){
    playTone(740,55,"sine",.022);
    playTone(1110,80,"sine",.014,.045);
    return;
  }

  if(kind==="start"){
    // Short cinematic startup: three notes, not a drum loop.
    playTone(220,120,"triangle",.035);
    playTone(329.63,120,"triangle",.04,.10);
    playTone(523.25,220,"sine",.045,.20);
    noiseBurst(.06,.018,5000,.18);
    impact(.20,.045);
    return;
  }

  if(kind==="correct"){
    // Bright "level cleared" arpeggio.
    playTone(392,90,"triangle",.035);
    playTone(493.88,95,"triangle",.04,.08);
    playTone(587.33,110,"triangle",.045,.16);
    playTone(783.99,220,"sine",.045,.25);
    noiseBurst(.045,.015,6000,.27);
    return;
  }

  if(kind==="wrong"){
    // Soft but clear failure sound.
    playTone(220,170,"sawtooth",.028);
    playTone(164.81,260,"triangle",.035,.10);
    impact(.04,.08);
    noiseBurst(.07,.018,1800,.08);
    return;
  }

  if(kind==="gameover"){
    // Musical ending with a small, subtle drum hit.
    playTone(392,110,"triangle",.03);
    playTone(311.13,130,"triangle",.03,.11);
    playTone(233.08,170,"triangle",.032,.24);
    miniDrum(.36,.06);
    playTone(155.56,380,"sine",.04,.39);
    noiseBurst(.08,.015,2500,.40);
    impact(.40,.065);
  }
}

function beep(index, duration=170){
  // Main sequence sound: musical, recognizable and different per pad.
  padSound(index);
}

function flash(index, ms=360){
  const pad = pads[index];
  if(!pad) return;
  pad.classList.add("active");
  beep(index,ms*.55);
  setTimeout(()=>pad.classList.remove("active"),ms);
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function showSequence(){
  showing = true;
  pads.forEach(p=>p.disabled=true);
  oled("WATCH", "MEMORIZE THE SIGNALS");
  status("WATCH THE SEQUENCE");
  for(const n of sequence){
    dots(n);
    flash(n,330);
    await sleep(520);
  }
  dots(-1);
  showing = false;
  pads.forEach(p=>p.disabled=false);
  oled("YOUR TURN", "REPEAT THE SEQUENCE");
  status("YOUR TURN — REPEAT IT");
}

async function nextRound(){
  inputIndex = 0;
  sequence.push(Math.floor(Math.random()*4));
  updateUI();
  await sleep(500);
  await showSequence();
}

function prepare(){
  sequence=[]; level=1; score=0; inputIndex=0; playing=false; showing=false;
  pads.forEach(p=>{p.disabled=true;p.classList.remove("active")});
  updateUI();
  oled("MIND GAME","PRESS START TO PLAY");
  status("READY — PRESS START");
  startButton.textContent="START GAME  ↗";
}

async function startGame(){
  uiSound("start");
  if(showing) return;
  playing=true; level=1; score=0; sequence=[]; inputIndex=0;
  startButton.textContent="RESTART GAME  ↗";
  updateUI();
  oled("INITIALIZING","GET READY...");
  status("BUILDING SEQUENCE");
  await sleep(650);
  await nextRound();
}

function handlePad(index){
  if(!playing || showing) return;

  // Make sure audio is unlocked by the same user interaction.
  getAudio();
  flash(index,180);

  if(index !== sequence[inputIndex]){
    if(!muted){
      uiSound("wrong");
      setTimeout(()=>uiSound("gameover"),90);
    }
    gameOver();
    return;
  }

  inputIndex++;

  if(inputIndex >= sequence.length){
    score++;
    level++;
    uiSound("correct");
    updateUI();
    oled("CORRECT!", "LEVEL "+level);
    status("NICE — NEXT ROUND");
    pads.forEach(p=>p.disabled=true);
    setTimeout(()=>{
      if(playing) nextRound();
    },700);
  }
}

function gameOver(){
  playing=false;
  showing=false;
  pads.forEach(p=>{p.disabled=true;p.classList.remove("active")});

  oled("GAME OVER","FINAL SCORE: "+score);
  status("WRONG SEQUENCE — RUN ENDED");
  startButton.textContent="PLAY AGAIN  ↗";

  saveLocalScore(player || "GUEST",score);
  submitGlobalScore(player || "GUEST", score, level);
  updateUI();

}

function getScores(){
  try{return JSON.parse(localStorage.getItem(leaderboardKey)) || []}
  catch{return []}
}
function saveLocalScore(name,value){
  if(!name || value<=0) return;
  const data=getScores();
  const found=data.find(x=>x.name.toLowerCase()===name.toLowerCase());
  if(found) found.score=Math.max(found.score,value);
  else data.push({name,score:value});
  data.sort((a,b)=>b.score-a.score);
  localStorage.setItem(leaderboardKey,JSON.stringify(data.slice(0,10)));
  renderLeaderboard();
}
async function submitGlobalScore(name, value, gameLevel) {
  if (!supabaseClient || !name || value <= 0) return;

  const cleanName = name.trim().slice(0, 20);

  try {
    const { data, error } = await supabaseClient.rpc(
      "submit_mind_game_score",
      {
        p_player_name: cleanName,
        p_score: value,
        p_level: gameLevel
      }
    );

    if (error) {
      console.error("Global score submission failed:", error);
      return;
    }

    await loadGlobalLeaderboard();
  } catch (error) {
    console.error("Supabase error:", error);
  }
}

async function loadGlobalLeaderboard() {
  if (!supabaseClient) {
    globalScores = [];
    renderLeaderboard();
    updateUI();
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("mind_game_leaderboard")
      .select("player_name, score, level")
      .order("score", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Global leaderboard loading failed:", error);
      renderLeaderboard();
      return;
    }

    globalScores = Array.isArray(data) ? data : [];
    renderLeaderboard();
    updateUI();
  } catch (error) {
    console.error("Supabase leaderboard error:", error);
    renderLeaderboard();
  }
}

function renderLeaderboard(){
  const data = globalScores.length ? globalScores : getScores();

  leaderboardList.innerHTML = "";

  if(!data.length){
    leaderboardList.innerHTML =
      '<div class="leader-row">' +
      '<span class="rank">—</span>' +
      '<span>No scores yet</span>' +
      '<span class="score">00</span>' +
      '</div>';
    return;
  }

  data.slice(0, 10).forEach((x, i) => {
    const row = document.createElement("div");

    row.className =
      "leader-row" +
      (player &&
       x.player_name &&
       x.player_name.toLowerCase() === player.toLowerCase()
        ? " you"
        : "");

    row.innerHTML = `
      <span class="rank">${String(i + 1).padStart(2, "0")}</span>
      <span>${escapeHtml(x.player_name || x.name || "PLAYER")}</span>
      <span class="score">${String(x.score || 0).padStart(2, "0")}</span>
    `;

    leaderboardList.appendChild(row);
  });
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function beginName(){
  uiSound("click");
  playerName.value=player;
  nameError.textContent="";
  openModal(nameModal);
  setTimeout(()=>playerName.focus(),50);
}

nameStart.addEventListener("click",()=>{
  const name=playerName.value.trim();
  if(name.length<2){nameError.textContent="ENTER AT LEAST 2 CHARACTERS";return;}
  player=name.slice(0,20);
  localStorage.setItem("YADUNAND_MIND_PLAYER",player);
  closeModal(nameModal);
  startGame();
});
playerName.addEventListener("keydown",e=>{if(e.key==="Enter")nameStart.click()});
nameClose.addEventListener("click",()=>closeModal(nameModal));
heroStart.addEventListener("click",()=>{
  document.querySelector("#game").scrollIntoView({behavior:"smooth", block:"start"});
  setTimeout(beginName, 420);
});
startButton.addEventListener("click",()=>{
  uiSound("click");
  player ? startGame() : beginName();
});
leaderboardButton.addEventListener("click", async ()=>{
  uiSound("click");
  openModal(leaderboardModal);
  leaderboardList.innerHTML =
    '<div class="leader-note">LOADING GLOBAL RANKING...</div>';
  await loadGlobalLeaderboard();
});
leaderboardClose.addEventListener("click",()=>closeModal(leaderboardModal));
muteButton.addEventListener("click",()=>{
  if(!muted) uiSound("click");
  muted=!muted;
  soundState.textContent=muted?"OFF":"ON";
  muteButton.style.color=muted?"#ff6171":"#849188";
});

volumeSlider.value = Math.round(volume * 100);
volumeValue.textContent = Math.round(volume * 100) + "%";
volumeSlider.addEventListener("input",()=>{
  volume = Number(volumeSlider.value) / 100;
  volumeValue.textContent = volumeSlider.value + "%";
  localStorage.setItem("YADUNAND_MIND_VOLUME", volumeSlider.value);
  if(volume > 0 && muted){
    muted = false;
    soundState.textContent = "ON";
    muteButton.style.color = "#849188";
  }
});
pads.forEach((p,i)=>p.addEventListener("click",()=>handlePad(i)));
document.addEventListener("keydown",e=>{
  if(["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) return;
  if(e.key>=1&&e.key<=4) handlePad(Number(e.key)-1);
  if(e.key==="Escape"){closeModal(nameModal);closeModal(leaderboardModal)}
});
[nameModal,leaderboardModal].forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m)}));

prepare();
renderLeaderboard();
loadGlobalLeaderboard();
