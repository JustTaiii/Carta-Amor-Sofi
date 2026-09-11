const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// Ambient hearts: a little movement, even before the letter is opened.
const heartsRain = $('.hearts-rain');
for (let i = 0; i < 22; i += 1) {
  const heart = document.createElement('span');
  heart.className = 'falling-heart';
  heart.textContent = i % 5 === 0 ? '♡' : '♥';
  heart.style.setProperty('--left', `${Math.round(Math.random() * 100)}%`);
  heart.style.setProperty('--size', `${Math.round(9 + Math.random() * 13)}px`);
  heart.style.setProperty('--duration', `${Math.round(11 + Math.random() * 15)}s`);
  heart.style.setProperty('--delay', `${Math.round(Math.random() * -25)}s`);
  heart.style.setProperty('--drift', `${Math.round(-55 + Math.random() * 110)}px`);
  heart.style.setProperty('--rotation', `${Math.round(-30 + Math.random() * 60)}deg`);
  heartsRain.appendChild(heart);
}

// Personal letter preview.
const recipientInput = $('#recipientInput');
const messageInput = $('#messageInput');
const signatureInput = $('#signatureInput');
const previewGreeting = $('#previewGreeting');
const previewMessage = $('#previewMessage');
const previewSignature = $('#previewSignature');
const characterCount = $('#characterCount');

function updateLetterPreview() {
  const recipient = recipientInput.value.trim() || 'mi persona favorita';
  const message = messageInput.value.trim() || 'Escribe aquí unas palabras que se queden a vivir en el corazón...';
  const signature = signatureInput.value.trim() || 'tu persona';
  previewGreeting.textContent = `Para ${recipient},`;
  previewMessage.textContent = message;
  previewSignature.innerHTML = `Con amor,<br /><span>${escapeHtml(signature)}</span>`;
  characterCount.textContent = messageInput.value.length;
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

[recipientInput, messageInput, signatureInput].forEach((input) => input.addEventListener('input', updateLetterPreview));
updateLetterPreview();

// Wax seal choices update both the editor and the virtual envelope.
let selectedSeal = 'rose';
const sealSymbols = { rose: '♥', burgundy: '✦', gold: '∞' };
$$('.seal-option').forEach((option) => {
  option.addEventListener('click', () => {
    selectedSeal = option.dataset.seal;
    $$('.seal-option').forEach((item) => item.classList.toggle('active', item === option));
    $('.illustration-seal').className = `illustration-seal seal-${selectedSeal}`;
    $('.modal-seal').className = `modal-seal wax-${selectedSeal}`;
    $('.modal-seal span').textContent = sealSymbols[selectedSeal];
    showToast(`Sello ${option.querySelector('small').textContent.toLowerCase()} elegido`);
  });
});

// Floral frames.
$$('.border-option').forEach((option) => {
  option.addEventListener('click', () => {
    const border = option.dataset.border;
    $$('.border-option').forEach((item) => item.classList.toggle('active', item === option));
    $('#galleryFrame').className = `gallery-frame frame-${border}`;
    showToast(`Borde ${option.querySelector('small').textContent.toLowerCase()} aplicado`);
  });
});

// The envelope modal opens with a flap animation and uses the current inputs.
const envelopeModal = $('#envelopeModal');
const modalEnvelope = $('#modalEnvelope');
const modalSeal = $('#modalSeal');
const modalInstruction = $('#modalInstruction');
let envelopeIsOpen = false;

function openModal() {
  $('#modalTitle').textContent = `Para ${recipientInput.value.trim() || 'mi persona favorita'},`;
  $('#modalMessage').textContent = messageInput.value.trim() || 'Escribe aquí unas palabras que se queden a vivir en el corazón...';
  $('#modalSignature').textContent = signatureInput.value.trim() || 'tu persona';
  envelopeModal.classList.add('is-visible');
  envelopeModal.setAttribute('aria-hidden', 'false');
  modalEnvelope.classList.remove('is-open');
  envelopeIsOpen = false;
  modalInstruction.textContent = 'Pulsa el sello para abrir tu carta';
  window.setTimeout(() => modalSeal.focus(), 300);
}

function closeModal() {
  envelopeModal.classList.remove('is-visible');
  envelopeModal.setAttribute('aria-hidden', 'true');
  modalEnvelope.classList.remove('is-open');
  envelopeIsOpen = false;
}

$('#openEnvelopeButton').addEventListener('click', openModal);
$('#previewButton').addEventListener('click', openModal);
$$('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && envelopeModal.classList.contains('is-visible')) closeModal(); });
modalSeal.addEventListener('click', () => {
  envelopeIsOpen = !envelopeIsOpen;
  modalEnvelope.classList.toggle('is-open', envelopeIsOpen);
  modalInstruction.textContent = envelopeIsOpen ? 'Tu carta está abierta · pulsa el sello para guardarla' : 'Pulsa el sello para abrir tu carta';
});

// Music toggle: a tiny Web Audio composition, no download or external audio required.
let audioContext;
let violinLoop;
function startViolin() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0.0001, audioContext.currentTime);
  master.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 1.2);
  master.connect(audioContext.destination);
  const notes = [261.63, 293.66, 329.63, 392, 329.63, 293.66, 261.63, 220];
  let index = 0;
  const playNote = () => {
    if (!$('#musicToggle') || $('#musicToggle').getAttribute('aria-checked') !== 'true') return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = notes[index % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + .08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
    oscillator.connect(gain).connect(master);
    oscillator.start(now);
    oscillator.stop(now + 1.3);
    index += 1;
    violinLoop = window.setTimeout(playNote, 700);
  };
  playNote();
}
function stopViolin() {
  if (violinLoop) window.clearTimeout(violinLoop);
  violinLoop = null;
  if (audioContext) audioContext.suspend();
}
$('#musicToggle').addEventListener('click', (event) => {
  const toggle = event.currentTarget;
  const on = toggle.getAttribute('aria-checked') === 'true';
  toggle.setAttribute('aria-checked', String(!on));
  if (!on) { startViolin(); showToast('La melodía empieza a sonar suavemente'); }
  else { stopViolin(); showToast('Melodía pausada'); }
});

