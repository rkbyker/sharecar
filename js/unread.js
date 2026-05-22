async function updateUnreadBadge(supabase, currentUser) {
  if (!supabase || !currentUser) return;
  try {
    const { data: asRequester } = await supabase
      .from('requests')
      .select('id')
      .eq('requester_id', currentUser.id);

    const { data: asOwner } = await supabase
      .from('requests')
      .select('id')
      .eq('owner_id', currentUser.id);

    const ids = [
      ...((asRequester || []).map(r => r.id)),
      ...((asOwner || []).map(r => r.id))
    ];

    if (!ids.length) return;

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
