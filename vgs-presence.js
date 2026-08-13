import { supabase } from './vgs-auth.js?v=12';

const CHANNEL_NAME = 'vgs-team-presence';
const HEARTBEAT_MS = 15000;
const STALE_MS = 45000;

export async function startVgsPresence({ name = 'VGS Team', role = 'admin' } = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { stop: () => {}, setAvailable: () => {} };

  let available = true;
  const channel = supabase.channel(CHANNEL_NAME, { config: { presence: { key: user.id } } });

  const track = async () => {
    if (channel.state !== 'joined') return;
    await channel.track({ user_id: user.id, name, role, available, heartbeat: Date.now() });
  };

  channel.on('presence', { event: 'sync' }, track);
  await channel.subscribe(async status => {
    if (status === 'SUBSCRIBED') await track();
  });

  const timer = setInterval(track, HEARTBEAT_MS);

  const setAvailable = async value => {
    available = Boolean(value);
    await track();
  };

  const stop = async () => {
    clearInterval(timer);
    await supabase.removeChannel(channel);
  };

  return { setAvailable, stop };
}

export async function getVgsTeamAvailability() {
  const channel = supabase.channel(`${CHANNEL_NAME}-reader-${crypto.randomUUID()}`, { config: { presence: { key: `reader-${crypto.randomUUID()}` } } });
  return new Promise(resolve => {
    let done = false;
    const finish = value => { if (done) return; done = true; supabase.removeChannel(channel); resolve(value); };
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const now = Date.now();
      const people = Object.values(state).flat().filter(p => p && p.available && now - Number(p.heartbeat || 0) < STALE_MS);
      finish({ online: people.length > 0, count: people.length, people });
    });
    channel.subscribe(status => {
      if (status !== 'SUBSCRIBED') finish({ online: false, count: 0, people: [] });
    });
    setTimeout(() => finish({ online: false, count: 0, people: [] }), 5000);
  });
}
