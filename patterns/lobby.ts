/**
 * lobby.ts — a drop-in peer-to-peer lobby built on net.ts.
 *
 * Gives every multiplayer game the same battle-tested "create a room, share a
 * link, wait for friends, host starts" flow with zero backend:
 *   - a short human room code (also the ?room= param and the Trystero room id)
 *   - a one-tap invite link + copy button (+ Web Share on mobile)
 *   - a "join by code" entry screen (createRoomEntry) so friends who can't open
 *     the link can just TYPE the code — the link is a shortcut, never the only way in
 *   - a live player roster with names, ready toggles, and the host badge
 *   - host-only Start button, gated on min players + everyone ready
 *   - a shared RNG seed broadcast at start so all peers agree (see rng.ts)
 *
 * The host is elected by net.ts (min peer id). Lobby state is gossiped: each
 * peer broadcasts its {name,ready}; newcomers request a resync. On Start the
 * host broadcasts {seed}; every client resolves onStart with the same seed.
 *
 * HOST TRANSFER: net.ts re-elects the smallest remaining peer id the moment the
 * host leaves, so the room never dies with its host. The lobby watches for this
 * and flashes "you're the host now" when the baton passes to this peer; in-game,
 * wire net's onHostChange so the promoted peer takes over the authoritative
 * simulation (see patterns/README.md → "The host left, now what").
 *
 * COPY THIS FILE into src/ and style .lobby-* + .room-entry/.re-* to match the game.
 *
 *   // Menu → "Play with friends": show the entry screen unless deep-linked.
 *   const deep = new URL(location.href).searchParams.get('room');
 *   if (deep) openRoom(normalizeRoomCode(deep));
 *   else createRoomEntry({ container, onSubmit: (code) => openRoom(code), onCancel: toMenu });
 *
 *   function openRoom(code) {
 *     const net = createNet({ appId: 'my-slug', roomId: code });
 *     createLobby({ container, net, roomCode: code, playerName, minPlayers: 2,
 *       onStart: ({ seed, players, isHost }) => startGame(seed, players, isHost, net) });
 *   }
 */

import type { Net, PeerId } from './net';

export interface LobbyPlayer {
  id: PeerId;
  name: string;
  ready: boolean;
  isHost: boolean;
  isSelf: boolean;
}

export interface LobbyStartInfo {
  seed: number;
  players: LobbyPlayer[];
  isHost: boolean;
}

export interface LobbyConfig {
  container: HTMLElement;
  net: Net;
  /** The shareable room code (also in the URL). */
  roomCode: string;
  /** This player's display name. */
  playerName: string;
  minPlayers?: number;
  maxPlayers?: number;
  /** Fired on every peer when the host starts. Same seed everywhere. */
  onStart: (info: LobbyStartInfo) => void;
  /** Optional: render a "Leave room" button that calls this (back to menu). */
  onCancel?: () => void;
}

interface Presence {
  name: string;
  ready: boolean;
}

/** Read ?room= from the URL, or mint a fresh 4-char code and push it into the URL. */
export function getOrCreateRoomCode(): string {
  const url = new URL(location.href);
  const existing = url.searchParams.get('room');
  if (existing) return normalizeRoomCode(existing);
  const code = mintCode();
  url.searchParams.set('room', code);
  history.replaceState(null, '', url.toString());
  return code;
}

/** A fresh random room code. Same alphabet the entry screen accepts. */
export function mintCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no I/O/0/1/L ambiguity
  let out = '';
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/**
 * Canonicalise a hand-typed (or link) code so every peer that means the same
 * room lands on the same Trystero room id: upper-case, drop anything that isn't
 * A–Z/0–9 (spaces, dashes, the ambiguous I/O/L/0/1 a user might mistype stay as
 * typed if they're still alphanumerics), cap at 8.
 */
export function normalizeRoomCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

/** Push a chosen room code into the URL so the invite link + a refresh both work. */
export function setRoomInUrl(roomCode: string): void {
  const url = new URL(location.href);
  url.searchParams.set('room', roomCode);
  url.hash = '';
  history.replaceState(null, '', url.toString());
}

export function inviteLink(roomCode: string): string {
  const url = new URL(location.href);
  url.searchParams.set('room', roomCode);
  url.hash = '';
  return url.toString();
}