// Personal photo gallery with local previews.
const photoUpload = $('#photoUpload');
const galleryGrid = $('#galleryGrid');
const addPhotoTile = $('#addPhotoTile');
let uploadedPhotos = 0;
function addLocalPhoto(file) {
  if (!file.type.startsWith('image/') || uploadedPhotos >= 12) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const figure = document.createElement('figure');
    figure.className = 'photo-tile';
    figure.innerHTML = `<img src="${reader.result}" alt="Foto de recuerdo añadida" /><figcaption>Un recuerdo más <span>♡</span></figcaption>`;
    galleryGrid.insertBefore(figure, addPhotoTile);
    uploadedPhotos += 1;
    showToast(uploadedPhotos === 1 ? 'Tu recuerdo se ha añadido al álbum' : 'Foto añadida al álbum');
  });
  reader.readAsDataURL(file);
}
photoUpload.addEventListener('change', (event) => [...event.target.files].forEach(addLocalPhoto));
addPhotoTile.addEventListener('click', () => photoUpload.click());

// Countdown to the chosen date.
const specialDate = $('#specialDate');
const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
function updateCountdown() {
  const target = new Date(`${specialDate.value}T00:00:00`);
  const now = new Date();
  const distance = target.getTime() - now.getTime();
  const safeDistance = Math.max(distance, 0);
  const days = Math.floor(safeDistance / 86400000);
  const hours = Math.floor((safeDistance % 86400000) / 3600000);
  const minutes = Math.floor((safeDistance % 3600000) / 60000);
  $('#daysLeft').textContent = String(days).padStart(3, '0');
  $('#hoursLeft').textContent = String(hours).padStart(2, '0');
  $('#minutesLeft').textContent = String(minutes).padStart(2, '0');
  const isToday = target.toDateString() === now.toDateString();
  $('#countdownNote').textContent = distance <= 0
    ? (isToday ? 'Hoy es nuestro día especial. ✦' : `Nuestro día fue el ${dateFormatter.format(target)}. ✦`)
    : `Nos vemos el ${dateFormatter.format(target)}.`;
  const progress = distance <= 0 ? 100 : Math.min(94, Math.max(12, 100 - (days / 365) * 100));
  $('#countdownProgress').style.width = `${progress}%`;
}
specialDate.addEventListener('change', updateCountdown);
updateCountdown();
window.setInterval(updateCountdown, 30000);

