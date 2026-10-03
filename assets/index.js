(() => {
  const routes = window.BUS_ROUTES;
  const grid = document.querySelector('#route-grid');
  const search = document.querySelector('#route-search');
  const empty = document.querySelector('#empty-state');
  document.querySelector('#route-count').textContent = `${routes.length} 条线路`;
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const categoryClass = category => ({
    '城区常规': 'route-card--city',
    '夜间线路': 'route-card--night',
    '龙之梦方向': 'route-card--resort',
    '城乡公交': 'route-card--rural',
    '镇域公交': 'route-card--town',
    '景区公交': 'route-card--scenic',
    '市域城际': 'route-card--intercity',
    '跨省跨县': 'route-card--regional'
  }[category] || 'route-card--other');
  const routeNameClass = name => {
    if (/^龙之梦园区专线(?:二|三)?$/.test(name)) return ' route-name--extended route-name--long';
    if (!/\d/.test(name) && Array.from(name).length >= 8) return ' route-name--extended route-name--long';
    return /^(?=[A-Z0-9]*\d)[A-Z0-9]+路(?:支)?$/i.test(name) ? '' : ' route-name--extended';
  };
  const card = route => `<a class="route-card ${categoryClass(route.category)}" href="route.html?id=${encodeURIComponent(route.id)}" aria-label="查看${escapeHtml(route.name)}详情">
    <div class="route-card-top"><strong class="route-name${routeNameClass(route.name)}">${escapeHtml(route.name)}</strong></div>
    <div class="route-card-bottom"><span class="direction-arrow" aria-hidden="true">↕</span><div><b>${escapeHtml(route.from)}</b><i></i><b>${escapeHtml(route.to)}</b></div></div>
  </a>`;
  function render(query = '') {
    const key = query.trim().toLowerCase();
    const matches = routes.filter(route => {
      const stations = route.directions.flatMap(direction => direction.stations.map(station => station.name));
      return !key || [route.name, route.short, route.category, route.from, route.to, ...stations].join(' ').toLowerCase().includes(key);
    });
    grid.innerHTML = matches.map(card).join('');
    empty.hidden = matches.length !== 0;
  }
  search.addEventListener('input', event => render(event.target.value));
  render();
})();
