// Each name matches a file in charts and a chart container in the index.html
const charts = [
  '01-arrivals', '02-region-map', '03-symbol-map', '04-flow-map',
  '05-market-bars', '06-purpose-heatmap', '07-purpose-waffle', '08-treemap',
  '09-nightly-spend', '10-market-scatter', '11-spending-ranks', '12-spending-waterfall'
];

window.chartViews = {};

async function mount(name) {
  const id = 'chart-' + name.slice(0, 2);
  const element = document.getElementById(id);
  const specificationURL = 'charts/' + name + '.vg.json';

  try {
    const response = await fetch(specificationURL);
    if (!response.ok) throw new Error('Specification unavailable: ' + specificationURL);
    const spec = await response.json();

    if (name === '08-treemap') spec.width = Math.max(240, element.clientWidth);
    if (spec.projection && name !== '04-flow-map') {
      spec.projection.scale = Math.min(480, element.clientWidth);
    }

    const result = await vegaEmbed(element, spec, {actions: false, renderer: 'svg'});
    window.chartViews[id] = result.view;

  } catch (error) {
    element.innerHTML = '<p class="chart-error">This chart could not load. Please refresh the page.</p>';
    console.error(name, error);
  }
}

Promise.all(charts.map(mount));

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    for (const [id, view] of Object.entries(window.chartViews)) {
      const element = document.getElementById(id);
      if (id === 'chart-08') view.width(Math.max(240, element.clientWidth));
      view.resize().runAsync();
    }
  }, 250);
});
