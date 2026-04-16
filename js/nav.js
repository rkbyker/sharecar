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
