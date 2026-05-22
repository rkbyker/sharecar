async function updateUnreadBadge(supabase, currentUser) {
  if (!supabase || !currentUser) { console.log('unread: no supabase or user'); return; }
  try {
    const { data: reqs, error: reqErr } = await supabase
      .from('ride_requests')
      .select('id')
      .or('driver_id.eq.' + currentUser.id + ',passenger_id.eq.' + currentUser.id)
      .in('status', ['accepted', 'pending', 'completed']);

    console.log('unread reqs:', reqs, reqErr);
    if (!reqs || !reqs.length) return;
    const ids = reqs.map(r => r.id);

    const { data: unreadMsgs, error: msgErr } = await supabase
      .from('messages')
      .select('request_id')
      .in('request_id', ids)
      .neq('sender_id', currentUser.id)
      .eq('read', false);

    console.log('unread msgs:', unreadMsgs, msgErr);
    const total = unreadMsgs ? unreadMsgs.length : 0;
    console.log('unread total:', total);
    document.querySelectorAll('.nav-msg-badge').forEach(function(badge) {
      if (total > 0) {
        badge.textContent = total > 99 ? '99+' : total;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  } catch(e) { console.log('unread error:', e); }
}