// Secret poem generator.
const poems = [
  'Tu risa hace hogar en mi pecho,\ny tu nombre, primavera en mis días.',
  'Si el mundo se detiene,\nque nos encuentre de la mano.',
  'Te elegiría en cada mapa,\nen cada vida, en cada vuelta del sol.',
  'Entre todos los lugares del mundo,\nmi sitio favorito siempre es contigo.',
  'Guardé un pedacito de cielo\nen la forma exacta de tu abrazo.',
  'No sé contar estrellas,\npero sí las veces que pienso en ti.'
];
$('#poemButton').addEventListener('click', () => {
  const poemText = $('#poemText');
  poemText.style.opacity = '0';
  window.setTimeout(() => {
    poemText.textContent = poems[Math.floor(Math.random() * poems.length)];
    poemText.style.opacity = '1';
  }, 180);
  showToast('Tu poema secreto está listo');
});

// Click-to-pin map. Existing pins can be selected from the side list.
const memoryMap = $('#memoryMap');
const placesList = $('#placesList');
let customPinCount = 0;
function focusPin(pin) {
  $$('.map-pin').forEach((item) => item.classList.toggle('selected', item === pin));
  $$('.place-row').forEach((row) => row.classList.toggle('active', row.dataset.target === pin.classList[1]));
}
$$('.map-pin').forEach((pin) => {
  pin.addEventListener('click', (event) => { event.stopPropagation(); focusPin(pin); });
});
$$('.place-row').forEach((row) => {
  row.addEventListener('click', () => {
    const pin = $(`.${row.dataset.target}`);
    if (pin) { focusPin(pin); pin.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });
});
function addPlace(position = null) {
  const name = $('#placeInput').value.trim();
  if (!name) { showToast('Escribe un nombre para el recuerdo'); $('#placeInput').focus(); return; }
  customPinCount += 1;
  const left = position ? position.left : 15 + Math.round(Math.random() * 70);
  const top = position ? position.top : 18 + Math.round(Math.random() * 63);
  const className = `custom-pin-${customPinCount}`;
  const pin = document.createElement('div');
  pin.className = `map-pin ${className}`;
  pin.style.left = `${left}%`; pin.style.top = `${top}%`; pin.dataset.label = name;
  pin.innerHTML = `<span>♥</span><b>${escapeHtml(name)}</b>`;
  pin.addEventListener('click', (event) => { event.stopPropagation(); focusPin(pin); });
  memoryMap.appendChild(pin);
  const row = document.createElement('button');
  row.type = 'button'; row.className = 'place-row'; row.dataset.target = className;
  row.innerHTML = `<span class="place-dot">♥</span><span><strong>${escapeHtml(name)}</strong><small>Recuerdo añadido por ustedes</small></span><i>↗</i>`;
  row.addEventListener('click', () => focusPin(pin));
  placesList.appendChild(row);
  $('#pinCount').textContent = String(3 + customPinCount).padStart(2, '0');
  $('#placeInput').value = '';
  $('#placesEmpty').hidden = true;
  focusPin(pin);
  showToast('Nuevo lugar fijado en vuestro mapa');
}
$('#addPlaceButton').addEventListener('click', addPlace);
$('#placeInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') addPlace(); });
memoryMap.addEventListener('click', (event) => {
  if (event.target.closest('.map-pin')) return;
  const name = $('#placeInput').value.trim();
  if (!name) { $('#placeInput').focus(); showToast('Escribe el recuerdo y vuelve a tocar el mapa'); return; }
  const mapBounds = memoryMap.getBoundingClientRect();
  const position = {
    left: Math.round(((event.clientX - mapBounds.left) / mapBounds.width) * 100),
    top: Math.round(((event.clientY - mapBounds.top) / mapBounds.height) * 100),
  };
  addPlace({ left: Math.min(89, Math.max(11, position.left)), top: Math.min(82, Math.max(18, position.top)) });
});

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}
