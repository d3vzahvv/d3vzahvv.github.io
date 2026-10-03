(() => {
  const id = new URLSearchParams(location.search).get('id');
  const route = window.BUS_ROUTES.find(item => item.id === id);
  const detail = document.querySelector('#detail');
  const missing = document.querySelector('#not-found');
  if (!route) { missing.hidden = false; return; }
  const $ = selector => document.querySelector(selector);
  const directionPicker = $('#direction-picker');
  const stationList = $('#station-list');
  const dataNotice = $('#data-notice');
  const esc = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
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
  detail.classList.add(categoryClass(route.category));
  const routesByStation = new Map();
  window.BUS_ROUTES.forEach(candidate => {
    const stationNames = new Set(candidate.directions.flatMap(direction => direction.stations.map(station => station.name)));
    stationNames.forEach(stationName => {
      if (!routesByStation.has(stationName)) routesByStation.set(stationName, []);
      routesByStation.get(stationName).push(candidate);
    });
  });
  const transferHtml = stationName => {
    const transfers = (routesByStation.get(stationName) || []).filter(candidate => candidate.id !== route.id);
    if (!transfers.length) return '';
    const links = transfers.map(candidate => `<a class="${categoryClass(candidate.category)}" href="route.html?id=${encodeURIComponent(candidate.id)}" title="查看${esc(candidate.name)}">${esc(candidate.name)}</a>`).join('');
    return `<span class="station-transfers"><em>换乘</em>${links}</span>`;
  };
  const shareTitle = `${route.name} · 长兴公交`;
  const shareDescription = `查看${route.name}的运营方向、班次、票价、沿途站点及同站换乘线路。`;
  document.title = shareTitle;
  document.querySelector('meta[property="og:title"]').content = shareTitle;
  document.querySelector('meta[property="og:description"]').content = shareDescription;
  document.querySelector('meta[name="twitter:title"]').content = shareTitle;
  document.querySelector('meta[name="twitter:description"]').content = shareDescription;
  $('#crumb-name').textContent = route.name;
  const routeNumber = route.name.match(/\d+/);
  const textName = route.name.replace(/^长兴公交/, '');
  $('#hero-badge').textContent = routeNumber ? routeNumber[0] : Array.from(textName)[0] || '线';
  $('#route-title').textContent = `长兴公交${route.name}`;
  $('#service-text').textContent = route.service;
  $('#price-text').textContent = route.price || '请以现场公示为准';
  $('#operator-text').textContent = route.operator;
  $('#crumb-category').textContent = route.category;
  $('#route-eyebrow').textContent = route.category;
  const stationRecords = route.directions.reduce((total, direction) => total + direction.stations.length, 0);
  $('#route-facts').innerHTML = `<span>${route.directions.length} 个运营方向</span><span>${stationRecords} 条站点记录</span><span>${esc(route.category)}</span>`;
  if (route.notice) { dataNotice.hidden = false; dataNotice.textContent = route.notice; }

  const directionLabel = direction => direction.from && direction.to ? `${direction.from} → ${direction.to}` : direction.name || '方向资料待补充';
  directionPicker.innerHTML = route.directions.map((direction, index) => `<button class="${index === 0 ? 'active' : ''}" type="button" data-index="${index}">${esc(directionLabel(direction))}</button>`).join('');

  function renderStations(directionIndex) {
    const direction = route.directions[directionIndex];
    if (!direction) {
      $('#station-total').textContent = '暂无站点数据';
      stationList.innerHTML = '';
      return;
    }
    const stations = direction.stations;
    const time = direction.firstTime || direction.lastTime ? ` · ${esc(direction.firstTime || '?')}–${esc(direction.lastTime || '?')}` : '';
    $('#station-total').innerHTML = `${stations.length} 站 · ${esc(directionLabel(direction))}${time}`;
    stationList.innerHTML = stations.map((station, index) => `<li class="${index === 0 ? 'first' : ''} ${index === stations.length - 1 ? 'last' : ''}"><span class="station-sequence">${String(index + 1).padStart(2, '0')}</span><span class="track" aria-hidden="true"><i></i></span><div class="station-content"><span class="station-name"><b>${esc(station.name)}</b>${index === 0 ? '<small>起点站</small>' : index === stations.length - 1 ? '<small>终点站</small>' : ''}</span>${transferHtml(station.name)}</div></li>`).join('');
  }
  directionPicker.addEventListener('click', event => {
    const button = event.target.closest('button[data-index]');
    if (!button) return;
    directionPicker.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    renderStations(Number(button.dataset.index));
  });
  renderStations(0);
  detail.hidden = false;
})();
