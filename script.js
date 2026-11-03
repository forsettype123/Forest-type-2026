// 🎮 FOREST TYPE 2026 - Game Assets Path
const ASSETS = {
  // Backgrounds
  forest: "game-assets/backgrounds/forest_bg.jpg",
  boosHome: "game-assets/backgrounds/boos_home_bg.jpg",
  
  // Characters
  boo: "game-assets/characters/boo.png",
  ollie: "game-assets/characters/ollie.png",
  battyLeader: "game-assets/characters/batty_leader.png",
  batA: "game-assets/characters/a_the_bat.png",
  batB: "game-assets/characters/b_the_bat.png",
  batC: "game-assets/characters/c_the_bat.png",
  
  // Video
  intro: "game-assets/videos/intro.mp4"
};

// 🌲 Backgrounds Load
function loadBackgrounds() {
  document.body.style.backgroundImage = `url('${ASSETS.forest}')`;
  document.body.style.backgroundSize = "cover";
  console.log("✅ Forest Background Loaded!");
}

// 🦇 Characters Load
function loadCharacters() {
  const booImg = document.getElementById("boo");
  const ollieImg = document.getElementById("ollie");
  
  if(booImg) booImg.src = ASSETS.boo;
  if(ollieImg) ollieImg.src = ASSETS.ollie;
  
  console.log("✅ All Characters Loaded!");
}

// 🚀 Game Start
window.onload = function() {
  loadBackgrounds();
  loadCharacters();
  console.log("🎉 FOREST TYPE 2026 READY!");
}; 