export interface RoomEntryConfig {
  container: HTMLElement;
  /**
   * Chosen a room. `created` is true for a brand-new hosted room, false when the
   * player typed/joined an existing code. Wire this to create the net + lobby.
   */
  onSubmit: (roomCode: string, created: boolean) => void;
  /** Optional back handler (renders a "Back" button). */
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * The "create or join a room" screen shown before the lobby. Lets a player mint
 * a fresh room OR type a friend's code directly, so the invite link is a
 * convenience, never the only way in. Style .room-entry / .re-* in the game.
 * Skip it (call onSubmit straight away) when the URL already carries ?room=.
 */
export function createRoomEntry(config: RoomEntryConfig): { destroy: () => void } {
  const { container } = config;
  const title = config.title ?? 'Play with friends';
  const subtitle = config.subtitle ?? 'Start a new room, or enter a code to join a friend.';

  container.innerHTML = `
    <div class="room-entry">
      <div class="re-head">
        <h2 class="re-title">${escapeHtml(title)}</h2>
        <p class="re-sub">${escapeHtml(subtitle)}</p>
      </div>
      <button class="lobby-btn re-create" type="button">Create a room</button>
      <div class="re-divider"><span>or join a friend</span></div>
      <form class="re-join" novalidate>
        <input class="re-input" type="text" inputmode="latin" autocomplete="off"
          autocapitalize="characters" spellcheck="false" maxlength="8"
          placeholder="Enter room code" aria-label="Room code" />
        <button class="lobby-btn re-go" type="submit">Join</button>
      </form>
      <p class="re-error" role="alert" aria-live="polite"></p>
      ${config.onCancel ? '<button class="lobby-btn ghost re-cancel" type="button">Back</button>' : ''}
    </div>`;

  const input = container.querySelector<HTMLInputElement>('.re-input')!;
  const errEl = container.querySelector<HTMLElement>('.re-error')!;
  const showErr = (msg: string) => {
    errEl.textContent = msg;
  };

  // Keep the field showing the canonical code as the player types.
  input.addEventListener('input', () => {
    const caretAtEnd = input.selectionStart === input.value.length;
    input.value = normalizeRoomCode(input.value);
    if (caretAtEnd) input.setSelectionRange(input.value.length, input.value.length);
    if (errEl.textContent) showErr('');
  });

  container.querySelector('.re-create')?.addEventListener('click', () => {
    config.onSubmit(mintCode(), true);
  });

  container.querySelector<HTMLFormElement>('.re-join')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = normalizeRoomCode(input.value);
    if (code.length < 3) {
      showErr('Enter the room code your host shared (e.g. K7QP).');
      input.focus();
      return;
    }
    config.onSubmit(code, false);
  });

  if (config.onCancel) {
    container.querySelector('.re-cancel')?.addEventListener('click', () => config.onCancel!());
  }

  return {
    destroy() {
      container.innerHTML = '';
    },
  };
}

