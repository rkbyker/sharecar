async function updateUnreadBadge(supabase, currentUser) {
  if (!supabase || !currentUser) return;
  try {
    const { data: reqs } = await supabase
      .from('ride_requests')
      .select('id')
      .or('driver_id.eq.' + currentUser.id + ',passenger_id.eq.' + currentUser.id)
      .in('status', ['accepted', 'pending', 'completed']);

    if (!reqs || !reqs.length) return;
    const ids = reqs.map(r => r.id);

    const { data: unreadMsgs } = await supabase
      .from('messages')
      .select('request_id')
      .in('request_id', ids)
      .neq('sender_id', currentUser.id)
      .eq('read', false);

    const total = unreadMsgs ? unreadMsgs.length : 0;
    document.querySelectorAll('.nav-msg-badge').forEach(function(badge) {
      if (total > 0) {
        badge.textContent = total > 99 ? '99+' : total;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  } catch(e) {}
}
