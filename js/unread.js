async function updateUnreadBadge(supabase, currentUser) {
  const sb = supabase || window._supabase;
  if (!sb || !currentUser) return;
  try {
    const { data: asRequester } = await sb
      .from('requests')
      .select('id')
      .eq('requester_id', currentUser.id);

    const { data: asOwner } = await sb
      .from('requests')
      .select('id')
      .eq('owner_id', currentUser.id);

    const ids = [
      ...((asRequester || []).map(r => r.id)),
      ...((asOwner || []).map(r => r.id))
    ];

    if (!ids.length) {
      document.querySelectorAll('.nav-msg-badge').forEach(b => b.style.display = 'none');
      return;
    }

    const { data: unreadMsgs } = await sb
      .from('messages')
      .select('request_id')
      .in('request_id', ids)
      .neq('sender_id', currentUser.id)
      .eq('read', false);

    const uniqueChats = new Set((unreadMsgs || []).map(m => m.request_id)).size;

    document.querySelectorAll('.nav-msg-badge').forEach(function(badge) {
      if (uniqueChats > 0) {
        badge.textContent = uniqueChats > 99 ? '99+' : uniqueChats;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  } catch(e) { console.log('unread error:', e); }
}