export function createLobby(config: LobbyConfig): { destroy: () => void } {
  const { net, container } = config;
  const minPlayers = config.minPlayers ?? 2;
  const maxPlayers = config.maxPlayers ?? 8;

  const presence = new Map<PeerId, Presence>();
  presence.set(net.selfId, { name: config.playerName, ready: false });
  let started = false;

  // Channels (names <= 12 bytes). 'pres' = presence, 'preq' = resync request,
  // 'go' = host start signal carrying the seed.
  const sendPres = net.channel<Presence & { id: PeerId }>('pres', (p) => {
    presence.set(p.id, { name: p.name, ready: p.ready });
    render();
  });
  const reqSync = net.channel<null>('preq', (_d, from) => {
    // Someone joined — reply with our presence directly to them.
    sendPres({ id: net.selfId, ...self() }, from);
  });
  const sendGo = net.channel<{ seed: number }>('go', ({ seed }) => begin(seed));

  function self(): Presence {
    return presence.get(net.selfId)!;
  }
  function broadcastPresence(): void {
    sendPres({ id: net.selfId, ...self() });
  }

  // When a peer joins, share our presence and ask for theirs.
  const origList = container;
  net; // keep reference obvious for readers

  function players(): LobbyPlayer[] {
    const host = net.host();
    return net
      .peers()
      .map((id) => {
        const p = presence.get(id) ?? { name: '…', ready: false };
        return { id, name: p.name, ready: p.ready, isHost: id === host, isSelf: id === net.selfId };
      })
      .sort((a, b) => (a.isSelf ? -1 : b.isSelf ? 1 : a.id.localeCompare(b.id)));
  }

  function canStart(): boolean {
    const ps = players();
    return net.isHost() && ps.length >= minPlayers && ps.every((p) => p.ready || p.isHost);
  }

  function begin(seed: number): void {
    if (started) return;
    started = true;
    config.onStart({ seed, players: players(), isHost: net.isHost() });
  }

  function toggleReady(): void {
    const me = self();
    presence.set(net.selfId, { ...me, ready: !me.ready });
    broadcastPresence();
    render();
  }

  async function share(): Promise<void> {
    const link = inviteLink(config.roomCode);
    const shareData = { title: 'Join my game', text: `Room ${config.roomCode}`, url: link };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      flash('Invite link copied');
    } catch {
      flash(link);
    }
  }

  function flash(msg: string): void {
    const el = container.querySelector<HTMLElement>('.lobby-flash');
    if (el) {
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 1800);
    }
  }

  function start(): void {
    if (!canStart()) return;
    const seed = (Math.floor(Math.random() * 0xffffffff)) >>> 0;
    sendGo({ seed }); // tell everyone
    begin(seed); // and start locally
  }

  function render(): void {
    if (started) return;
    const ps = players();
    const link = inviteLink(config.roomCode);
    origList.innerHTML = `
      <div class="lobby">
        <div class="lobby-head">
          <h2 class="lobby-title">Room <span class="lobby-code">${escapeHtml(config.roomCode)}</span></h2>
          <p class="lobby-sub">${ps.length}/${maxPlayers} players · peer-to-peer, no server</p>
        </div>
        <div class="lobby-invite">
          <input class="lobby-link" readonly value="${escapeHtml(link)}" aria-label="Invite link" />
          <button class="lobby-btn lobby-share" type="button">Invite</button>
        </div>
        <ul class="lobby-players">
          ${ps
            .map(
              (p) => `<li class="lobby-player${p.isSelf ? ' is-self' : ''}">
                <span class="lobby-dot ${p.ready || p.isHost ? 'ready' : ''}"></span>
                <span class="lobby-name">${escapeHtml(p.name)}${p.isSelf ? ' (you)' : ''}</span>
                ${p.isHost ? '<span class="lobby-badge">HOST</span>' : p.ready ? '<span class="lobby-badge ok">READY</span>' : ''}
              </li>`,
            )
            .join('')}
        </ul>
        ${
          ps.length < minPlayers
            ? `<div class="lobby-searching"><span class="spinner" aria-hidden="true"></span>
                 <span>Looking for ${minPlayers - ps.length} more player${minPlayers - ps.length === 1 ? '' : 's'}… share the invite link</span></div>`
            : ''
        }
        <div class="lobby-actions">
          ${
            net.isHost()
              ? `<button class="lobby-btn lobby-start" type="button" ${canStart() ? '' : 'disabled'}>
                   ${ps.length < minPlayers ? `Waiting for ${minPlayers - ps.length} more…` : 'Start game'}
                 </button>`
              : `<button class="lobby-btn lobby-ready" type="button">${self().ready ? 'Not ready' : "I'm ready"}</button>
                 <p class="lobby-wait"><span class="spinner sm" aria-hidden="true"></span> Waiting for the host to start…</p>`
          }
          ${config.onCancel ? '<button class="lobby-btn ghost lobby-cancel" type="button">Leave room</button>' : ''}
        </div>
        <div class="lobby-flash" role="status" aria-live="polite"></div>
      </div>`;

    container.querySelector('.lobby-share')?.addEventListener('click', () => void share());
    container.querySelector('.lobby-ready')?.addEventListener('click', toggleReady);
    container.querySelector('.lobby-start')?.addEventListener('click', start);
    container.querySelector('.lobby-cancel')?.addEventListener('click', () => config.onCancel?.());
    container.querySelector<HTMLInputElement>('.lobby-link')?.addEventListener('focus', (e) => {
      (e.target as HTMLInputElement).select();
    });
  }

  // net.ts fires onPeers/onHostChange through the handlers passed to createNet;
  // to stay decoupled we also poll lightly on our own channels. Re-render when a
  // peer's presence arrives (handled above) and on a short roster poll. The poll
  // also spots a host transfer (net.ts re-elects when the host leaves) so a newly
  // promoted peer gets a heads-up that the Start button is now theirs.
  let lastHost = net.host();
  const poll = setInterval(() => {
    if (started) return;
    reqSync(null);
    const host = net.host();
    render();
    if (host !== lastHost) {
      const wasHost = lastHost === net.selfId;
      lastHost = host;
      if (net.isHost() && !wasHost) flash("The host left — you're the host now");
    }
  }, 1500);

  broadcastPresence();
  reqSync(null);
  render();

  return {
    destroy() {
      clearInterval(poll);
    },
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}
