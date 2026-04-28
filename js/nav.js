const stack = [];

window.scGoBack = function() {
  if (stack.length > 1) {
    stack.pop();
    window.location.href = stack[stack.length - 1];
  } else {
    history.back();
  }
};

(function() {
  const current = location.pathname + location.search;
  if (!stack.length || stack[stack.length - 1] !== current) {
    stack.push(current);
  }
})();


// Бейдж непрочитанных сообщений
async function updateMsgBadge(supabase, userId) {
  try {
    // Получаем все request_id пользователя
    const { data: reqs } = await supabase
      .from('requests')
      .select('id')
      .or(`requester_id.eq.${userId},owner_id.eq.${userId}`);

    if (!reqs || !reqs.length) return;
    const ids = reqs.map(r => r.id);

    // Считаем непрочитанные — сообщения не от меня без отметки прочтения
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('request_id', ids)
      .neq('sender_id', userId)
      .eq('is_read', false);

    const badge = document.querySelector('.nav-msg-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch(e) {}
}

window.updateMsgBadge = updateMsgBadge;
